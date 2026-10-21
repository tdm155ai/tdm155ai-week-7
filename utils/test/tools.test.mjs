import test from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {normalize, isCorrect, firstLine, buildResultsMarkdown} from '../lib/batch.mjs';
import {textModels, filterModels, run as listTextModels} from '../list-text-models.mjs';
import {run as listImageModels} from '../list-image-models.mjs';
import {modelsOfType, fetchModels as fetchOpenRouterModels, run as listOpenRouterModels} from '../list-openrouter-models.mjs';
import {filterModels as filterFalModels, fetchModels as fetchFalModels, run as listFalModels} from '../list-fal-models.mjs';
import {evenTimestamps, everyTimestamps, formatTimestamp, parseTimestamp, frameCommands, tileGrid, contactSheetCommand, durationCommand} from '../lib/stills.mjs';

// --- batch-text: correctness matching and table building ---

test('isCorrect strips commas and spaces before a substring match', () => {
  assert.equal(isCorrect('Paris', 'Paris'), true);
  assert.equal(isCorrect('  Paris, France', 'Paris'), true);
  assert.equal(isCorrect('P a r i s', 'Paris'), true);
  assert.equal(isCorrect('London', 'Paris'), false);
  assert.equal(isCorrect('answer: 1,234', '1234'), true);
  assert.equal(isCorrect('anything', undefined), undefined);
});

test('firstLine returns the first nonblank line', () => {
  assert.equal(firstLine('Paris\n\nA longer explanation.'), 'Paris');
  assert.equal(firstLine('\n  \nParis'), 'Paris');
  assert.equal(firstLine(''), '');
});

test('buildResultsMarkdown makes one row per result, an optional correct? column, and a relative link', () => {
  const out = '/tmp/batch';
  const results = [
    {model: 'a/model', run: 1, status: 'ok', text: 'Paris', correct: true, textFile: join(out, 'a_model/run-01/text.md')},
    {model: 'b/model', run: 1, status: 'failed', error: 'HTTP 429'},
  ];
  const withExpect = buildResultsMarkdown({prompt: 'capital of France?', provider: 'openrouter', n: 1, expect: 'Paris', results, out});
  assert.match(withExpect, /\| model \| run \| answer \(first line\) \| correct\? \| full text \|/);
  assert.match(withExpect, /\| a\/model \| 1 \| Paris \| yes \| \[text\]\(a_model\/run-01\/text\.md\) \|/);
  assert.match(withExpect, /\| b\/model \| 1 \| FAILED: HTTP 429 \| {2}\| {2}\|/);
  const withoutExpect = buildResultsMarkdown({prompt: 'capital of France?', provider: 'openrouter', n: 1, expect: undefined, results, out});
  assert.doesNotMatch(withoutExpect, /correct\?/);
});

// --- list-text-models: filtering by output modality and --grep ---

const listing = {data: [
  {id: 'openai/gpt-5-mini', name: 'OpenAI: GPT-5 Mini', architecture: {output_modalities: ['text']}},
  {id: 'google/gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', architecture: {output_modalities: ['image']}},
  {id: 'anthropic/claude-haiku', name: 'Claude Haiku', architecture: {output_modalities: ['text']}},
]};

test('textModels keeps only models whose output includes text, sorted by id', () => {
  const models = textModels(listing);
  assert.deepEqual(models.map(m => m.id), ['anthropic/claude-haiku', 'openai/gpt-5-mini']);
});

test('filterModels matches id or name case-insensitively', () => {
  const models = textModels(listing);
  assert.deepEqual(filterModels(models, 'gpt').map(m => m.id), ['openai/gpt-5-mini']);
  assert.deepEqual(filterModels(models, 'HAIKU').map(m => m.id), ['anthropic/claude-haiku']);
  assert.deepEqual(filterModels(models, 'nonexistent'), []);
  assert.equal(filterModels(models, undefined).length, 2);
});

test('list-text-models run() calls no key, prints a table, and respects --json and --grep with a mocked fetch', async () => {
  const fetcher = async url => { assert.equal(url, 'https://openrouter.ai/api/v1/models'); return new Response(JSON.stringify(listing), {headers: {'content-type': 'application/json'}}); };
  const lines = []; const errors = [];
  const models = await listTextModels(['--grep', 'gpt'], {fetcher, stdout: s => lines.push(s), progress: s => errors.push(s)});
  assert.equal(models.length, 1);
  assert.match(lines[0], /openai\/gpt-5-mini/);
  const json = [];
  await listTextModels(['--json'], {fetcher, stdout: s => json.push(s), progress: () => {}});
  assert.equal(JSON.parse(json[0]).length, 2);
});

test('list-text-models run() reports a non-OK fetch without throwing', async () => {
  const fetcher = async () => new Response('nope', {status: 500});
  const errors = [];
  await listTextModels([], {fetcher, stdout: () => {}, progress: s => errors.push(s), exit: () => {}});
  assert.match(errors[0], /HTTP 500/);
});

// --- list-openrouter-models: --type picks the catalogue and filters by output modality ---

const imageListing = {data: [
  {id: 'black-forest-labs/flux.2-klein-4b', name: 'FLUX.2 Klein 4B', architecture: {input_modalities: ['text', 'image'], output_modalities: ['image']}},
  {id: 'google/gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', architecture: {input_modalities: ['text', 'image'], output_modalities: ['image', 'text']}},
]};
const mixedListing = {data: [
  ...listing.data,
  {id: 'google/gemini-3-pro-image', name: 'Nano Banana Pro', architecture: {output_modalities: ['image', 'text']}},
  {id: 'openai/gpt-4o-audio', name: 'GPT-4o Audio', architecture: {output_modalities: ['text', 'audio']}},
]};
const openRouterFetcher = async url => {
  const body = url === 'https://openrouter.ai/api/v1/images/models' ? imageListing : url === 'https://openrouter.ai/api/v1/models' ? mixedListing : null;
  assert.ok(body, `unexpected URL ${url}`);
  return new Response(JSON.stringify(body), {headers: {'content-type': 'application/json'}});
};

test('modelsOfType filters by output modality and treats a missing architecture as text', () => {
  assert.deepEqual(modelsOfType(mixedListing, 'audio').map(m => m.id), ['openai/gpt-4o-audio']);
  assert.deepEqual(modelsOfType(mixedListing, 'image').map(m => m.id), ['google/gemini-2.5-flash-image', 'google/gemini-3-pro-image']);
  assert.equal(modelsOfType(mixedListing, 'text').length, 4);
  assert.equal(modelsOfType({data: [{id: 'x/no-arch'}]}, 'text').length, 1);
});

test('fetchModels reads /images/models for image, /models for text and audio, and both merged for all', async () => {
  assert.deepEqual((await fetchOpenRouterModels({type: 'image', fetcher: openRouterFetcher})).map(m => m.id), ['black-forest-labs/flux.2-klein-4b', 'google/gemini-2.5-flash-image']);
  assert.deepEqual((await fetchOpenRouterModels({type: 'audio', fetcher: openRouterFetcher})).map(m => m.id), ['openai/gpt-4o-audio']);
  const all = await fetchOpenRouterModels({type: 'all', fetcher: openRouterFetcher});
  assert.deepEqual(all.map(m => m.id), ['anthropic/claude-haiku', 'black-forest-labs/flux.2-klein-4b', 'google/gemini-2.5-flash-image', 'google/gemini-3-pro-image', 'openai/gpt-4o-audio', 'openai/gpt-5-mini']);
  assert.equal(all.filter(m => m.id === 'google/gemini-2.5-flash-image').length, 1, 'merged by id');
});

test('list-openrouter-models run() shows an output column without --type, plain rows with it, and rejects a bad type', async () => {
  const lines = []; const errors = [];
  await listOpenRouterModels([], {fetcher: openRouterFetcher, stdout: s => lines.push(s), progress: s => errors.push(s)});
  assert.match(lines.find(l => l.startsWith('openai/gpt-4o-audio')), /text\+audio\s+GPT-4o Audio/);
  assert.match(errors[0], /6 models/);
  const image = []; const imageErrors = [];
  await listOpenRouterModels(['--type', 'image', '--grep', 'flux'], {fetcher: openRouterFetcher, stdout: s => image.push(s), progress: s => imageErrors.push(s)});
  assert.deepEqual(image, ['black-forest-labs/flux.2-klein-4b  FLUX.2 Klein 4B']);
  assert.match(imageErrors[0], /1 image model\. .*generate-image\.mjs openrouter/);
  const bad = [];
  await listOpenRouterModels(['--type', 'podcast'], {fetcher: openRouterFetcher, stdout: () => {}, progress: s => bad.push(s), exit: () => {}});
  assert.match(bad[0], /--type must be one of/);
});

test('list-image-models is the --type image shortcut', async () => {
  const models = await listImageModels(['--json'], {fetcher: openRouterFetcher, stdout: () => {}, progress: () => {}});
  assert.deepEqual(models.map(m => m.id), ['black-forest-labs/flux.2-klein-4b', 'google/gemini-2.5-flash-image']);
});

// --- list-fal-models: catalogue order, paging, --limit, --grep ---

const falPages = {
  '': {models: [{endpoint_id: 'fal-ai/flux/schnell', metadata: {display_name: 'FLUX.1 [schnell]'}}, {endpoint_id: 'fal-ai/nano-banana-2', metadata: {display_name: 'Nano Banana 2'}}], has_more: true, next_cursor: 'Mg'},
  'Mg': {models: [{endpoint_id: 'openai/gpt-image-2', metadata: {display_name: 'GPT Image 2 API'}}], has_more: false},
};
const falFetcher = async url => {
  const u = new URL(url);
  assert.equal(u.origin + u.pathname, 'https://api.fal.ai/v1/models');
  assert.equal(u.searchParams.get('category'), 'text-to-image');
  return new Response(JSON.stringify(falPages[u.searchParams.get('cursor') || '']), {headers: {'content-type': 'application/json'}});
};

test('fetchModels keeps catalogue order, stops at --limit, and pages through with --all', async () => {
  assert.deepEqual((await fetchFalModels({category: 'text-to-image', limit: 2, fetcher: falFetcher})).map(m => m.endpoint_id), ['fal-ai/flux/schnell', 'fal-ai/nano-banana-2']);
  assert.deepEqual((await fetchFalModels({category: 'text-to-image', limit: 1, fetcher: falFetcher})).map(m => m.endpoint_id), ['fal-ai/flux/schnell']);
  assert.deepEqual((await fetchFalModels({category: 'text-to-image', limit: 100, all: true, fetcher: falFetcher})).map(m => m.endpoint_id), ['fal-ai/flux/schnell', 'fal-ai/nano-banana-2', 'openai/gpt-image-2']);
});

test('list-fal-models run() prints a table, respects --limit, --grep, and --json, and reports HTTP errors', async () => {
  const lines = []; const errors = [];
  const models = await listFalModels(['--limit', '2'], {fetcher: falFetcher, stdout: s => lines.push(s), progress: s => errors.push(s)});
  assert.equal(models.length, 2);
  assert.match(lines[0], /fal-ai\/flux\/schnell\s+FLUX\.1 \[schnell\]/);
  assert.match(errors[0], /2 text-to-image endpoints/);
  const grepped = await listFalModels(['--all', '--grep', 'GPT'], {fetcher: falFetcher, stdout: () => {}, progress: () => {}});
  assert.deepEqual(grepped.map(m => m.endpoint_id), ['openai/gpt-image-2']);
  assert.deepEqual(filterFalModels(models, 'banana').map(m => m.endpoint_id), ['fal-ai/nano-banana-2']);
  const json = [];
  await listFalModels(['--json', '--limit', '1'], {fetcher: falFetcher, stdout: s => json.push(s), progress: () => {}});
  assert.equal(JSON.parse(json[0]).length, 1);
  const failures = [];
  await listFalModels([], {fetcher: async () => new Response('nope', {status: 503}), stdout: () => {}, progress: s => failures.push(s), exit: () => {}});
  assert.match(failures[0], /HTTP 503/);
});

// --- stills: timestamp math and ffmpeg command construction, no ffmpeg involved ---

test('evenTimestamps centers n frames evenly across the duration', () => {
  assert.deepEqual(evenTimestamps(10, 4), [1.25, 3.75, 6.25, 8.75]);
  assert.throws(() => evenTimestamps(0, 4), /positive/);
  assert.throws(() => evenTimestamps(10, 0), /positive/);
});

test('everyTimestamps steps from zero up to (not including) the duration', () => {
  assert.deepEqual(everyTimestamps(10, 4), [0, 4, 8]);
  assert.deepEqual(everyTimestamps(9, 3), [0, 3, 6]);
});

test('formatTimestamp and parseTimestamp round-trip HH:MM:SS(.mmm)', () => {
  assert.equal(formatTimestamp(3.5), '00:00:03.500');
  assert.equal(formatTimestamp(3665), '01:01:05.000');
  assert.equal(parseTimestamp('00:00:05'), 5);
  assert.equal(parseTimestamp('01:02:03.5'), 3723.5);
  assert.throws(() => parseTimestamp('5'), /HH:MM:SS/);
  assert.throws(() => parseTimestamp('00:99:00'), /HH:MM:SS/);
});

test('frameCommands builds one fast-seek ffmpeg extraction per timestamp', () => {
  const frames = frameCommands('/videos/clip.mp4', [1.25, 3.75], '/out');
  assert.equal(frames.length, 2);
  assert.equal(frames[0].file, join('/out', 'frame-01.jpg'));
  assert.deepEqual(frames[0].command, ['ffmpeg', '-y', '-ss', '00:00:01.250', '-i', '/videos/clip.mp4', '-frames:v', '1', join('/out', 'frame-01.jpg')]);
  assert.equal(frames[1].file, join('/out', 'frame-02.jpg'));
});

test('tileGrid picks a roughly square grid that fits n frames', () => {
  assert.deepEqual(tileGrid(4), {cols: 2, rows: 2});
  assert.deepEqual(tileGrid(12), {cols: 4, rows: 3});
  assert.deepEqual(tileGrid(1), {cols: 1, rows: 1});
});

test('contactSheetCommand builds one ffmpeg tile command over the numbered frames', () => {
  const sheet = contactSheetCommand('/out', 4, '/out/contact-sheet.jpg');
  assert.equal(sheet.cols, 2); assert.equal(sheet.rows, 2);
  assert.deepEqual(sheet.command, ['ffmpeg', '-y', '-i', join('/out', 'frame-%02d.jpg'), '-filter_complex', 'tile=2x2', '/out/contact-sheet.jpg']);
});

test('durationCommand asks ffprobe for a bare duration number', () => {
  const [bin, ...args] = durationCommand('/videos/clip.mp4');
  assert.equal(bin, 'ffprobe');
  assert.ok(args.includes('/videos/clip.mp4'));
});
