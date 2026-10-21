#!/usr/bin/env node
// Print the image models fal currently offers, in fal's own catalogue order. No key needed.
//   node utils/list-fal-models.mjs                  first 100 text-to-image endpoints, id and name
//   node utils/list-fal-models.mjs --limit 20       just the first 20
//   node utils/list-fal-models.mjs --all            page through the whole category
//   node utils/list-fal-models.mjs --grep flux      only endpoints whose id or name contains "flux"
//   node utils/list-fal-models.mjs --category text-to-video
//   node utils/list-fal-models.mjs --json           the raw listing
import {parseArgs} from 'node:util';

export const FAL_MODELS_URL = 'https://api.fal.ai/v1/models';

export function filterModels(models, grep) {
  if (!grep) return models;
  const needle = grep.toLowerCase();
  return models.filter(m => m.endpoint_id.toLowerCase().includes(needle) || (m.metadata?.display_name || '').toLowerCase().includes(needle));
}

// Fetch one page after another until fal says there are no more, or until `limit` endpoints are in hand.
export async function fetchModels({category, limit, all, fetcher = fetch}) {
  const models = [];
  let cursor;
  do {
    const url = new URL(FAL_MODELS_URL);
    url.searchParams.set('category', category);
    url.searchParams.set('limit', String(Math.min(100, all ? 100 : limit)));
    if (cursor) url.searchParams.set('cursor', cursor);
    const response = await fetcher(url.toString());
    if (!response.ok) throw new Error(`fal answered HTTP ${response.status}.`);
    const page = await response.json();
    models.push(...(page.models || []));
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor && (all || models.length < limit));
  return all ? models : models.slice(0, limit);
}

export async function run(argv = process.argv.slice(2), deps = {}) {
  const {values: o} = parseArgs({
    args: argv,
    options: {
      json: {type: 'boolean'}, grep: {type: 'string'}, all: {type: 'boolean'},
      limit: {type: 'string', default: '100'}, category: {type: 'string', default: 'text-to-image'},
      help: {type: 'boolean', short: 'h'},
    },
  });
  const log = deps.stdout || console.log, err = deps.progress || console.error;
  if (o.help) {
    log(`Usage: node utils/list-fal-models.mjs [--limit N] [--all] [--grep TEXT] [--category NAME] [--json]
  --limit N         How many endpoints to print, in fal's catalogue order (default 100)
  --all             Page through the whole category instead of stopping at --limit
  --grep TEXT       Only endpoints whose id or name contains TEXT (case-insensitive)
  --category NAME   fal category (default text-to-image; also image-to-image, text-to-video, ...)
  --json            Print the raw listing instead of a plain table
No key is required; this calls fal's public models endpoint.`);
    return;
  }
  const limit = Number(o.limit);
  if (!Number.isInteger(limit) || limit < 1) { err('--limit must be a whole number of 1 or more.'); if (deps.exit) deps.exit(1); else process.exitCode = 1; return; }
  let models;
  try {
    models = filterModels(await fetchModels({category: o.category, limit, all: o.all, fetcher: deps.fetcher}), o.grep);
  } catch (error) {
    err(error.message); if (deps.exit) deps.exit(1); else process.exitCode = 1; return;
  }
  if (o.json) { log(JSON.stringify(models, null, 2)); return models; }
  if (!models.length) { err(`No ${o.category} endpoints matched.`); return models; }
  const width = Math.max(...models.map(m => m.endpoint_id.length));
  for (const m of models) log(`${m.endpoint_id.padEnd(width)}  ${m.metadata?.display_name || ''}`);
  err(`${models.length} ${o.category} endpoint${models.length === 1 ? '' : 's'}, in fal's catalogue order. Use one as --model with: node utils/generate-image.mjs fal "prompt" --model ID`);
  return models;
}

if (import.meta.url === `file://${process.argv[1]}`) run().catch(error => { console.error(error.message); process.exitCode = 1; });
