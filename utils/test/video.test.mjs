import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, existsSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildRequest, videoResults, providers} from '../lib/providers.mjs';
import {execute, openrouterJobResult} from '../lib/runtime.mjs';
import {run, argumentsFor} from '../lib/cli.mjs';

// A few bytes that look like an MP4 (an ftyp box at offset 4), enough for the format sniff.
const mp4 = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypisom'), Buffer.alloc(16)]);
const json = body => new Response(JSON.stringify(body), {headers: {'content-type': 'application/json'}});
function temporary(t) { const dir = mkdtempSync(join(tmpdir(), 'tdm155ai-video-')); t.after(() => rmSync(dir, {recursive: true, force: true})); return dir; }
const env = Object.fromEntries(Object.values(providers).map(p => [p.key, `test-${p.key}`]));
const config = {env, file: '/not-a-real-env'};
const refs = [{url: 'https://example.test/frame.png'}];

test('video requests map the shared options onto OpenRouter jobs and fal endpoints', () => {
  const router = buildRequest('video', 'openrouter', 'google/veo-3.1-lite', 'A cat', {duration: 4, aspect: '16:9', resolution: '720p', audio: false, seed: 3}, refs);
  assert.equal(router.url, 'https://openrouter.ai/api/v1/videos');
  assert.deepEqual(router.body, {model: 'google/veo-3.1-lite', prompt: 'A cat', duration: 4, aspect_ratio: '16:9', resolution: '720p', generate_audio: false, seed: 3,
    frame_images: [{type: 'image_url', image_url: {url: refs[0].url}, frame_type: 'first_frame'}]});
  assert.equal(buildRequest('video', 'openrouter', 'm', 'p', {'ref-field': 'last_frame'}, refs).body.frame_images[0].frame_type, 'last_frame');
  assert.deepEqual(buildRequest('video', 'openrouter', 'm', 'p', {'ref-field': 'reference'}, refs).body.input_references, [{type: 'image_url', image_url: {url: refs[0].url}}]);
  assert.throws(() => buildRequest('video', 'openrouter', 'm', 'p', {'ref-field': 'image_url'}, refs), /first_frame/);
  assert.throws(() => buildRequest('video', 'openrouter', 'm', 'p', {fps: 24}), /not mapped/);

  const fal = buildRequest('video', 'fal', 'fal-ai/ltx-2.3/image-to-video/fast', 'A cat', {duration: 6, fps: 25, audio: true}, refs, {enable_safety_checker: false});
  assert.equal(fal.url, 'https://queue.fal.run/fal-ai/ltx-2.3/image-to-video/fast');
  assert.deepEqual(fal.body, {enable_safety_checker: false, prompt: 'A cat', duration: 6, fps: 25, generate_audio: true, image_url: refs[0].url});
  assert.deepEqual(buildRequest('video', 'fal', 'a/b', 'p', {'ref-field': 'image_urls'}, [...refs, ...refs]).body.image_urls, [refs[0].url, refs[0].url]);
  assert.throws(() => buildRequest('video', 'fal', 'a/b', 'p', {}, [...refs, ...refs]), /one reference/);
  assert.throws(() => buildRequest('video', 'fal', 'a/b', 'p', {size: '1280x720'}), /not mapped/);
  assert.throws(() => buildRequest('video', 'fal', 'https://elsewhere.test', 'p'), /endpoint ID/);
  assert.throws(() => buildRequest('video', 'huit-gemini', 'm', 'p'), /openrouter and fal only/);
});

test('video results come from an OpenRouter job or a fal response, and only OpenRouter downloads carry the key', () => {
  assert.deepEqual(videoResults({status: 'completed', unsigned_urls: ['https://openrouter.ai/api/v1/videos/j/content?index=0']}), [{url: 'https://openrouter.ai/api/v1/videos/j/content?index=0', auth: true}]);
  assert.deepEqual(videoResults({video: {url: 'https://v3.fal.media/files/clip.mp4'}}), [{url: 'https://v3.fal.media/files/clip.mp4', auth: false}]);
  assert.deepEqual(videoResults({videos: [{url: 'https://v3.fal.media/a.mp4'}, {}]}), [{url: 'https://v3.fal.media/a.mp4', auth: false}]);
  assert.deepEqual(videoResults({images: []}), []);
});

test('OpenRouter video: submit once, save the receipt, poll until completed, download with the key, resume with GET only', async t => {
  const dir = temporary(t); const calls = []; let polls = 0;
  const fetcher = async (url, init = {}) => {
    calls.push(`${init.method || 'GET'} ${url}`);
    if (init.method === 'POST') { assert.equal(init.headers.Authorization, 'Bearer test-OPENROUTER_API_KEY'); assert.equal(JSON.parse(init.body).prompt, 'A cat'); return json({id: 'job1', polling_url: 'https://openrouter.ai/api/v1/videos/job1', status: 'pending'}); }
    if (url === 'https://openrouter.ai/api/v1/videos/job1') { assert.equal(init.headers.Authorization, 'Bearer test-OPENROUTER_API_KEY'); return json(++polls < 2 ? {id: 'job1', status: 'in_progress'} : {id: 'job1', status: 'completed', unsigned_urls: ['https://openrouter.ai/api/v1/videos/job1/content?index=0'], usage: {cost: 0.2}}); }
    if (url.startsWith('https://openrouter.ai/api/v1/videos/job1/content')) { assert.equal(init.headers.Authorization, 'Bearer test-OPENROUTER_API_KEY'); return new Response(mp4, {headers: {'content-type': 'video/mp4'}}); }
    assert.fail(`unexpected ${url}`);
  };
  const deps = {fetcher, progress: () => {}, sleep: async () => {}};
  const request = buildRequest('video', 'openrouter', 'google/veo-3.1-lite', 'A cat', {duration: 4});
  const result = await execute('video', request, config, join(dir, 'first'), {}, deps);
  assert.deepEqual(readFileSync(join(dir, 'first/video-01.mp4')), mp4);
  assert.deepEqual(result.videos, [join(dir, 'first/video-01.mp4')]);
  const receipt = JSON.parse(readFileSync(join(dir, 'first/openrouter-request.json'), 'utf8'));
  assert.equal(receipt.kind, 'video'); assert.equal(receipt.id, 'job1'); assert.equal(receipt.model, 'google/veo-3.1-lite');
  assert.ok(!readFileSync(join(dir, 'first/request.json'), 'utf8').includes('test-OPENROUTER_API_KEY'));
  polls = 5;
  await execute('video', {provider: 'openrouter', model: receipt.model}, config, join(dir, 'resumed'), {receipt}, deps);
  assert.equal(calls.filter(c => c.startsWith('POST')).length, 1);
  assert.ok(existsSync(join(dir, 'resumed/video-01.mp4')));
  await assert.rejects(() => openrouterJobResult({polling_url: 'https://attacker.example/api/v1/videos/x'}, {}), /Invalid OpenRouter/);
  await assert.rejects(() => openrouterJobResult({polling_url: 'https://openrouter.ai/api/v1/videos/bad'}, {}, {fetcher: async () => json({status: 'failed', error: 'Content policy violation'}), sleep: async () => {}}), /failed: Content policy violation/);
});

test('fal video: queue, poll, download the clip without the key', async t => {
  const dir = temporary(t); const methods = [];
  const fetcher = async (url, init = {}) => {
    methods.push(init.method || 'GET');
    if (url === 'https://v3.fal.media/files/clip.mp4') { assert.equal(init.headers, undefined); return new Response(mp4, {headers: {'content-type': 'video/mp4'}}); }
    assert.equal(init.headers.Authorization, 'Key test-FAL_API_KEY');
    if (init.method === 'POST') return json({request_id: 'r1', status_url: 'https://queue.fal.run/s', response_url: 'https://queue.fal.run/r'});
    if (url.endsWith('/s')) return json({status: 'COMPLETED'});
    return json({video: {url: 'https://v3.fal.media/files/clip.mp4', content_type: 'video/mp4'}});
  };
  const request = buildRequest('video', 'fal', 'fal-ai/ltx-2.3/text-to-video/fast', 'A cat', {duration: 6});
  const result = await execute('video', request, config, join(dir, 'run'), {}, {fetcher, progress: () => {}, sleep: async () => {}});
  assert.deepEqual(readFileSync(result.videos[0]), mp4);
  assert.equal(methods.filter(m => m === 'POST').length, 1);
  assert.equal(JSON.parse(readFileSync(join(dir, 'run/fal-request.json'), 'utf8')).kind, 'video');
});

test('video CLI: integer and boolean flags are checked, reference URLs must be HTTPS, dry run touches nothing', async t => {
  const dir = temporary(t), out = join(dir, 'never');
  assert.throws(() => argumentsFor('video', ['--duration', 'abc']), /positive integer/);
  assert.throws(() => argumentsFor('video', ['--seed=-1']), /nonnegative integer/);
  assert.throws(() => argumentsFor('video', ['--seed', '1.5']), /nonnegative integer/);
  assert.throws(() => argumentsFor('video', ['--audio', 'maybe']), /true or false/);
  assert.equal(argumentsFor('video', ['--audio', 'false', '--seed', '0']).values.audio, false);
  await assert.rejects(() => run('video', ['fal', 'hello', '--model', 'a/b', '--ref-url', 'http://plain.test/x.png', '--dry-run'], {env: {}, stdout: () => {}}), /HTTPS/);
  await assert.rejects(() => run('video', ['huit-gemini', 'hello', '--model', 'm', '--dry-run'], {env: {}, stdout: () => {}}), /openrouter and fal only/);
  const preview = await run('video', ['openrouter', 'hello', '--model', 'google/veo-3.1-lite', '--ref-url', 'https://example.test/x.png', '--out', out, '--dry-run'], {env: {}, stdout: () => {}, fetcher: () => assert.fail('network in dry run')});
  assert.equal(preview.network, false); assert.ok(!existsSync(out));
  assert.equal(preview.body.frame_images[0].image_url.url, 'https://example.test/x.png');
  assert.deepEqual(preview.references, ['https://example.test/x.png']);
});
