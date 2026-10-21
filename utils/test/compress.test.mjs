import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import sharp from 'sharp';
import {compressReference} from '../lib/compress.mjs';

// Offline: the fixture is drawn by Sharp, nothing is read from the repo or the network.

function temporary(t) { const dir = mkdtempSync(join(tmpdir(), 'compress-test-')); t.after(() => rmSync(dir, {recursive: true, force: true})); return dir; }
async function fixture(file, width = 1800, height = 1200) {
  await sharp({create: {width, height, channels: 4, background: {r: 190, g: 70, b: 30, alpha: 0.5}}}).png().toFile(file);
}

test('compressReference writes a bounded JPEG beside the untouched source', async t => {
  const dir = temporary(t), source = join(dir, 'photo.png'), target = join(dir, 'photo.jpg');
  await fixture(source);
  const before = readFileSync(source);
  const result = await compressReference(source, target, {maxEdge: 1024, maxBytes: 200 * 1024});
  assert.deepEqual(readFileSync(source), before);
  assert.equal(result.format, 'jpeg');
  assert.ok(result.width <= 1024 && result.height <= 1024);
  assert.ok(Math.abs(result.width / result.height - 1.5) < 0.01);
  assert.ok(statSync(target).size <= 200 * 1024);
  assert.equal(statSync(target).size, result.bytes);
  const meta = await sharp(target).metadata();
  assert.equal(meta.format, 'jpeg'); assert.equal(meta.hasAlpha, false);
});

test('compressReference never overwrites an existing destination and rejects loose limits', async t => {
  const dir = temporary(t), source = join(dir, 'photo.png'), target = join(dir, 'photo.jpg');
  await fixture(source, 800, 800);
  await compressReference(source, target);
  await assert.rejects(() => compressReference(source, target), /EEXIST/);
  await assert.rejects(() => compressReference(source, join(dir, 'other.jpg'), {maxEdge: 100}), /maxEdge/);
});
