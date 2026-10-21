import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run, probe, parseSource } from '../multicam/core.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = path.join(root, 'output/multicam');
const prefix = `test-a1-${Date.now()}`;
let folder;
test.before(async () => { await fs.mkdir(output, { recursive: true }); folder = await fs.mkdtemp(path.join(output, `${prefix}-fixtures-`)); });
// Retain ignored fixtures/previews for visual inspection; never commit generated media.
function fixture(name, event, { pts = 0, audioDelay = 0, missing = false, repeated = false, isolated = false, different = false } = {}) {
  const file = path.join(folder, `${name}.mov`);
  const time = repeated ? 'mod(t,2)' : `(t-${event - audioDelay})`;
  const context = isolated ? '0' : `0.035*sin(2*PI*(${different ? 731 : 173}*${time}+47*${time}*${time}+11*${time}*${time}*${time}))`;
  const click = missing ? '0' : repeated ? '0.8*exp(-900*mod(t,2))*sin(2*PI*1200*t)' : `0.8*exp(-900*abs(t-${event - audioDelay}))*cos(2*PI*1200*(t-${event - audioDelay}))`;
  run('ffmpeg', ['-v', 'error', '-nostdin', '-n', '-f', 'lavfi', '-i', `color=c=black:s=160x90:r=30:d=8,drawbox=color=white:t=fill:enable='between(t,${event},${event + 0.1})'`, '-f', 'lavfi', '-i', `aevalsrc='${context}+${click}':s=48000:d=8`, '-filter_complex', `[0:v]setpts=PTS+${pts}/TB[v];[1:a]asetpts=PTS+${pts + audioDelay}/TB[a]`, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'pcm_s16le', '-copyts', '-fps_mode', 'passthrough', file]);
  return file;
}
async function syncCase(name, specs, extra = []) {
  const session = `${prefix}-${name}`;
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(process.execPath, ['utils/multicam/sync.mjs', ...specs, '--session', session, ...extra], { cwd: root, encoding: 'utf8' });
  const manifestPath = path.join(output, session, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  return { result, manifest, manifestPath };
}
test('source windows parse minutes and reject unsafe/invalid ranges', () => {
  assert.deepEqual(parseSource('name@with at.mov@2:00-3:00', 0).searchWindow, { startSeconds: 120, endSeconds: 180 });
  for (const spec of ['a@1:99-3:00', 'a@2-1', 'a@0-999', 'a']) assert.throws(() => parseSource(spec, 0));
});
test('both offset signs, nonzero timestamps, differing windows, and preview flash/audio alignment', async t => {
  const a = fixture('a', 3, { pts: 5, audioDelay: 0.125 });
  const b = fixture('b', 5, { pts: 9, audioDelay: 0.25 });
  const c = fixture('c', 2, { pts: 2 });
  const before = await Promise.all([a, b, c].map(f => fs.stat(f).then(s => [s.size, s.mtimeMs])));
  const { result, manifest, manifestPath } = await syncCase('known', [`${a}@1-5`, `${b}@3-7`, `${c}@0-4`]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  for (const [i, expected] of [[1, -2], [2, 1]]) {
    const error = Math.abs(manifest.sources[i].offsetSeconds - expected);
    t.diagnostic(`${manifest.sources[i].id}: expected ${expected}s, measured ${manifest.sources[i].offsetSeconds}s, error ${error}s`);
    assert.ok(error <= 0.002, `offset error ${error}`);
  }
  assert.equal(manifest.sources[0].timing.originPtsSeconds, 5);
  assert.equal(manifest.sources[0].timing.audioRange.startSeconds, 0.125);
  assert.equal(manifest.drift.status, 'unverified');
  assert.deepEqual(manifest.cuts, []);
  const saved = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  assert.equal(saved.preview.status, 'created');
  const movie = path.join(path.dirname(manifestPath), saved.preview.path);
  const meta = probe(movie);
  assert.equal(meta.streams.filter(s => s.codec_type === 'audio').length, 1);
  assert.equal(meta.streams.find(s => s.codec_type === 'video').width, 1440);
  // Decode each panel to one grayscale pixel per frame; flashes must coincide.
  const flashes = [];
  for (let panel = 0; panel < 3; panel++) {
    const frames = run('ffmpeg', ['-v', 'error', '-i', movie, '-vf', `crop=480:270:${panel * 480}:0,scale=1:1`, '-pix_fmt', 'gray', '-f', 'rawvideo', 'pipe:1'], true);
    const first = frames.findIndex(v => v > 180);
    assert.ok(first >= 0); flashes.push(first / 30);
  }
  assert.ok(Math.max(...flashes) - Math.min(...flashes) <= 1 / 30, JSON.stringify(flashes));
  const audio = run('ffmpeg', ['-v', 'error', '-i', movie, '-map', '0:a:0', '-ac', '1', '-ar', '8000', '-f', 'f32le', 'pipe:1'], true);
  let peak = 0;
  for (let i = 0; i < audio.length; i += 4) if (Math.abs(audio.readFloatLE(i)) > Math.abs(audio.readFloatLE(peak))) peak = i;
  const audioTime = peak / 4 / 8000;
  assert.ok(Math.abs(audioTime - flashes[0]) <= 1 / 30, `audio ${audioTime}, flashes ${flashes}`);
  t.diagnostic(`preview flash times ${flashes}; audio peak ${audioTime}s; preview ${movie}`);
  const after = await Promise.all([a, b, c].map(f => fs.stat(f).then(s => [s.size, s.mtimeMs])));
  assert.deepEqual(after, before);
  // Reusing a session must refuse, with originals and prior manifest intact.
  const previous = await fs.readFile(manifestPath, 'utf8');
  const { result: rerun } = await syncCase('known', [`${a}@1-5`, `${b}@3-7`]);
  assert.equal(rerun.status, 1);
  assert.equal(await fs.readFile(manifestPath, 'utf8'), previous);
});
test('reference selection reverses offset sign', async () => {
  const a = path.join(folder, 'a.mov'), b = path.join(folder, 'b.mov');
  const { result, manifest } = await syncCase('reference', [`${a}@1-5`, `${b}@3-7`], ['--reference', 'cam2', '--master-audio', 'cam2', '--no-preview']);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.ok(Math.abs(manifest.sources[0].offsetSeconds - 2) <= 0.002);
  assert.equal(manifest.sources[1].offsetSeconds, 0);
});
test('missing clap and mismatched surroundings leave offset unresolved', async () => {
  for (const options of [{ missing: true }, { different: true }, { isolated: true }]) {
    const name = Object.keys(options)[0];
    const b = fixture(name, 5, options);
    const { result, manifest } = await syncCase(name, [`${path.join(folder, 'a.mov')}@1-5`, `${b}@3-7`]);
    assert.equal(result.status, 2, result.stderr + result.stdout);
    assert.equal(manifest.sources[1].offsetSeconds, null);
    assert.equal(manifest.status, 'needs-review');
    assert.equal(manifest.preview.status, 'not-created');
  }
});
test('repeated indistinguishable claps report ambiguity and candidate offsets', async () => {
  const a = fixture('repeated-a', 2, { repeated: true });
  const b = fixture('repeated-b', 2, { repeated: true });
  const { result, manifest } = await syncCase('ambiguous', [`${a}@0-8`, `${b}@0-8`]);
  assert.equal(result.status, 2, result.stderr + result.stdout);
  assert.equal(manifest.sources[1].match.status, 'ambiguous');
  assert.ok(manifest.sources[1].match.candidates.length > 1);
});
test('shared noise survives AAC encoding, gain/polarity changes and fractional offsets; audio-only reference works', async t => {
  const master = path.join(folder, 'noise-master.wav');
  run('ffmpeg', ['-v', 'error', '-n', '-f', 'lavfi', '-i', 'anoisesrc=color=pink:amplitude=0.08:sample_rate=48000:duration=9:seed=155', '-f', 'lavfi', '-i', "aevalsrc='0.8*exp(-900*abs(t-4))*cos(2*PI*1200*(t-4))':s=48000:d=9", '-filter_complex', '[0:a][1:a]amix=normalize=0[a]', '-map', '[a]', '-c:a', 'pcm_s16le', master]);
  const camera = path.join(folder, 'noise-camera.mp4');
  run('ffmpeg', ['-v', 'error', '-n', '-f', 'lavfi', '-i', 'testsrc2=s=160x90:r=30:d=7', '-ss', '1.137', '-i', master, '-map', '0:v', '-map', '1:a', '-af', 'volume=-0.6', '-t', '7', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', '-b:a', '128k', camera]);
  const { result, manifest, manifestPath } = await syncCase('noise', [`${master}@2-6`, `${camera}@1-5`]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const error = Math.abs(manifest.sources[1].offsetSeconds - 1.137);
  assert.ok(error <= 0.002, `offset error ${error}`);
  t.diagnostic(`AAC/pink noise: measured ${manifest.sources[1].offsetSeconds}s, error ${error}s, quality ${manifest.sources[1].match.candidates[0].score}`);
  const saved = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  assert.deepEqual(saved.preview.sourceIds, ['cam2']);
  assert.equal(saved.preview.audioSourceId, 'cam1');
});
test('silent and audio-less cameras fail clearly without guessed offsets', async () => {
  for (const silent of [false, true]) {
    const name = silent ? 'silent' : 'noaudio';
    const camera = path.join(folder, `${name}.mp4`);
    const args = ['-v', 'error', '-n', '-f', 'lavfi', '-i', 'color=s=160x90:r=30:d=8'];
    if (silent) args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono:d=8', '-c:a', 'aac');
    args.push('-c:v', 'libx264', '-preset', 'ultrafast', camera);
    run('ffmpeg', args);
    const { result, manifest } = await syncCase(name, [`${path.join(folder, 'a.mov')}@1-5`, `${camera}@2-6`]);
    assert.equal(result.status, 2, result.stderr + result.stdout);
    assert.equal(manifest.sources[1].offsetSeconds, null);
    if (!silent) assert.match(manifest.sources[1].match.reason, /no audio stream/);
  }
});
