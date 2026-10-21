#!/usr/bin/env node
// Run one prompt several times across several models, then build a gallery page to compare them.
//
//   node utils/batch-images.mjs "a happy family" --models google/gemini-2.5-flash-image,black-forest-labs/flux.2-klein-4b --n 4
//
// Options:
//   --models a,b,c     OpenRouter model IDs (see list-image-models.mjs). Required.
//   --n COUNT          Images per model (default 4).
//   --provider NAME    openrouter (default), fal, huit-openai, huit-gemini. All models in one batch use one provider.
//   --out DIRECTORY    New folder for the batch (default output/batches/<timestamp>-<prompt-slug>).
//   --parallel COUNT   Requests in flight at once (default 2).
//   --env-file FILE    Credential file (default: repo root .env).
//   --dry-run          Show the plan; no requests, no folders.
//
// Each image is made by utils/generate-image.mjs into <out>/<model>/run-NN/, so every run keeps its own
// request.json and response.json. The batch writes batch.json and index.html at <out>. Open index.html in a browser.
import {spawn} from 'node:child_process';
import {mkdirSync, writeFileSync, readdirSync, existsSync} from 'node:fs';
import {join, resolve, relative, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const {values: o, positionals} = parseArgs({
  args: process.argv.slice(2), allowPositionals: true,
  options: {models: {type: 'string'}, n: {type: 'string', default: '4'}, provider: {type: 'string', default: 'openrouter'},
    out: {type: 'string'}, parallel: {type: 'string', default: '2'}, 'env-file': {type: 'string'}, 'dry-run': {type: 'boolean'}, help: {type: 'boolean', short: 'h'}},
});
if (o.help || !positionals.length || !o.models) {
  console.log('Usage: node utils/batch-images.mjs "prompt" --models ID,ID [--n 4] [--provider openrouter] [--out DIR] [--parallel 2] [--env-file FILE] [--dry-run]');
  process.exit(o.help ? 0 : 1);
}
const prompt = positionals.join(' ');
const models = o.models.split(',').map(s => s.trim()).filter(Boolean);
const n = Number(o.n), parallel = Number(o.parallel);
if (!Number.isInteger(n) || n < 1 || !Number.isInteger(parallel) || parallel < 1) throw new Error('--n and --parallel must be positive integers.');
const slug = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'batch';
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const out = resolve(o.out || join(REPO_ROOT, 'output', 'batches', `${stamp}-${slug}`));
if (existsSync(out)) throw new Error(`${out} already exists; choose a new --out.`);
const jobs = [];
for (const model of models) for (let i = 1; i <= n; i++) jobs.push({model, run: i, dir: join(out, model.replace(/[^a-zA-Z0-9._-]+/g, '_'), `run-${String(i).padStart(2, '0')}`)});

if (o['dry-run']) {
  console.log(JSON.stringify({prompt, provider: o.provider, models, n, parallel, out, jobs: jobs.length, network: false}, null, 2));
  process.exit(0);
}
mkdirSync(out, {recursive: true});
const generator = join(HERE, 'generate-image.mjs');
function runOne(job) {
  return new Promise(done => {
    const args = [generator, o.provider, prompt, '--model', job.model, '--out', job.dir];
    if (o['env-file']) args.push('--env-file', o['env-file']);
    const child = spawn(process.execPath, args, {cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe']});
    let stderr = '';
    child.stderr.on('data', d => { stderr += d; });
    child.on('close', code => {
      const images = existsSync(job.dir) ? readdirSync(job.dir).filter(f => /^image-\d+\.(png|jpg|webp|svg)$/.test(f)).sort() : [];
      const status = code === 0 && images.length ? 'ok' : 'failed';
      console.error(`${status === 'ok' ? 'ok    ' : 'FAILED'} ${job.model} run ${job.run}${status === 'ok' ? '' : ': ' + stderr.trim().split('\n')[0]}`);
      done({...job, status, images: images.map(f => join(job.dir, f)), error: status === 'ok' ? undefined : stderr.trim().split('\n')[0]});
    });
  });
}
const results = [];
let next = 0;
await Promise.all(Array.from({length: Math.min(parallel, jobs.length)}, async () => {
  while (next < jobs.length) results.push(await runOne(jobs[next++]));
}));
results.sort((a, b) => a.model.localeCompare(b.model) || a.run - b.run);
const manifest = {prompt, provider: o.provider, models, n, created: new Date().toISOString(), results: results.map(r => ({model: r.model, run: r.run, status: r.status, images: r.images.map(f => relative(out, f)), error: r.error}))};
writeFileSync(join(out, 'batch.json'), JSON.stringify(manifest, null, 2) + '\n');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const sections = models.map(model => {
  const rows = results.filter(r => r.model === model);
  const cells = rows.map(r => r.status === 'ok'
    ? r.images.map(f => `<figure><img src="${esc(relative(out, f))}" loading="lazy"><figcaption>run ${r.run}</figcaption></figure>`).join('')
    : `<figure class="failed"><div>run ${r.run} failed<br><small>${esc(r.error || '')}</small></div></figure>`).join('');
  return `<section><h2>${esc(model)}</h2><div class="grid">${cells}</div></section>`;
}).join('\n');
writeFileSync(join(out, 'index.html'), `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(prompt)}</title>
<style>
  body{font:16px/1.4 system-ui,sans-serif;margin:0;padding:24px;background:#111;color:#eee}
  h1{font-size:22px;margin:0 0 4px} .meta{color:#999;margin:0 0 24px} h2{font-size:16px;font-weight:600;margin:28px 0 10px;color:#ccc}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
  figure{margin:0;background:#1b1b1b;border-radius:6px;overflow:hidden} img{display:block;width:100%;height:auto}
  figcaption{padding:6px 8px;font-size:12px;color:#999} .failed div{padding:24px 12px;color:#e88;font-size:13px}
</style></head><body>
<h1>${esc(prompt)}</h1>
<p class="meta">${esc(o.provider)} · ${models.length} model${models.length === 1 ? '' : 's'} · ${n} run${n === 1 ? '' : 's'} each · ${esc(manifest.created)}</p>
${sections}
</body></html>
`);
console.error(`Batch saved: ${out}\nOpen ${join(out, 'index.html')} in a browser.`);
