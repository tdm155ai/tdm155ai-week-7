import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../edit/remove-bg.mjs', import.meta.url));
const installed = command => !spawnSync(command, ['--help'], { encoding: 'utf8' }).error;
const hasMagick = installed('magick');
const hasRembg = installed('rembg');
function command(bin, args) {
  const result = spawnSync(bin, args, { encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024 });
  assert.equal(result.error, undefined, String(result.error));
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return result.stdout.trim();
}
const magick = args => command('magick', args);
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'edit-remove-bg-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const input = join(dir, 'subject with spaces.png');
  // A pale green enclosed mark must survive even though it matches the backdrop.
  magick(['-size', '160x120', 'xc:#dce8ce', '-fill', '#e35c32', '-draw', 'roundrectangle 30,20 130,100 12,12',
    '-fill', '#dce8ce', '-draw', 'circle 80,60 90,60', input]);
  return { dir, input, out: join(dir, 'result') };
}
const run = (input, out, args = []) => command(process.execPath, [script, input, '--out', out, ...args]);
const alpha = (file, x, y) => Number(magick([file, '-format', `%[fx:p{${x},${y}}.a]`, 'info:']));

test('help works without dependencies', () => {
  assert.match(command(process.execPath, [script, '--help']), /--method flat\|rembg/);
});
test('flat cutout preserves original and enclosed matching colors, trims and flattens', { skip: !hasMagick }, t => {
  const { input, out } = fixture(t);
  const before = readFileSync(input);
  run(input, out, ['--method', 'flat', '--soften', '0', '--background', 'white']);
  assert.deepEqual(readFileSync(input), before);
  const stage = join(out, 'mask-stage.png');
  assert.equal(alpha(stage, 0, 0), 0);
  assert.equal(alpha(stage, 80, 60), 1);
  assert.equal(alpha(stage, 40, 60), 1);
  const size = magick(['identify', '-format', '%w %h', join(out, 'cutout.png')]).split(' ').map(Number);
  assert.ok(size[0] < 160 && size[1] < 120);
  assert.equal(magick([join(out, 'composite.png'), '-format', '%[opaque]', 'info:']).toLowerCase(), 'true');
});
test('automatic method explains uniform edges; softening makes fractional alpha', { skip: !hasMagick }, t => {
  const { input, out } = fixture(t);
  assert.match(run(input, out), /Method: flat; all eight opaque edge samples agree/);
  const fractional = Number(magick([join(out, 'cutout.png'), '-alpha', 'extract', '-fx', 'u>0 && u<1 ? 1 : 0', '-format', '%[fx:mean]', 'info:']));
  assert.ok(fractional > 0, 'softened edge should contain fractional alpha');
});
test('image background is composited to the trimmed dimensions', { skip: !hasMagick }, t => {
  const { input, dir, out } = fixture(t);
  const bg = join(dir, 'background.png');
  magick(['-size', '300x200', 'xc:navy', bg]);
  run(input, out, ['--method', 'flat', '--background', bg]);
  const dimensions = file => magick(['identify', '-format', '%wx%h', join(out, file)]);
  assert.equal(dimensions('cutout.png'), dimensions('composite.png'));
  assert.equal(magick([join(out, 'composite.png'), '-format', '%[opaque]', 'info:']).toLowerCase(), 'true');
});
test('refuses an existing output directory and invalid tolerance without altering source', { skip: !hasMagick }, t => {
  const { input, out } = fixture(t);
  const before = readFileSync(input);
  mkdirSync(out);
  let result = spawnSync(process.execPath, [script, input, '--out', out], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing to overwrite/);
  result = spawnSync(process.execPath, [script, input, '--fuzz', '101'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--fuzz must/);
  assert.deepEqual(readFileSync(input), before);
  assert.equal(existsSync(join(out, 'source.png')), false);
});
test('rejects an empty mask', { skip: !hasMagick }, t => {
  const { input, out } = fixture(t);
  const result = spawnSync(process.execPath, [script, input, '--out', out, '--method', 'flat', '--fuzz', '100'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /mask is empty/);
});
test('missing rembg gives an install command', { skip: !hasMagick || hasRembg }, t => {
  const { input, out } = fixture(t);
  const result = spawnSync(process.execPath, [script, input, '--out', out, '--method', 'rembg'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /rembg is missing\. Install: uv tool install/);
});
test('rembg runs on generated media when installed (may download u2netp once)', { skip: !hasMagick || !hasRembg }, t => {
  const { input, out } = fixture(t);
  const before = readFileSync(input);
  assert.match(run(input, out, ['--method', 'rembg', '--model', 'u2netp']), /Method: rembg/);
  const stage = join(out, 'mask-stage.png');
  const [min, max] = magick([stage, '-alpha', 'extract', '-format', '%[fx:minima] %[fx:maxima]', 'info:']).split(' ').map(Number);
  assert.ok(min < 0.1 && max > 0.9, 'should contain transparent background and opaque subject');
  assert.deepEqual(readFileSync(input), before);
});
