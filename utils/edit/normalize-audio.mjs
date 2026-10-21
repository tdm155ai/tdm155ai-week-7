#!/usr/bin/env node
// Normalize the loudness of an audio file, or of a video's soundtrack, with two-pass EBU R128 loudnorm.
// Pass 1 measures; pass 2 applies the measured values so the result lands on the target.
// Self-contained (no utils/lib yet when this was written). Never writes over the input; output goes to output/edit/.
//
//   node utils/edit/normalize-audio.mjs INPUT [--target web|podcast|broadcast|-16] [--tp -1] [--lra 11] [--out FILE] [--dry-run]

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT_DIR = path.join(REPO_ROOT, "output", "edit");

// Integrated loudness (LUFS) and true peak (dBTP) by destination. Sources, checked 2026-10-21:
//   web: YouTube and Spotify both play back around -14 LUFS, so louder uploads are turned down and quieter ones
//        gain nothing; -1 dBTP leaves room for lossy encoding.
//   podcast: Apple Podcasts' delivery spec asks for -16 LUFS (stereo) and a -1 dBTP ceiling.
//   broadcast: EBU R128 itself, -23 LUFS and -1 dBTP, the television standard.
const TARGETS = {
  web: { I: -14, TP: -1, why: "YouTube and Spotify normalize playback to about -14 LUFS" },
  podcast: { I: -16, TP: -1, why: "Apple Podcasts asks for -16 LUFS, -1 dBTP" },
  broadcast: { I: -23, TP: -1, why: "EBU R128, the television standard" },
};

const USAGE = `Usage: node utils/edit/normalize-audio.mjs INPUT [options]

Two-pass EBU R128 loudness normalization (ffmpeg loudnorm). Works on an audio file
(WAV, AIFF, FLAC, MP3, M4A) or a video (the picture is copied, only the sound changes).

  --target NAME|LUFS   web (-14 LUFS, default), podcast (-16), broadcast (-23), or a number like -18
  --tp DBTP            True-peak ceiling in dBTP (default -1)
  --lra LU             Loudness range target (default 11; smaller flattens dynamics more)
  --out FILE           Where to write (default output/edit/<name>-normalized.<ext>, numbered if it exists)
  --dry-run            Print the commands without running pass 2
  -h, --help           This text

Prints the loudness before, the loudness after, and every ffmpeg command it ran.`;

function fail(message) {
  console.error(`normalize-audio: ${message}`);
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

function probe(file) {
  const result = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], { quiet: true });
  if (result.status !== 0) fail(`ffprobe could not read ${file}:\n${result.stderr.trim()}`);
  return JSON.parse(result.stdout);
}

// loudnorm prints its JSON block on stderr after the ffmpeg banner; take the last {...} it printed.
export function parseLoudnorm(stderr) {
  const start = stderr.lastIndexOf("{");
  const end = stderr.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(stderr.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function measure(file, { I, TP, LRA }) {
  const args = ["ffmpeg", "-hide_banner", "-nostats", "-i", file, "-af", `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json`, "-f", "null", "-"];
  const result = run(args);
  const stats = parseLoudnorm(result.stderr);
  if (result.status !== 0 || !stats) fail(`the measuring pass failed:\n${result.stderr.trim()}`);
  return stats;
}

export function resolveTarget(value) {
  if (value in TARGETS) return { name: value, ...TARGETS[value] };
  const n = Number(value);
  if (!Number.isFinite(n) || n > -5 || n < -70) fail(`--target must be web, podcast, broadcast, or a LUFS value between -70 and -5 (got ${value})`);
  return { name: `${n} LUFS`, I: n, TP: -1, why: "your own target" };
}

function freePath(file) {
  if (!existsSync(file)) return file;
  const { dir, name, ext } = path.parse(file);
  for (let n = 2; ; n++) {
    const candidate = path.join(dir, `${name}-${n}${ext}`);
    if (!existsSync(candidate)) return candidate;
  }
}

// How to write the sound back out, by the output's extension.
function audioCodecFor(ext, hasVideo) {
  switch (ext) {
    case ".wav": return ["-c:a", "pcm_s16le"];
    case ".aif": case ".aiff": return ["-c:a", "pcm_s16be"];
    case ".flac": return ["-c:a", "flac"];
    case ".mp3": return ["-c:a", "libmp3lame", "-q:a", "2"];
    case ".ogg": return ["-c:a", "libvorbis", "-q:a", "6"];
    default: return ["-c:a", "aac", "-b:a", hasVideo ? "192k" : "256k"];
  }
}

function fmt(n, unit) {
  return `${Number(n).toFixed(1)} ${unit}`;
}

function main(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        target: { type: "string", default: "web" },
        tp: { type: "string" },
        lra: { type: "string", default: "11" },
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

  const input = path.resolve(positionals[0]);
  if (!existsSync(input)) fail(`no such file: ${input}`);
  const target = resolveTarget(o.target);
  const TP = o.tp === undefined ? target.TP : Number(o.tp);
  const LRA = Number(o.lra);
  if (!Number.isFinite(TP) || TP > 0 || TP < -9) fail("--tp must be between -9 and 0");
  if (!Number.isFinite(LRA) || LRA < 1 || LRA > 50) fail("--lra must be between 1 and 50");
  const settings = { I: target.I, TP, LRA };

  // 1. Inspect.
  const info = probe(input);
  const audio = info.streams.find((s) => s.codec_type === "audio");
  const video = info.streams.find((s) => s.codec_type === "video" && s.disposition?.attached_pic !== 1);
  if (!audio) fail(`${input} has no audio stream.`);
  const sampleRate = Number(audio.sample_rate) || 48000;
  console.log(`Input: ${input}`);
  console.log(`  ${video ? `video ${video.codec_name} ${video.width}x${video.height} + ` : ""}audio ${audio.codec_name} ${audio.channels} ch ${sampleRate} Hz, ${fmt(info.format.duration, "s")}, ${(statSync(input).size / 1e6).toFixed(1)} MB`);
  console.log(`Target: ${target.name} = ${settings.I} LUFS integrated, ${TP} dBTP, LRA ${LRA} (${target.why})`);

  // 2. Pass 1: measure.
  const before = measure(input, settings);
  console.log(`\nBefore: ${fmt(before.input_i, "LUFS")}, true peak ${fmt(before.input_tp, "dBTP")}, range ${fmt(before.input_lra, "LU")}`);

  // 3. Pass 2: apply with the measured values. linear=true keeps the gain constant across the file when the
  //    true-peak ceiling allows; loudnorm falls back to dynamic (a limiter-like mode) when it doesn't.
  const ext = path.extname(input).toLowerCase() || (video ? ".mp4" : ".wav");
  const output = o.out ? path.resolve(o.out) : freePath(path.join(OUT_DIR, `${path.parse(input).name}-normalized${ext}`));
  if (path.resolve(output) === input) fail("the output would overwrite the input; choose another --out");
  if (existsSync(output)) fail(`${output} already exists; choose another --out`);
  const filter = `loudnorm=I=${settings.I}:TP=${TP}:LRA=${LRA}:measured_I=${before.input_i}:measured_TP=${before.input_tp}:measured_LRA=${before.input_lra}:measured_thresh=${before.input_thresh}:offset=${before.target_offset}:linear=true:print_format=json`;
  const args = ["ffmpeg", "-hide_banner", "-nostats", "-i", input];
  if (video) args.push("-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy", "-movflags", "+faststart");
  args.push("-af", filter, "-ar", String(sampleRate), ...audioCodecFor(ext, Boolean(video)), output);

  if (o["dry-run"]) {
    console.log(`\nWould run:\n$ ${show(args)}`);
    return;
  }
  mkdirSync(path.dirname(output), { recursive: true });
  const applied = run(args);
  if (applied.status !== 0) fail(`pass 2 failed:\n${applied.stderr.trim()}`);
  const stats = parseLoudnorm(applied.stderr);

  // 4. Check the result by measuring the output file itself.
  const after = measure(output, settings);
  console.log(`\nAfter:  ${fmt(after.input_i, "LUFS")}, true peak ${fmt(after.input_tp, "dBTP")}, range ${fmt(after.input_lra, "LU")}${stats ? ` (loudnorm mode: ${stats.normalization_type})` : ""}`);
  console.log(`Wrote ${output} (${(statSync(output).size / 1e6).toFixed(1)} MB)`);
  if (Math.abs(Number(after.input_i) - settings.I) > 1) console.log("Note: more than 1 LU off the target. Short or very dynamic files do this; try a lower --lra or accept it.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
