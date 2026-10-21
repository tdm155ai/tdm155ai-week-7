import { spawnSync } from 'node:child_process';
import path from 'node:path';

export const RATE = 8000;
export const ANALYSIS = { method: 'transient + normalized waveform/context correlation', sampleRate: RATE, maxCandidates: 12, minFullCorrelation: 0.65, minContextCorrelation: 0.55, minScoreMargin: 0.12 };
export function run(command, args, binary = false) {
  const result = spawnSync(command, args, { encoding: binary ? null : 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`${command}: ${result.error?.message || result.stderr?.toString().slice(-4000) || `exit ${result.status}`}`);
  return result.stdout;
}
export const number = value => value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
export function parseTime(value) {
  if (!/^\d+(?::\d{1,2}){0,2}(?:\.\d+)?$/.test(value)) throw new Error(`Invalid time: ${value}`);
  const parts = value.split(':').map(Number);
  if (parts.slice(1).some(n => n >= 60)) throw new Error(`Invalid time: ${value}`);
  return parts.reduce((sum, n) => sum * 60 + n, 0);
}
export function parseSource(spec, index) {
  const split = spec.lastIndexOf('@');
  if (split < 1) throw new Error(`Expected file@start-end: ${spec}`);
  const bounds = spec.slice(split + 1).split('-');
  if (bounds.length !== 2) throw new Error(`Expected one window: ${spec}`);
  const [startSeconds, endSeconds] = bounds.map(parseTime);
  if (endSeconds - startSeconds < 1.2 || endSeconds - startSeconds > 180) throw new Error('Windows must span 1.2–180 seconds.');
  return { id: `cam${index + 1}`, path: path.resolve(spec.slice(0, split)), searchWindow: { startSeconds, endSeconds }, offsetSeconds: null, eventSourceSeconds: null, proxy: null };
}
export function probe(file) {
  return JSON.parse(run('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file]));
}
export function inspect(source) {
  const { format, streams } = probe(source.path);
  const starts = streams.map(s => number(s.start_time)).filter(n => n !== null);
  const origin = number(format.start_time) ?? (starts.length ? Math.min(...starts) : 0);
  const audio = streams.find(s => s.codec_type === 'audio');
  const video = streams.find(s => s.codec_type === 'video' && !s.disposition?.attached_pic);
  function range(stream) {
    if (!stream) return null;
    const startSeconds = (number(stream.start_time) ?? origin) - origin;
    const duration = number(stream.duration);
    return { startSeconds, endSeconds: duration === null ? number(format.duration) : startSeconds + duration, endEstimated: duration === null };
  }
  source.timing = { originPtsSeconds: origin, audioStreamIndex: audio?.index ?? null, videoStreamIndex: video?.index ?? null, audioRange: range(audio), videoRange: range(video), format, streams };
  return source;
}
export function extract(source) {
  const { startSeconds, endSeconds } = source.searchWindow;
  const absoluteStart = source.timing.originPtsSeconds + startSeconds;
  const absoluteEnd = source.timing.originPtsSeconds + endSeconds;
  const buffer = run('ffmpeg', ['-v', 'error', '-nostdin', '-copyts', '-ss', String(startSeconds), '-i', source.path, '-map', `0:${source.timing.audioStreamIndex}`, '-vn', '-af', `atrim=start=${absoluteStart}:end=${absoluteEnd},asetpts=PTS-(${absoluteStart})/TB,aresample=${RATE}:async=1:first_pts=0`, '-t', String(endSeconds - startSeconds), '-ac', '1', '-ar', String(RATE), '-f', 'f32le', 'pipe:1'], true);
  const samples = new Float32Array(buffer.length / 4);
  for (let i = 0; i < samples.length; i++) samples[i] = buffer.readFloatLE(i * 4);
  return samples;
}
export function transients(samples) {
  const block = 80;
  const rms = [];
  for (let i = 0; i + block <= samples.length; i += block) {
    let power = 0;
    for (let j = i; j < i + block; j++) power += samples[j] ** 2;
    rms.push(Math.sqrt(power / block));
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 0;
  const candidates = [];
  for (let i = 20; i < rms.length - 20; i++) {
    const previous = rms.slice(Math.max(0, i - 20), i - 1);
    const baseline = Math.max(0.001, previous.reduce((a, b) => a + b, 0) / previous.length);
    if (rms[i] < Math.max(0.008, median * 3) || rms[i] / baseline < 3) continue;
    let peak = i * block;
    for (let j = peak; j < (i + 1) * block; j++) if (Math.abs(samples[j]) > Math.abs(samples[peak])) peak = j;
    candidates.push({ sample: peak, strength: rms[i] / baseline });
  }
  const selected = [];
  for (const candidate of candidates.sort((a, b) => b.strength - a.strength)) {
    if (selected.every(c => Math.abs(c.sample - candidate.sample) > RATE * 0.3)) selected.push(candidate);
    if (selected.length === ANALYSIS.maxCandidates) break;
  }
  return selected;
}
function correlation(a, b, ai, bi, excludeClap = false, stride = 4) {
  const radius = Math.min(4000, ai, bi, a.length - ai - 1, b.length - bi - 1);
  if (radius < 1600) return 0;
  let xy = 0, xx = 0, yy = 0, sx = 0, sy = 0, n = 0;
  for (let k = -radius; k <= radius; k += stride) {
    if (excludeClap && Math.abs(k) < 480) continue;
    const x = a[ai + k], y = b[bi + k];
    xy += x * y; xx += x * x; yy += y * y; sx += x; sy += y; n++;
  }
  xx -= sx * sx / n; yy -= sy * sy / n; xy -= sx * sy / n;
  if (xx / n < 1e-7 || yy / n < 1e-7) return 0;
  return Math.min(1, Math.abs(xy / Math.sqrt(xx * yy)));
}
export function match(reference, source, refSamples, samples, refPeaks, peaks) {
  const pairs = [];
  for (const a of refPeaks) for (const b of peaks) {
    let best = { score: -1, lag: 0 };
    const evaluate = lag => {
      const fullCorrelation = correlation(refSamples, samples, a.sample, b.sample + lag);
      const contextCorrelation = correlation(refSamples, samples, a.sample, b.sample + lag, true);
      const score = Math.min(fullCorrelation, contextCorrelation);
      if (score > best.score) best = { score, lag, fullCorrelation, contextCorrelation };
    };
    for (let lag = -200; lag <= 200; lag += 8) evaluate(lag);
    const coarse = best.lag;
    for (let lag = coarse - 7; lag <= coarse + 7; lag++) evaluate(lag);
    const referenceEventSeconds = reference.searchWindow.startSeconds + a.sample / RATE;
    const sourceEventSeconds = source.searchWindow.startSeconds + (b.sample + best.lag) / RATE;
    pairs.push({ referenceEventSeconds, sourceEventSeconds, offsetSeconds: referenceEventSeconds - sourceEventSeconds, fullCorrelation: best.fullCorrelation, contextCorrelation: best.contextCorrelation, score: best.score });
  }
  const candidates = [];
  for (const pair of pairs.sort((a, b) => b.score - a.score)) {
    if (candidates.every(c => Math.abs(c.offsetSeconds - pair.offsetSeconds) > 0.05)) candidates.push(pair);
  }
  const best = candidates[0];
  let status = 'matched', reason = 'Distinct transient match confirmed by surrounding audio.';
  if (!best || best.fullCorrelation < ANALYSIS.minFullCorrelation || best.contextCorrelation < ANALYSIS.minContextCorrelation) {
    status = 'weak'; reason = 'No shared transient with sufficient surrounding-audio agreement; narrow windows or synchronize manually.';
  } else if (candidates[1] && best.score - candidates[1].score < ANALYSIS.minScoreMargin) {
    status = 'ambiguous'; reason = 'Multiple offsets have similar evidence; narrow the windows around one shared event.';
  }
  return { status, reason, candidates: candidates.slice(0, 12), transients: peaks.map(p => ({ sourceSeconds: source.searchWindow.startSeconds + p.sample / RATE, strength: p.strength })) };
}
