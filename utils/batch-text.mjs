#!/usr/bin/env node
// Run one prompt several times across several models, then build a table to compare them.
//
//   node utils/batch-text.mjs "What is the capital of France?" --models openai/gpt-5-mini,google/gemini-2.5-flash-lite --n 3 --expect Paris
//
// Options:
//   --models a,b,c     Model IDs for the selected provider. Required.
//   --n COUNT          Runs per model (default 1).
//   --provider NAME    openrouter (default), fal, huit-openai, huit-gemini, huit-bedrock. All models in one batch use one provider.
//   --system TEXT      Optional system prompt, passed through to every run.
//   --expect TEXT      Optional expected answer; adds a correct? column (substring match after stripping commas and spaces).
//   --out DIRECTORY    New folder for the batch (default output/batches/<timestamp>-<prompt-slug>-text).
//   --parallel COUNT   Requests in flight at once (default 2).
//   --env-file FILE    Credential file (default: repo root .env).
//   --dry-run          Show the plan; no requests, no folders.
//
// Each answer is made by utils/generate-text.mjs into <out>/<model>/run-NN/, so every run keeps its own
// request.json, response.json, and text.md. The batch writes batch.json and results.md at <out>.
import {spawn} from 'node:child_process';
import {mkdirSync, writeFileSync, readFileSync, existsSync} from 'node:fs';
import {join, resolve, relative, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {isCorrect, buildResultsMarkdown} from './lib/batch.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');

async function main() {
  const {values: o, positionals} = parseArgs({
    args: process.argv.slice(2), allowPositionals: true,
    options: {models: {type: 'string'}, n: {type: 'string', default: '1'}, provider: {type: 'string', default: 'openrouter'},
      system: {type: 'string'}, expect: {type: 'string'}, out: {type: 'string'}, parallel: {type: 'string', default: '2'},
      'env-file': {type: 'string'}, 'dry-run': {type: 'boolean'}, help: {type: 'boolean', short: 'h'}},
  });
  if (o.help || !positionals.length || !o.models) {
    console.log('Usage: node utils/batch-text.mjs "prompt" --models ID,ID [--n 1] [--provider openrouter] [--system TEXT] [--expect TEXT] [--out DIR] [--parallel 2] [--env-file FILE] [--dry-run]');
    process.exit(o.help ? 0 : 1);
  }
  const prompt = positionals.join(' ');
  const models = o.models.split(',').map(s => s.trim()).filter(Boolean);
  const n = Number(o.n), parallel = Number(o.parallel);
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(parallel) || parallel < 1) throw new Error('--n and --parallel must be positive integers.');
  const slug = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'batch';
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const out = resolve(o.out || join(REPO_ROOT, 'output', 'batches', `${stamp}-${slug}-text`));
  if (existsSync(out)) throw new Error(`${out} already exists; choose a new --out.`);
  const jobs = [];
  for (const model of models) for (let i = 1; i <= n; i++) jobs.push({model, run: i, dir: join(out, model.replace(/[^a-zA-Z0-9._-]+/g, '_'), `run-${String(i).padStart(2, '0')}`)});

  if (o['dry-run']) {
    console.log(JSON.stringify({prompt, provider: o.provider, models, n, parallel, out, expect: o.expect, jobs: jobs.length, network: false}, null, 2));
    return;
  }
  mkdirSync(out, {recursive: true});
  const generator = join(HERE, 'generate-text.mjs');
  function runOne(job) {
    return new Promise(done => {
      const args = [generator, o.provider, prompt, '--model', job.model, '--out', job.dir];
      if (o.system) args.push('--system', o.system);
      if (o['env-file']) args.push('--env-file', o['env-file']);
      const child = spawn(process.execPath, args, {cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe']});
      let stderr = '';
      child.stderr.on('data', d => { stderr += d; });
      child.on('close', code => {
        const textFile = join(job.dir, 'text.md');
        const ok = code === 0 && existsSync(textFile);
        const text = ok ? readFileSync(textFile, 'utf8').replace(/\n$/, '') : '';
        const status = ok ? 'ok' : 'failed';
        console.error(`${status === 'ok' ? 'ok    ' : 'FAILED'} ${job.model} run ${job.run}${status === 'ok' ? '' : ': ' + stderr.trim().split('\n')[0]}`);
        done({...job, status, text, textFile, correct: ok && o.expect !== undefined ? isCorrect(text, o.expect) : undefined, error: ok ? undefined : stderr.trim().split('\n')[0]});
      });
    });
  }
  const results = [];
  let next = 0;
  await Promise.all(Array.from({length: Math.min(parallel, jobs.length)}, async () => {
    while (next < jobs.length) results.push(await runOne(jobs[next++]));
  }));
  results.sort((a, b) => a.model.localeCompare(b.model) || a.run - b.run);
  const manifest = {prompt, provider: o.provider, models, n, expect: o.expect, created: new Date().toISOString(),
    results: results.map(r => ({model: r.model, run: r.run, status: r.status, text: r.text, correct: r.correct, textFile: relative(out, r.textFile), error: r.error}))};
  writeFileSync(join(out, 'batch.json'), JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(join(out, 'results.md'), buildResultsMarkdown({prompt, provider: o.provider, n, expect: o.expect, results, out}));
  console.error(`Batch saved: ${out}\nOpen ${join(out, 'results.md')} to compare.`);
}

main();
