#!/usr/bin/env node
// Print the image models OpenRouter currently offers. No key needed.
// A shortcut for: node utils/list-openrouter-models.mjs --type image
//   node utils/list-image-models.mjs            id and name, one per line
//   node utils/list-image-models.mjs --json     the raw listing
//   node utils/list-image-models.mjs --grep flux
import {run as listOpenRouterModels} from './list-openrouter-models.mjs';

export function run(argv = process.argv.slice(2), deps = {}) {
  return listOpenRouterModels(['--type', 'image', ...argv], deps);
}

if (import.meta.url === `file://${process.argv[1]}`) run().catch(error => { console.error(error.message); process.exitCode = 1; });
