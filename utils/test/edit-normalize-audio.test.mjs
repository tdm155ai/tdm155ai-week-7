import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { haveFfmpeg, tempDir, ffmpeg, runScript, probe, loudness } from "./edit-helpers.mjs";
import { parseLoudnorm, resolveTarget } from "../edit/normalize-audio.mjs";

test("parseLoudnorm reads the JSON block loudnorm prints on stderr", () => {
  const stats = parseLoudnorm('banner\n[Parsed_loudnorm_0 @ 0x1] \n{\n\t"input_i" : "-41.75",\n\t"input_tp" : "-38.05"\n}\nsize=N/A');
  assert.equal(stats.input_i, "-41.75");
  assert.equal(parseLoudnorm("nothing here"), null);
});

test("targets: names and numbers", () => {
  assert.equal(resolveTarget("web").I, -14);
  assert.equal(resolveTarget("podcast").I, -16);
  assert.equal(resolveTarget("broadcast").I, -23);
  assert.equal(resolveTarget("-18").I, -18);
});

test("--help prints usage", () => {
  const result = runScript("normalize-audio.mjs", ["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: node utils\/edit\/normalize-audio\.mjs/);
});

test("a quiet WAV lands on -14 LUFS and the input is untouched", { skip: !haveFfmpeg && "ffmpeg not installed" }, () => {
  const { dir, cleanup } = tempDir("normalize");
  try {
    const input = path.join(dir, "quiet.wav");
    ffmpeg(["-f", "lavfi", "-i", "anoisesrc=color=pink:amplitude=0.05:duration=6:seed=1", "-af", "volume='0.8+0.2*sin(t)':eval=frame", "-ar", "48000", input]);
    const before = probe(input);
    const output = path.join(dir, "out", "quiet-normalized.wav");
    const result = runScript("normalize-audio.mjs", [input, "--out", output]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Before: .*LUFS/);
    assert.match(result.stdout, /After: .*LUFS/);
    assert.match(result.stdout, /\$ ffmpeg .*loudnorm=I=-14:TP=-1:LRA=11:measured_I=/);
    assert.ok(existsSync(output));
    const after = loudness(output);
    assert.ok(Math.abs(after.i + 14) < 1, `expected about -14 LUFS, got ${after.i}`);
    assert.ok(after.tp <= -0.9, `true peak ${after.tp} over the ceiling`);
    assert.equal(probe(output).audio.sample_rate, "48000");
    assert.equal(probe(input).size, before.size, "the input changed");
    const again = runScript("normalize-audio.mjs", [input, "--out", output]);
    assert.notEqual(again.status, 0, "wrote over an existing output");
  } finally {
    cleanup();
  }
});

test("a video keeps its picture (stream copy) and gets podcast loudness", { skip: !haveFfmpeg && "ffmpeg not installed" }, () => {
  const { dir, cleanup } = tempDir("normalize");
  try {
    const input = path.join(dir, "clip.mp4");
    ffmpeg(["-f", "lavfi", "-i", "testsrc2=size=320x180:rate=30:duration=4", "-f", "lavfi", "-i", "anoisesrc=color=pink:amplitude=0.02:duration=4:seed=2", "-af", "volume='0.5+0.5*sin(2*t)':eval=frame", "-c:v", "libx264", "-crf", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", input]);
    const output = path.join(dir, "clip-normalized.mp4");
    const result = runScript("normalize-audio.mjs", [input, "--target", "podcast", "--out", output]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /-c:v copy/);
    const out = probe(output);
    assert.equal(out.video.codec_name, "h264");
    assert.equal(out.video.width, 320);
    assert.equal(out.audio.codec_name, "aac");
    assert.ok(Math.abs(loudness(output).i + 16) < 1);
  } finally {
    cleanup();
  }
});
