import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { haveFfmpeg, tempDir, ffmpeg, runScript, probe, pixel } from "./edit-helpers.mjs";
import { parseColor, positionFor } from "../edit/greenscreen.mjs";

test("parseColor accepts names and hex in a few spellings", () => {
  assert.equal(parseColor("green"), "00FF00");
  assert.equal(parseColor("blue"), "0000FF");
  assert.equal(parseColor("#1fb22a"), "1FB22A");
  assert.equal(parseColor("0x1FB22A"), "1FB22A");
});

test("positionFor gives overlay expressions", () => {
  assert.deepEqual(positionFor("center"), ["(W-w)/2", "(H-h)/2"]);
  assert.deepEqual(positionFor("bottom-right"), ["W-w", "H-h"]);
  assert.deepEqual(positionFor("40,-10"), ["40", "-10"]);
});

test("--help prints usage", () => {
  const result = runScript("greenscreen.mjs", ["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: node utils\/edit\/greenscreen\.mjs/);
});

// A red block sliding across a pure green screen, 640x360, 3 s; and a flat blue background.
function makeMedia(dir) {
  const fg = path.join(dir, "green.mp4");
  const bg = path.join(dir, "bg.mp4");
  const still = path.join(dir, "bg.png");
  ffmpeg(["-f", "lavfi", "-i", "color=c=0x00FF00:size=640x360:rate=30:duration=3", "-f", "lavfi", "-i", "color=c=0xC04040:size=120x200:rate=30:duration=3", "-filter_complex", "[0:v][1:v]overlay=x='100+100*t':y=80:shortest=1[v]", "-map", "[v]", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", fg]);
  ffmpeg(["-f", "lavfi", "-i", "color=c=0x2040C0:size=640x360:rate=30:duration=5", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", bg]);
  ffmpeg(["-f", "lavfi", "-i", "color=c=0x2040C0:size=640x360:duration=1", "-frames:v", "1", still]);
  return { fg, bg, still };
}

const near = (rgb, want, tolerance = 24) => rgb.every((v, i) => Math.abs(v - want[i]) <= tolerance);

test("the green goes, the subject stays, the length is the foreground's", { skip: !haveFfmpeg && "ffmpeg not installed" }, () => {
  const { dir, cleanup } = tempDir("greenscreen");
  try {
    const { fg, bg } = makeMedia(dir);
    const output = path.join(dir, "out", "composite.mp4");
    const result = runScript("greenscreen.mjs", [fg, bg, "--out", output]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /chromakey=0x00FF00:0\.2:0\.05,despill=type=green/);
    const out = probe(output);
    assert.ok(Math.abs(out.duration - 3) < 0.2, `duration ${out.duration}`);
    assert.equal(out.video.width, 640);
    const corner = pixel(output, 20, 20, 1);
    assert.ok(near(corner, [0x20, 0x40, 0xc0]), `corner is ${corner}, expected the blue background`);
    const subject = pixel(output, 230, 180, 1); // inside the block at t=1 (x 200..320, y 80..280)
    assert.ok(near(subject, [0xc0, 0x40, 0x40]), `subject is ${subject}, expected the red block`);
  } finally {
    cleanup();
  }
});

test("a still background loops for the foreground's length; --still renders one PNG", { skip: !haveFfmpeg && "ffmpeg not installed" }, () => {
  const { dir, cleanup } = tempDir("greenscreen");
  try {
    const { fg, still } = makeMedia(dir);
    const output = path.join(dir, "over-still.mp4");
    const result = runScript("greenscreen.mjs", [fg, still, "--position", "bottom-left", "--out", output]);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(Math.abs(probe(output).duration - 3) < 0.2);
    const frame = path.join(dir, "test.png");
    const one = runScript("greenscreen.mjs", [fg, still, "--still", "1", "--similarity", "0.2", "--out", frame]);
    assert.equal(one.status, 0, one.stderr);
    assert.ok(existsSync(frame));
    assert.equal(probe(frame).video.codec_name, "png");
    assert.ok(near(pixel(frame, 20, 20), [0x20, 0x40, 0xc0]));
  } finally {
    cleanup();
  }
});

test("--pick reports the screen color (when ImageMagick is installed)", { skip: !haveFfmpeg && "ffmpeg not installed" }, () => {
  const { dir, cleanup } = tempDir("greenscreen");
  try {
    const { fg } = makeMedia(dir);
    const result = runScript("greenscreen.mjs", [fg, "--pick", "1"]);
    if (result.status !== 0 && /ImageMagick/.test(result.stderr)) return; // no magick: the message is the behavior
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /top-left: 00FF0[0-3]/);
  } finally {
    cleanup();
  }
});
