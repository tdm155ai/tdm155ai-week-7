// Shared by the edit-*.test.mjs files: generated media (ffmpeg lavfi, never committed) and small probes.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const haveFfmpeg = spawnSync("ffmpeg", ["-version"]).status === 0;

export function tempDir(name) {
  const dir = mkdtempSync(path.join(os.tmpdir(), `${name}-`));
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

export function sh(args, options = {}) {
  const result = spawnSync(args[0], args.slice(1), { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  return result;
}

export function ffmpeg(args) {
  const result = sh(["ffmpeg", "-v", "error", "-y", ...args]);
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${result.stderr}`);
}

export function runScript(script, args, options = {}) {
  return sh(["node", path.join(REPO_ROOT, "utils", "edit", script), ...args], options);
}

export function probe(file) {
  const result = sh(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]);
  if (result.status !== 0) throw new Error(result.stderr);
  const info = JSON.parse(result.stdout);
  return {
    format: info.format,
    video: info.streams.find((s) => s.codec_type === "video"),
    audio: info.streams.find((s) => s.codec_type === "audio"),
    duration: Number(info.format.duration),
    size: Number(info.format.size),
  };
}

// Integrated loudness and true peak of a file, as loudnorm measures them.
export function loudness(file) {
  const result = sh(["ffmpeg", "-hide_banner", "-nostats", "-i", file, "-af", "loudnorm=print_format=json", "-f", "null", "-"]);
  const text = result.stderr;
  const stats = JSON.parse(text.slice(text.lastIndexOf("{"), text.lastIndexOf("}") + 1));
  return { i: Number(stats.input_i), tp: Number(stats.input_tp) };
}

// The RGB of one pixel of the frame at `seconds` (or the only frame of a still).
export function pixel(file, x, y, seconds = 0) {
  const result = spawnSync("ffmpeg", ["-v", "error", "-ss", String(seconds), "-i", file, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 256 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.toString());
  const { video } = probe(file);
  const offset = (y * video.width + x) * 3;
  return [...result.stdout.subarray(offset, offset + 3)];
}
