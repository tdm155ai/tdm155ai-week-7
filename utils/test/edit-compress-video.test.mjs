import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { haveFfmpeg, tempDir, ffmpeg, runScript, probe } from "./edit-helpers.mjs";
import { fitted, bitrateFor } from "../edit/compress-video.mjs";

test("fitted caps the shorter side and keeps both sides even", () => {
  assert.deepEqual(fitted(1920, 1080, 720), { width: 1280, height: 720 });
  assert.deepEqual(fitted(1080, 1920, 720), { width: 720, height: 1280 });
  assert.deepEqual(fitted(4032, 3024, 1080), { width: 1440, height: 1080 });
  assert.equal(fitted(1280, 720, 1080), null, "no upscaling");
  assert.equal(fitted(1280, 720, null), null);
});

test("bitrateFor leaves room for the audio and a margin", () => {
  const kbps = bitrateFor(10, 60, 128); // 10 MB over 60 s
  assert.ok(kbps > 1100 && kbps < 1210, `got ${kbps}`);
});

test("--help prints usage", () => {
  const result = runScript("compress-video.mjs", ["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: node utils\/edit\/compress-video\.mjs/);
});

function makeClip(file, extra = []) {
  ffmpeg(["-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=30:duration=4", "-f", "lavfi", "-i", "sine=frequency=440:duration=4", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", ...extra, file]);
}

test("CRF default makes a smaller H.264 that keeps size and frame rate", { skip: !haveFfmpeg && "ffmpeg not installed" }, () => {
  const { dir, cleanup } = tempDir("compress");
  try {
    const input = path.join(dir, "clip.mp4");
    makeClip(input);
    const inSize = probe(input).size;
    const output = path.join(dir, "out", "clip-h264.mp4");
    const result = runScript("compress-video.mjs", [input, "--preset", "veryfast", "--out", output]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /\$ ffmpeg .*-c:v libx264 .*-crf 23/);
    assert.match(result.stdout, /% smaller/);
    const out = probe(output);
    assert.equal(out.video.codec_name, "h264");
    assert.equal(out.video.width, 1280);
    assert.equal(out.video.r_frame_rate, "30/1");
    assert.equal(out.audio.codec_name, "aac");
    assert.ok(out.size < inSize, "not smaller");
    assert.equal(probe(input).size, inSize, "the input changed");
  } finally {
    cleanup();
  }
});

test("--max downscales and applies a phone's rotation tag", { skip: !haveFfmpeg && "ffmpeg not installed" }, () => {
  const { dir, cleanup } = tempDir("compress");
  try {
    const flat = path.join(dir, "flat.mp4");
    makeClip(flat);
    const input = path.join(dir, "portrait.mp4");
    ffmpeg(["-display_rotation", "90", "-i", flat, "-c", "copy", input]); // 1280x720 stored, shown as 720x1280
    const output = path.join(dir, "portrait-small.mp4");
    const result = runScript("compress-video.mjs", [input, "--max", "360", "--preset", "veryfast", "--out", output]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /rotated/);
    const out = probe(output);
    assert.equal(out.video.width, 360);
    assert.equal(out.video.height, 640);
  } finally {
    cleanup();
  }
});

test("--size hits a target within 10% with two passes, HEVC tagged hvc1", { skip: !haveFfmpeg && "ffmpeg not installed" }, () => {
  const { dir, cleanup } = tempDir("compress");
  try {
    const input = path.join(dir, "clip.mp4");
    makeClip(input);
    const output = path.join(dir, "clip-1mb.mp4");
    const result = runScript("compress-video.mjs", [input, "--size", "1", "--codec", "hevc", "--preset", "veryfast", "--out", output]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /-pass 1/);
    assert.match(result.stdout, /-pass 2/);
    const out = probe(output);
    assert.equal(out.video.codec_name, "hevc");
    assert.equal(out.video.codec_tag_string, "hvc1");
    assert.ok(out.size < 1.1e6 && out.size > 0.6e6, `size ${out.size}`);
    assert.ok(!existsSync(path.join(dir, "ffmpeg2pass-0.log")), "left a pass log behind");
  } finally {
    cleanup();
  }
});

test("--dry-run prints the command and writes nothing", { skip: !haveFfmpeg && "ffmpeg not installed" }, () => {
  const { dir, cleanup } = tempDir("compress");
  try {
    const input = path.join(dir, "clip.mp4");
    makeClip(input);
    const output = path.join(dir, "never.mp4");
    const result = runScript("compress-video.mjs", [input, "--hw", "--quality", "40", "--dry-run", "--out", output]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Would run:\n\$ ffmpeg .*h264_videotoolbox .*-q:v 40/);
    assert.ok(!existsSync(output));
  } finally {
    cleanup();
  }
});
