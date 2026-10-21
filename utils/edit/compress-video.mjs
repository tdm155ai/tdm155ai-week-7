#!/usr/bin/env node
// Make phone or camera footage small enough to share or upload. H.264 by default (plays everywhere), HEVC as an
// option, quality-based (CRF) by default or a target size in MB (two-pass). Optional downscale. Keeps the frame rate,
// applies the phone's rotation, and re-encodes the audio to AAC. Never writes over the input; output goes to output/edit/.
// Self-contained (no utils/lib yet when this was written).
//
//   node utils/edit/compress-video.mjs INPUT [--crf 23 | --size 25] [--codec h264|hevc] [--hw] [--max 1080] [--out FILE]

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT_DIR = path.join(REPO_ROOT, "output", "edit");

const USAGE = `Usage: node utils/edit/compress-video.mjs INPUT [options]

Compress a video for sharing. Default: H.264, CRF 23, AAC 128k, same frame rate and size.

  --crf N          Quality target for the software encoders (default 23; 18 looks like the original, 28 is small)
  --size MB        Aim for this file size instead (two-pass bitrate; software encoders only)
  --codec h264|hevc   H.264 plays everywhere (default). HEVC is about 30% smaller at the same look but older
                   players and some websites refuse it.
  --hw             Use the Mac's hardware encoder (h264_videotoolbox / hevc_videotoolbox): several times faster,
                   somewhat bigger at the same quality. Quality is --quality 1-100 (default 55), not CRF.
  --quality N      Hardware encoder quality, 1 (worst) to 100 (best); only with --hw
  --max N          Downscale so the shorter side is at most N pixels (1080 for 1080p, 720 for 720p)
  --preset NAME    x264/x265 speed preset (default medium; veryfast is quicker and a little bigger)
  --audio KBPS     AAC bitrate (default 128k)
  --out FILE       Where to write (default output/edit/<name>-<codec>.mp4, numbered if it exists)
  --dry-run        Print the command without running it
  -h, --help       This text

Prints the input and output size, resolution, and bitrate, and every ffmpeg command it ran.`;

function fail(message) {
  console.error(`compress-video: ${message}`);
  process.exit(1);
}

function have(tool) {
  return spawnSync(tool, ["-version"], { encoding: "utf8" }).status === 0;
}

function show(args) {
  return args.map((a) => (/[\s"'$`\;&|<>()]/.test(a) ? `'${a.replace(/'/g, `'\\''`)}'` : a)).join(" ");
}

function run(args, { quiet = false } = {}) {
  if (!quiet) console.log(`\n$ ${show(args)}`);
  const result = spawnSync(args[0], args.slice(1), { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.error) fail(result.error.message);
  return result;
}

export function probe(file) {
  const result = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], { quiet: true });
  if (result.status !== 0) fail(`ffprobe could not read ${file}:\n${result.stderr.trim()}`);
  const info = JSON.parse(result.stdout);
  const video = info.streams.find((s) => s.codec_type === "video" && s.disposition?.attached_pic !== 1);
  const audio = info.streams.find((s) => s.codec_type === "audio");
  if (!video) fail(`${file} has no video stream.`);
  const rotation = Number(video.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? video.tags?.rotate ?? 0);
  const sideways = Math.abs(rotation) % 180 === 90;
  const [num, den] = String(video.r_frame_rate || "0/1").split("/").map(Number);
  return {
    size: Number(info.format.size),
    duration: Number(info.format.duration),
    bitrate: Number(info.format.bit_rate),
    codec: video.codec_name,
    fps: den ? num / den : 0,
    rotation,
    // The picture as a viewer sees it (after the phone's rotation tag is applied).
    width: sideways ? video.height : video.width,
    height: sideways ? video.width : video.height,
    audio: audio ? { codec: audio.codec_name, channels: audio.channels } : null,
  };
}

// Scale so the shorter side is at most max, keeping the aspect ratio, both sides even.
export function fitted(width, height, max) {
  const shorter = Math.min(width, height);
  if (!max || shorter <= max) return null;
  const factor = max / shorter;
  const even = (n) => Math.max(2, Math.round((n * factor) / 2) * 2);
  return { width: even(width), height: even(height) };
}

// Video bitrate in kbit/s that lands a file of sizeMB with the audio taken out, with a 3% margin for container overhead.
export function bitrateFor(sizeMB, duration, audioKbps) {
  const total = (sizeMB * 8 * 1000 * 1000) / duration / 1000; // kbit/s for the whole file
  const video = Math.floor((total - audioKbps) * 0.97);
  if (video < 100) fail(`${sizeMB} MB is too small for ${duration.toFixed(0)} s of video with ${audioKbps}k audio; the picture would get under 100 kbit/s`);
  return video;
}

function freePath(file) {
  if (!existsSync(file)) return file;
  const { dir, name, ext } = path.parse(file);
  for (let n = 2; ; n++) {
    const candidate = path.join(dir, `${name}-${n}${ext}`);
    if (!existsSync(candidate)) return candidate;
  }
}

function mb(bytes) {
  return `${(bytes / 1e6).toFixed(1)} MB`;
}

function kbps(bits) {
  return `${Math.round(bits / 1000)} kbit/s`;
}

function main(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        crf: { type: "string" },
        size: { type: "string" },
        codec: { type: "string", default: "h264" },
        hw: { type: "boolean", default: false },
        quality: { type: "string" },
        max: { type: "string" },
        preset: { type: "string", default: "medium" },
        audio: { type: "string", default: "128k" },
        out: { type: "string" },
        "dry-run": { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
      },
    });
  } catch (error) {
    fail(`${error.message}\n\n${USAGE}`);
  }
  const { values: o, positionals } = parsed;
  if (o.help) return console.log(USAGE);
  if (positionals.length !== 1) fail(`give one input file.\n\n${USAGE}`);
  for (const tool of ["ffmpeg", "ffprobe"]) if (!have(tool)) fail(`${tool} is not installed. Install it with: brew install ffmpeg`);
  if (!["h264", "hevc"].includes(o.codec)) fail("--codec must be h264 or hevc");
  if (o.crf !== undefined && o.size !== undefined) fail("choose --crf or --size, not both");
  if (o.hw && o.size !== undefined) fail("--size needs the two-pass software encoder; drop --hw");
  if (o.quality !== undefined && !o.hw) fail("--quality is for --hw; use --crf for the software encoders");
  const crf = o.crf === undefined ? 23 : Number(o.crf);
  const sizeMB = o.size === undefined ? null : Number(o.size);
  const quality = o.quality === undefined ? 55 : Number(o.quality);
  const max = o.max === undefined ? null : Number(o.max);
  const audioKbps = Number(String(o.audio).replace(/k$/i, ""));
  if (!Number.isFinite(crf) || crf < 0 || crf > 51) fail("--crf must be 0 to 51");
  if (sizeMB !== null && (!Number.isFinite(sizeMB) || sizeMB <= 0)) fail("--size must be a positive number of MB");
  if (!Number.isFinite(quality) || quality < 1 || quality > 100) fail("--quality must be 1 to 100");
  if (max !== null && (!Number.isInteger(max) || max < 2)) fail("--max must be a whole number of pixels");
  if (!Number.isFinite(audioKbps) || audioKbps < 32) fail("--audio must be a bitrate like 128k");

  const input = path.resolve(positionals[0]);
  if (!existsSync(input)) fail(`no such file: ${input}`);

  // 1. Inspect.
  const info = probe(input);
  console.log(`Input: ${input}`);
  console.log(`  ${info.codec} ${info.width}x${info.height}${info.rotation ? ` (rotated ${info.rotation}°, applied on output)` : ""} ${info.fps.toFixed(2)} fps, ${info.duration.toFixed(1)} s, ${mb(info.size)}, ${kbps(info.bitrate)}${info.audio ? `, audio ${info.audio.codec} ${info.audio.channels} ch` : ", no audio"}`);

  // 2. Decide.
  const scaled = fitted(info.width, info.height, max);
  const encoder = o.hw ? (o.codec === "hevc" ? "hevc_videotoolbox" : "h264_videotoolbox") : o.codec === "hevc" ? "libx265" : "libx264";
  const output = o.out ? path.resolve(o.out) : freePath(path.join(OUT_DIR, `${path.parse(input).name}-${o.codec}.mp4`));
  if (output === input) fail("the output would overwrite the input; choose another --out");
  if (existsSync(output)) fail(`${output} already exists; choose another --out`);

  const base = ["ffmpeg", "-hide_banner", "-nostats", "-i", input, "-map", "0:v:0"];
  if (info.audio) base.push("-map", "0:a:0");
  if (scaled) base.push("-vf", `scale=${scaled.width}:${scaled.height}`);
  base.push("-c:v", encoder, "-pix_fmt", "yuv420p");
  if (o.codec === "hevc") base.push("-tag:v", "hvc1"); // so QuickTime and Safari recognize the HEVC
  if (!o.hw) base.push("-preset", o.preset);
  const audioArgs = info.audio ? ["-c:a", "aac", "-b:a", `${audioKbps}k`] : [];
  const tail = [...audioArgs, "-movflags", "+faststart", output];

  const commands = [];
  if (o.hw) {
    commands.push([...base, "-q:v", String(quality), ...tail]);
  } else if (sizeMB === null) {
    commands.push([...base, "-crf", String(crf), ...tail]);
  } else {
    const videoKbps = bitrateFor(sizeMB, info.duration, info.audio ? audioKbps : 0);
    const log = path.join(os.tmpdir(), `compress-video-${process.pid}`);
    const rate = ["-b:v", `${videoKbps}k`, "-passlogfile", log];
    commands.push([...base, ...rate, "-pass", "1", "-an", "-f", "null", "/dev/null"]);
    commands.push([...base, ...rate, "-pass", "2", ...tail]);
    commands.log = log;
    console.log(`  Target ${sizeMB} MB over ${info.duration.toFixed(1)} s: video ${videoKbps} kbit/s + audio ${info.audio ? audioKbps : 0} kbit/s, two passes`);
  }
  if (scaled) console.log(`  Downscaling to ${scaled.width}x${scaled.height}`);

  if (o["dry-run"]) {
    for (const command of commands) console.log(`\nWould run:\n$ ${show(command)}`);
    return;
  }

  // 3. Encode.
  mkdirSync(path.dirname(output), { recursive: true });
  const started = Date.now();
  for (const command of commands) {
    const result = run(command);
    if (result.status !== 0) {
      if (o.hw && /videotoolbox|hardware/i.test(result.stderr)) fail(`the hardware encoder refused this file; try again without --hw:\n${result.stderr.trim().split("\n").slice(-5).join("\n")}`);
      fail(`ffmpeg failed:\n${result.stderr.trim().split("\n").slice(-8).join("\n")}`);
    }
  }
  if (commands.log) for (const suffix of ["-0.log", "-0.log.mbtree", "-0.log.cutree", "-0.log.temp"]) rmSync(commands.log + suffix, { force: true });

  // 4. Report.
  const out = probe(output);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\nWrote ${output}`);
  console.log(`  ${out.codec} ${out.width}x${out.height} ${out.fps.toFixed(2)} fps, ${out.duration.toFixed(1)} s, ${mb(out.size)}, ${kbps(out.bitrate)} (${encoder}, ${seconds} s)`);
  console.log(`  ${mb(info.size)} → ${mb(out.size)}: ${Math.round((1 - out.size / info.size) * 100)}% smaller`);
  if (sizeMB !== null && out.size > sizeMB * 1e6 * 1.05) console.log(`Note: the file came out over ${sizeMB} MB; the encoder couldn't hold the bitrate down on this footage. Try --max 720 or a smaller --size.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
