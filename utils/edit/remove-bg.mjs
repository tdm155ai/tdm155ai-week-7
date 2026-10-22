#!/usr/bin/env node
// Local still-image cutouts. No API keys or uploads; rembg may download a model.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = fileURLToPath(new URL('../../', import.meta.url));
const help = `Usage: node utils/edit/remove-bg.mjs INPUT [options]
  --method flat|rembg     Omit to choose from edge-color samples (a heuristic)
  --fuzz PERCENT          Flat-route tolerance, 0–100 (default 5; accepts 5%)
  --model NAME            Local rembg model (default u2netp); see rembg i --help
  --alpha-matting         Ask rembg to refine soft edges/hair (slower)
  --soften PIXELS         Blur flat-route alpha only (default 0.7; 0 disables)
  --background COLOR|FILE Flatten onto a color or cover/crop an image to fit
  --out DIRECTORY        New directory; refuses an existing path
  --help                 Show this help
Default output: output/edit/<input>-<unique>/ with source.png, mask-stage.png,
cutout.png (trimmed), and optionally composite.png. Originals stay untouched.
Requires: brew install imagemagick
For rembg: uv tool install --python 3.13 'rembg[cpu,cli]==2.0.85'
Run from the repository root. Every external command is printed.`;

const quote = value => `'${String(value).replaceAll("'", "'\\''")}'`;
function run(command, args) {
  console.log(`$ ${[command, ...args].map(quote).join(' ')}`);
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.error?.code === 'ENOENT') {
    throw new Error(`${command} is missing. Install: ${command === 'magick' ? 'brew install imagemagick' : "uv tool install --python 3.13 'rembg[cpu,cli]==2.0.85'"}`);
  }
  if (result.error) throw result.error;
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}. See the command and error above.`);
  return result.stdout.trim();
}
const magick = args => run('magick', args);
function number(value, flag, max) {
  if (!String(value).trim() || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > max) {
    throw new Error(`--${flag} must be a number from 0 to ${max}.`);
  }
  return Number(value);
}
function singleImage(file) {
  if (!existsSync(file) || !statSync(file).isFile()) throw new Error(`Not a file: ${file}`);
  const rows = magick(['identify', '-format', '%w %h %n\n', file]).split('\n');
  const [width, height, frames] = rows[0].split(' ').map(Number);
  if (rows.length !== 1 || frames !== 1) throw new Error('Use a single still image, not an animation or multi-page file.');
  return { width, height };
}

export function main(argv = process.argv.slice(2)) {
  const { values: o, positionals } = parseArgs({ args: argv, allowPositionals: true, options: {
    method: { type: 'string' }, fuzz: { type: 'string', default: '5' }, model: { type: 'string', default: 'u2netp' },
    background: { type: 'string' }, out: { type: 'string' }, soften: { type: 'string', default: '0.7' },
    'alpha-matting': { type: 'boolean' }, help: { type: 'boolean', short: 'h' },
  } });
  if (o.help) { console.log(help); return; }
  if (positionals.length !== 1) throw new Error(`Supply exactly one input still.\n${help}`);
  if (o.method && !['flat', 'rembg'].includes(o.method)) throw new Error('--method must be flat or rembg.');
  const fuzz = number(o.fuzz.replace(/%$/, ''), 'fuzz', 100);
  const soften = number(o.soften, 'soften', 20);
  // Explicit local allowlist prevents accidentally selecting a paid/cloud backend.
  const models = ['u2net', 'u2netp', 'u2net_human_seg', 'isnet-general-use', 'isnet-anime', 'silueta',
    'birefnet-general', 'birefnet-general-lite', 'birefnet-portrait', 'birefnet-dis',
    'birefnet-hrsod', 'birefnet-cod', 'birefnet-massive'];
  if (!models.includes(o.model)) throw new Error(`Choose a supported local model: ${models.join(', ')}.`);
  const input = resolve(positionals[0]);
  singleImage(input); // Inspect before writing anything.
  const backgroundFile = o.background && existsSync(resolve(o.background)) ? resolve(o.background) : null;
  if (backgroundFile) singleImage(backgroundFile);
  else if (o.background) magick(['-size', '1x1', `xc:${o.background}`, 'null:']); // Validate color before writing.
  let out;
  if (o.out) {
    out = resolve(o.out);
    if (existsSync(out)) throw new Error(`Refusing to overwrite existing output path: ${out}`);
    mkdirSync(out, { recursive: false });
  } else {
    const parent = join(root, 'output', 'edit');
    mkdirSync(parent, { recursive: true });
    const stem = basename(input, extname(input)).replace(/[^a-zA-Z0-9_-]/g, '-');
    out = mkdtempSync(join(parent, `${stem}-`));
  }
  const source = join(out, 'source.png');
  const stage = join(out, 'mask-stage.png');
  const cutout = join(out, 'cutout.png');
  magick([input, '-auto-orient', '-colorspace', 'sRGB', '-alpha', 'set', source]);
  const { width: w, height: h } = singleImage(source);
  const points = [[0,0], [w-1,0], [0,h-1], [w-1,h-1],
    [Math.floor(w/2),0], [Math.floor(w/2),h-1], [0,Math.floor(h/2)], [w-1,Math.floor(h/2)]];
  const colors = magick([source, '-alpha', 'set', '-format', points.map(([x,y]) =>
    `%[fx:p{${x},${y}}.r],%[fx:p{${x},${y}}.g],%[fx:p{${x},${y}}.b],%[fx:p{${x},${y}}.a]`).join('\n'), 'info:'])
    .split('\n').map(line => line.split(',').map(Number));
  const spread = Math.max(...colors.map(c => Math.sqrt(c.slice(0,3).reduce((sum,v,i) => sum + (v-colors[0][i])**2, 0) / 3)));
  const uniform = spread <= 0.025 && colors.every(c => c[3] >= 0.99);
  const method = o.method || (uniform ? 'flat' : 'rembg');
  console.log(`Method: ${method}; ${o.method ? 'chosen explicitly' : `${uniform ? 'all eight opaque edge samples agree within 2.5%' : 'edge samples vary or have transparency'}`}. This heuristic cannot recognize a subject; inspect the result.`);
  console.log(`Top-left sample: ${colors[0].slice(0,3).map(n => Math.round(n*255)).join(', ')} (sRGB); flat fuzz ${fuzz}%.`);
  if (method === 'flat') {
    if (o['alpha-matting']) throw new Error('--alpha-matting requires --method rembg.');
    const args = [source, '-alpha', 'set', '-fuzz', `${fuzz}%`, '-fill', 'none'];
    for (const [x,y] of points.slice(0,4)) args.push('-draw', `color ${x},${y} floodfill`);
    magick([...args, stage]);
    // Blur only alpha; RGB stays sharp. Preserve the unsoftened stage for checking.
    magick([stage, ...(soften ? ['-channel', 'A', '-blur', `0x${soften}`, '+channel'] : []), '-trim', '+repage', cutout]);
  } else {
    run('rembg', ['i', '-m', o.model, ...(o['alpha-matting'] ? ['-a'] : []), source, stage]);
    magick([stage, '-trim', '+repage', cutout]);
  }
  const opacity = Number(magick([cutout, '-alpha', 'extract', '-format', '%[fx:mean]', 'info:']));
  if (opacity <= 0.001) throw new Error(`The mask is empty. Lower --fuzz or try the other method. Inspect ${stage}`);
  if (opacity >= 0.999) console.log('Warning: the cutout appears fully opaque; inspect the mask before using it.');
  if (o.background) {
    const composite = join(out, 'composite.png');
    if (backgroundFile) {
      const { width, height } = singleImage(cutout);
      magick([backgroundFile, '-auto-orient', '-resize', `${width}x${height}^`, '-gravity', 'center', '-extent', `${width}x${height}`,
        cutout, '-compose', 'Over', '-composite', composite]);
    } else magick([cutout, '-background', o.background, '-alpha', 'remove', '-alpha', 'off', composite]);
  }
  console.log(`Saved ${out}\nCheck cutout.png on light and dark backgrounds at 100%, especially hair, holes, and similarly colored details.`);
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`remove-bg: ${error.message}`); process.exitCode = 1; }
}
