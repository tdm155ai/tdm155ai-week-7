import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ANALYSIS, parseSource, inspect, extract, transients, match } from './core.mjs';
import { preview } from './preview.mjs';

export async function sync(argv) {
  const options = { reference: 'cam1', 'master-audio': 'cam1', session: `session-${Date.now()}` };
  const specs = [];
  let makePreview = true;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--no-preview') makePreview = false;
    else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (!(key in options) || !argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`Unknown or incomplete option: ${arg}`);
      options[key] = argv[++i];
    } else specs.push(arg);
  }
  if (specs.length < 2) throw new Error('Provide at least two file@start-end arguments. Use --help for an example.');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(options.session)) throw new Error('Session must be 1–80 letters, digits, hyphens or underscores, starting with a letter/digit.');
  const sources = specs.map(parseSource).map(inspect);
  const reference = sources.find(s => s.id === options.reference);
  const master = sources.find(s => s.id === options['master-audio']);
  if (!reference || !master) throw new Error('Reference and master audio must name a supplied source ID (cam1, cam2, …).');
  if (master.timing.audioStreamIndex === null) throw new Error('Selected master audio source has no audio stream.');
  const folder = path.resolve('output/multicam', options.session);
  await fs.mkdir(path.dirname(folder), { recursive: true });
  await fs.mkdir(folder); // Never reuse a session or overwrite its media.
  const analyses = sources.map(s => {
    if (s.timing.audioStreamIndex === null) return { samples: new Float32Array(), peaks: [] };
    const samples = extract(s);
    return { samples, peaks: transients(samples) };
  });
  const ref = analyses[sources.indexOf(reference)];
  reference.offsetSeconds = 0;
  reference.match = { status: 'reference', reason: 'Timeline origin; no independent sync claim.', candidates: [], transients: ref.peaks.map(p => ({ sourceSeconds: reference.searchWindow.startSeconds + p.sample / ANALYSIS.sampleRate, strength: p.strength })) };
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    if (source === reference) continue;
    source.match = match(reference, source, ref.samples, analyses[i].samples, ref.peaks, analyses[i].peaks);
    if (source.timing.audioStreamIndex === null || reference.timing.audioStreamIndex === null) source.match.reason = 'Source or reference has no audio stream; synchronize manually using a visible event.';
    if (source.match.status === 'matched') {
      source.offsetSeconds = source.match.candidates[0].offsetSeconds;
      source.eventSourceSeconds = source.match.candidates[0].sourceEventSeconds;
    }
  }
  const anchor = sources.find(s => s.match.status === 'matched')?.match.candidates[0].referenceEventSeconds ?? null;
  reference.eventSourceSeconds = anchor;
  const manifest = {
    schemaVersion: 1, sessionId: options.session, createdAt: new Date().toISOString(),
    status: sources.every(s => s.offsetSeconds !== null) ? 'matched' : 'needs-review',
    referenceSourceId: reference.id, masterAudio: { sourceId: master.id, streamIndex: master.timing.audioStreamIndex },
    sources, analysis: ANALYSIS, anchorTimelineSeconds: anchor,
    drift: { status: 'unverified', note: 'Only a local event was matched. Check a second event near the end before claiming whole-take sync.' },
    preview: { status: 'not-created' }, cuts: [],
  };
  const manifestPath = path.join(folder, 'manifest.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
  for (const source of sources) {
    console.log(`${source.id}: ${source.match.status}; offset ${source.offsetSeconds === null ? 'unresolved' : `${source.offsetSeconds.toFixed(6)} s`}; quality ${source.match.candidates[0]?.score.toFixed(3) ?? 'n/a'}`);
    if (source.offsetSeconds === null) {
      console.log(source.match.reason);
      console.log(JSON.stringify(source.match.candidates, null, 2));
    }
  }
  console.log(`Manifest: ${manifestPath}\nDrift: unverified.`);
  if (makePreview && manifest.status === 'matched') await preview(manifestPath);
  return { manifest, manifestPath, exitCode: manifest.status === 'matched' ? 0 : 2 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (process.argv.includes('--help')) console.log("node utils/multicam/sync.mjs 'cam-a.mov@2:00-3:00' 'cam-b.mov@5:00-7:00' [--reference cam1] [--master-audio cam1] [--session name] [--no-preview]");
  else sync(process.argv.slice(2)).then(result => { process.exitCode = result.exitCode; }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
