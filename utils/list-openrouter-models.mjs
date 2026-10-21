#!/usr/bin/env node
// Print the models OpenRouter currently offers, by the kind of thing they produce. No key needed.
//   node utils/list-openrouter-models.mjs                    every model, with an output column (text, image, text+audio, ...)
//   node utils/list-openrouter-models.mjs --type image       only image models (what generate-image.mjs openrouter can use)
//   node utils/list-openrouter-models.mjs --type text        only text models (what generate-text.mjs openrouter can use)
//   node utils/list-openrouter-models.mjs --type audio       only models that can answer with audio
//   node utils/list-openrouter-models.mjs --type image --grep flux
//   node utils/list-openrouter-models.mjs --json             the raw listing
//
// OpenRouter keeps two catalogues: /models (chat models, a few of which can also return images or audio)
// and /images/models (the dedicated image models). --type image reads the second; text and audio read the first;
// no --type reads both and merges them by id.
import {parseArgs} from 'node:util';

export const MODELS_URL = 'https://openrouter.ai/api/v1/models';
export const IMAGE_MODELS_URL = 'https://openrouter.ai/api/v1/images/models';
export const VIDEO_MODELS_URL = 'https://openrouter.ai/api/v1/videos/models';
export const TYPES = ['all', 'text', 'image', 'audio', 'video'];

export function outputs(model) {
  return model.architecture?.output_modalities || ['text'];
}

export function modelsOfType(listing, type) {
  const all = listing.data || listing;
  const kept = type === 'all' ? all : all.filter(m => outputs(m).includes(type));
  return kept.slice().sort((a, b) => a.id.localeCompare(b.id));
}

// Kept for list-text-models.mjs, which predates --type.
export function textModels(listing) {
  return modelsOfType(listing, 'text');
}

export function filterModels(models, grep) {
  if (!grep) return models;
  const needle = grep.toLowerCase();
  return models.filter(m => m.id.toLowerCase().includes(needle) || (m.name || '').toLowerCase().includes(needle));
}

// The one or two catalogue requests a --type needs, merged so each id appears once.
export async function fetchModels({type, fetcher = fetch}) {
  // `all` merges the chat and image catalogues as before; video models are listed only with --type video.
  const urls = type === 'image' ? [IMAGE_MODELS_URL] : type === 'video' ? [VIDEO_MODELS_URL] : type === 'all' ? [MODELS_URL, IMAGE_MODELS_URL] : [MODELS_URL];
  const byId = new Map();
  for (const url of urls) {
    const response = await fetcher(url);
    if (!response.ok) throw new Error(`OpenRouter answered HTTP ${response.status}.`);
    const listing = await response.json();
    // The video catalogue (/videos/models) describes durations and sizes instead of an architecture block.
    for (const m of listing.data || listing) if (!byId.has(m.id)) byId.set(m.id, url === VIDEO_MODELS_URL && !m.architecture ? {...m, architecture: {output_modalities: ['video']}} : m);
  }
  return modelsOfType([...byId.values()], type);
}

export async function run(argv = process.argv.slice(2), deps = {}) {
  const {values: o} = parseArgs({
    args: argv,
    options: {type: {type: 'string', default: 'all'}, json: {type: 'boolean'}, grep: {type: 'string'}, help: {type: 'boolean', short: 'h'}},
  });
  const log = deps.stdout || console.log, err = deps.progress || console.error;
  if (o.help) {
    log(`Usage: node utils/list-openrouter-models.mjs [--type ${TYPES.join('|')}] [--grep TEXT] [--json]
  --type KIND    What the model produces: text, image, audio, video, or all (default all); video also shows durations, resolutions, and aspect ratios
  --grep TEXT    Only models whose id or name contains TEXT (case-insensitive)
  --json         Print the raw OpenRouter listing instead of a plain table
No key is required; this calls OpenRouter's public models endpoints.`);
    return;
  }
  if (!TYPES.includes(o.type)) { err(`--type must be one of ${TYPES.join(', ')}.`); if (deps.exit) deps.exit(1); else process.exitCode = 1; return; }
  let models;
  try {
    models = filterModels(await fetchModels({type: o.type, fetcher: deps.fetcher}), o.grep);
  } catch (error) {
    err(error.message); if (deps.exit) deps.exit(1); else process.exitCode = 1; return;
  }
  if (o.json) { log(JSON.stringify(models, null, 2)); return models; }
  const label = o.type === 'all' ? '' : `${o.type} `;
  if (!models.length) { err(`No ${label}models matched.`); return models; }
  const width = Math.max(...models.map(m => m.id.length));
  if (o.type === 'all') {
    const kinds = models.map(m => outputs(m).join('+'));
    const kindWidth = Math.max(...kinds.map(k => k.length));
    models.forEach((m, i) => log(`${m.id.padEnd(width)}  ${kinds[i].padEnd(kindWidth)}  ${m.name || ''}`));
  } else if (o.type === 'video') {
    for (const m of models) log(`${m.id.padEnd(width)}  ${(m.supported_durations || []).join('/')}s  ${(m.supported_resolutions || []).join('/')}  ${(m.supported_aspect_ratios || []).join(' ')}  ${m.name || ''}`);
  } else {
    for (const m of models) log(`${m.id.padEnd(width)}  ${m.name || ''}`);
  }
  const script = o.type === 'image' ? 'generate-image.mjs' : o.type === 'video' ? 'generate-video.mjs' : 'generate-text.mjs';
  err(`${models.length} ${label}model${models.length === 1 ? '' : 's'}. Use one as --model with: node utils/${script} openrouter "prompt" --model ID`);
  return models;
}

if (import.meta.url === `file://${process.argv[1]}`) run().catch(error => { console.error(error.message); process.exitCode = 1; });
