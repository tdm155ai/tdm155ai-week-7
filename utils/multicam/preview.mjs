import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { run, probe } from './core.mjs';

export async function preview(manifestPath) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.status !== 'matched' || manifest.sources.some(s => !Number.isFinite(s.offsetSeconds))) throw new Error('Preview needs a version 1 matched manifest with numeric offsets.');
  const folder = path.dirname(path.resolve(manifestPath));
  const destination = path.join(folder, 'check.mp4');
  // Refuse before changing manifest status when a check already exists.
  try { await fs.access(destination); throw new Error('check.mp4 already exists; keep it or use a new session.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const cameras = manifest.sources.filter(s => s.timing.videoStreamIndex !== null);
  const master = manifest.sources.find(s => s.id === manifest.masterAudio.sourceId);
  try {
    if (!cameras.length) throw new Error('No video streams for a check preview.');
    if (!master?.timing.audioRange) throw new Error('Master audio stream missing.');
    const ranges = cameras.map(s => ({ source: s, range: s.timing.videoRange }));
    ranges.push({ source: master, range: master.timing.audioRange });
    const start = Math.max(manifest.anchorTimelineSeconds - 1, ...ranges.map(({ source, range }) => range.startSeconds + source.offsetSeconds));
    const end = Math.min(manifest.anchorTimelineSeconds + 1.5, ...ranges.map(({ source, range }) => range.endSeconds === null ? Infinity : range.endSeconds + source.offsetSeconds));
    if (!(end - start > 0.2) || manifest.anchorTimelineSeconds < start || manifest.anchorTimelineSeconds >= end) throw new Error('No common playable range around the matched event.');
    const inputs = [...cameras];
    if (!inputs.includes(master)) inputs.push(master);
    const args = ['-v', 'error', '-nostdin', '-n', '-copyts'];
    for (const source of inputs) args.push('-ss', String(Math.max(0, start - source.offsetSeconds)), '-i', source.path);
    const filters = [];
    for (let i = 0; i < cameras.length; i++) {
      const s = cameras[i];
      const pts = start - s.offsetSeconds + s.timing.originPtsSeconds;
      filters.push(`[${i}:${s.timing.videoStreamIndex}]trim=start=${pts}:end=${pts + end - start},setpts=PTS-(${pts})/TB,scale=480:270:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=480:270:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}]`);
    }
    if (cameras.length > 1) filters.push(`${cameras.map((_, i) => `[v${i}]`).join('')}hstack=inputs=${cameras.length}:shortest=1[v]`);
    const apts = start - master.offsetSeconds + master.timing.originPtsSeconds;
    filters.push(`[${inputs.indexOf(master)}:${manifest.masterAudio.streamIndex}]atrim=start=${apts}:end=${apts + end - start},asetpts=PTS-(${apts})/TB,aresample=48000:async=1:first_pts=0[a]`);
    args.push('-filter_complex', filters.join(';'), '-map', cameras.length > 1 ? '[v]' : '[v0]', '-map', '[a]', '-t', String(end - start), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', destination);
    run('ffmpeg', args);
    const checked = probe(destination);
    if (!checked.streams.some(s => s.codec_type === 'video') || !checked.streams.some(s => s.codec_type === 'audio')) throw new Error('Preview missing video or audio after encoding.');
    manifest.preview = { status: 'created', path: 'check.mp4', timelineStartSeconds: start, timelineEndSeconds: end, sourceIds: cameras.map(s => s.id), audioSourceId: master.id, durationSeconds: Number(checked.format.duration), humanChecked: false };
    console.log(`Preview: ${destination}`);
  } catch (error) {
    manifest.preview = { status: 'failed', reason: error.message };
    throw error;
  } finally {
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  return manifest.preview;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (!process.argv[2] || process.argv[2] === '--help') console.log('node utils/multicam/preview.mjs output/multicam/<session>/manifest.json');
  else preview(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });
}
