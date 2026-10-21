import {readFileSync} from 'node:fs';
import {resolve, extname, join} from 'node:path';
import {parseArgs} from 'node:util';
import {randomUUID} from 'node:crypto';
import {providers, buildRequest} from './providers.mjs';
import {loadConfig, scrub, execute} from './runtime.mjs';

export function argumentsFor(kind, argv) {
  const options = {
    model: {type: 'string', short: 'm'}, input: {type: 'string', short: 'i'},
    out: {type: 'string', short: 'o'}, 'env-file': {type: 'string'}, 'project-root': {type: 'string'},
    'params-file': {type: 'string'}, 'dry-run': {type: 'boolean'}, resume: {type: 'string'},
    timeout: {type: 'string'}, help: {type: 'boolean', short: 'h'},
  };
  const own = {text: ['system', 'system-file', 'max-tokens', 'temperature'], image: ['aspect', 'resolution', 'size', 'quality', 'format', 'n', 'ref-field'], video: ['aspect', 'resolution', 'size', 'duration', 'seed', 'audio', 'fps', 'ref-field']};
  for (const key of own[kind]) options[key] = {type: 'string'};
  if (kind !== 'text') options.ref = {type: 'string', multiple: true};
  if (kind === 'video') options['ref-url'] = {type: 'string', multiple: true};
  const {values, positionals} = parseArgs({args: argv, options, allowPositionals: true});
  for (const flag of ['max-tokens', 'n', 'timeout', 'duration', 'fps']) if (values[flag] !== undefined) {
    const n = Number(values[flag]);
    if (!Number.isSafeInteger(n) || n <= 0 || flag === 'timeout' && n > 2_147_483_647) throw new Error(`--${flag} must be a positive integer within timer limits.`);
    values[flag] = n;
  }
  if (values.seed !== undefined) {
    const n = Number(values.seed);
    if (!values.seed.trim() || !Number.isSafeInteger(n) || n < 0) throw new Error('--seed must be a nonnegative integer.');
    values.seed = n;
  }
  if (values.audio !== undefined) {
    if (!['true', 'false'].includes(values.audio)) throw new Error('--audio must be true or false.');
    values.audio = values.audio === 'true';
  }
  if (values.temperature !== undefined) {
    const n = Number(values.temperature);
    if (!values.temperature.trim() || !Number.isFinite(n) || n < 0) throw new Error('--temperature must be a nonnegative number.');
    values.temperature = n;
  }
  return {values, positionals};
}

export async function run(kind, argv = process.argv.slice(2), deps = {}) {
  const {values: o, positionals} = argumentsFor(kind, argv);
  if (o.help) {
    console.log(`Usage: node utils/generate-${kind}.mjs PROVIDER "prompt" --model MODEL [options]
Providers: ${kind === 'video' ? 'openrouter, fal' : Object.keys(providers).filter(p => kind === 'text' || p !== 'huit-bedrock').join(', ')}
  --input FILE          Prompt from a UTF-8 file (- reads stdin)
  --out DIRECTORY       New output directory (default: output/${kind}/unique-run)
  --params-file FILE    Additional native provider JSON parameters
  --env-file FILE       Credential file (default: repo root .env)
  --project-root DIR    Alternative owner of .env and default output
  --dry-run             Show request without network calls or writes
  --timeout MS          Total request/queue/download deadline (default: 600000)
  --resume RECEIPT      Resume ${kind === 'video' ? 'a fal or OpenRouter job from its receipt' : 'fal status/result retrieval'}; no new generation
${kind === 'text' ? '  --system TEXT | --system-file FILE\n  --max-tokens N        Output token limit\n  --temperature N      Optional sampling setting'
    : kind === 'video' ? '  --ref FILE            Local image, sent as a data URL; repeatable\n  --ref-url URL         Hosted image (HTTPS); repeatable\n  --ref-field FIELD     OpenRouter: first_frame (default), last_frame, reference\n                        fal: image_url (default), image_urls, end_image_url\n  --duration SECONDS    Clip length (model-dependent)\n  --aspect RATIO        E.g. 16:9, 9:16\n  --resolution TIER     E.g. 720p, 1080p (model-dependent)\n  --size WxH            OpenRouter only\n  --audio true|false    Generate audio (models that support it)\n  --seed N              Deterministic generation where the provider honors it\n  --fps N               fal only (endpoint-dependent)\nList models: node utils/list-openrouter-models.mjs --type video; node utils/list-fal-models.mjs --category text-to-video (or image-to-video).'
    : '  --ref FILE            Local reference image; repeatable\n  --aspect RATIO        E.g. 2:3 (OpenRouter, fal, HUIT Gemini)\n  --resolution TIER     E.g. 2K (model-dependent)\n  --size WxH            OpenRouter or HUIT OpenAI\n  --quality VALUE       OpenRouter or HUIT OpenAI\n  --format FORMAT       OpenRouter, fal, HUIT OpenAI\n  --n COUNT             Output count (model-dependent)\n  --ref-field FIELD     fal image_urls (default) or image_url'}
Model IDs and supported parameters differ by provider. See utils/README.md.`);
    return;
  }
  const config = loadConfig(o, deps.env || process.env);
  let request;
  if (o.resume) {
    if (positionals.length || Object.keys(o).some(k => !['resume','out','env-file','project-root','dry-run','timeout'].includes(k))) throw new Error('--resume takes a receipt plus output/credential/timeout options only.');
    const receipt = JSON.parse(readFileSync(o.resume, 'utf8'));
    const falReceipt = receipt.request_id && receipt.status_url && receipt.response_url;
    const routerJob = kind === 'video' && receipt.id && receipt.polling_url;
    if (receipt.kind !== kind || !falReceipt && !routerJob) throw new Error('Receipt kind or job fields do not match this command.');
    o.receipt = receipt;
    request = {provider: falReceipt ? 'fal' : 'openrouter', model: receipt.model, resume: resolve(o.resume)};
  } else {
    const [provider, ...words] = positionals;
    if (kind === 'video' && provider && providers[provider] && !['openrouter', 'fal'].includes(provider)) throw new Error('Video generation is bundled for openrouter and fal only.');
    if (!providers[provider]) throw new Error(`Choose a provider: ${kind === 'video' ? 'openrouter, fal' : Object.keys(providers).join(', ')}`);
    if (o.input && words.length) throw new Error('Choose a prompt argument or --input, not both.');
    let prompt = words.join(' ');
    if (o.input === '-') {
      prompt = ''; for await (const chunk of deps.stdin || process.stdin) prompt += chunk;
    } else if (o.input) prompt = readFileSync(o.input, 'utf8');
    if (!prompt.trim()) throw new Error('Supply a prompt or --input FILE (- for stdin).');
    if (o.system && o['system-file']) throw new Error('Choose --system or --system-file.');
    if (o['system-file']) o.system = readFileSync(o['system-file'], 'utf8');
    const params = o['params-file'] ? JSON.parse(readFileSync(o['params-file'], 'utf8')) : {};
    if (!params || Array.isArray(params) || typeof params !== 'object') throw new Error('--params-file must contain a JSON object.');
    const refs = (o.ref || []).map(file => {
      const mime = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'}[extname(file).toLowerCase()];
      if (!mime) throw new Error('Reference images must be PNG, JPEG, or WebP.');
      const data = readFileSync(file);
      if (!data.length || data.length > 50 * 1024 * 1024) throw new Error('References must be nonempty and at most 50 MB; provider limits may be lower.');
      return {mime, data, url: `data:${mime};base64,${data.toString('base64')}`};
    });
    for (const url of o['ref-url'] || []) {
      let parsed;
      try { parsed = new URL(url); } catch { throw new Error(`--ref-url is not a URL: ${url}`); }
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('--ref-url must be an HTTPS URL without credentials.');
      refs.push({url: parsed.href});
    }
    o.references = [...(o.ref || []).map(file => resolve(file)), ...(o['ref-url'] || [])];
    request = buildRequest(kind, provider, o.model, prompt, o, refs, params);
  }
  const out = o.out ? resolve(o.out) : join(config.root, 'output', kind, `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`);
  if (o['dry-run']) {
    const preview = scrub({...request, references: o.references || [], out, env_file: config.file, key_available: Boolean(config.env[providers[request.provider].key]), network: false}, config.env);
    (deps.stdout || console.log)(JSON.stringify(preview, null, 2)); return preview;
  }
  try {
    const result = await execute(kind, request, config, out, o, deps);
    if (kind === 'text') (deps.stdout || console.log)(result.text);
    if (kind === 'video') (deps.stdout || console.log)(result.videos.join('\n'));
    (deps.progress || console.error)(`Saved ${out}`);
    return {out, ...result};
  } catch (error) {
    throw new Error(scrub(`${error.message}\nRun directory: ${out}. If fal-request.json or openrouter-request.json exists, resume from that receipt (--resume); do not resubmit.`, config.env));
  }
}
