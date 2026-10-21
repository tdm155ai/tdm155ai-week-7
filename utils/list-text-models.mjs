#!/usr/bin/env node
// Print the text models OpenRouter currently offers. No key needed.
// A shortcut for: node utils/list-openrouter-models.mjs --type text
//   node utils/list-text-models.mjs                id and name, one per line
//   node utils/list-text-models.mjs --json          the raw listing
//   node utils/list-text-models.mjs --grep gpt      only models whose id or name contains "gpt" (case-insensitive)
import {run as listOpenRouterModels} from './list-openrouter-models.mjs';

export {textModels, filterModels} from './list-openrouter-models.mjs';

export function run(argv = process.argv.slice(2), deps = {}) {
  return listOpenRouterModels(['--type', 'text', ...argv], deps);
}

if (import.meta.url === `file://${process.argv[1]}`) run().catch(error => { console.error(error.message); process.exitCode = 1; });
