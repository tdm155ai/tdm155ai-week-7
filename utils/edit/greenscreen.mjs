#!/usr/bin/env node
// Put a green-screen (or blue-screen) shot on top of a background video or still: ffmpeg chromakey + despill + overlay.
// Never writes over the inputs; output goes to output/edit/. Self-contained (no utils/lib yet when this was written).
//
//   node utils/edit/greenscreen.mjs FOREGROUND BACKGROUND [--color 00FF00] [--similarity 0.2] [--blend 0.05]
//                                   [--position center] [--scale 1] [--still 2] [--out FILE]
//   node utils/edit/greenscreen.mjs FOREGROUND --pick 2       (print the corner colors of the frame at 2 s)

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT_DIR = path.join(REPO_ROOT, "output", "edit");

const USAGE = `Usage: node utils/edit/greenscreen.mjs FOREGROUND BACKGROUND [options]
       node utils/edit/greenscreen.mjs FOREGROUND --pick SECONDS

Key the screen out of FOREGROUND and put what's left over BACKGROUND (a video or a still image).
The output has the background's size and the foreground's length (or the background's, if shorter).

  --color HEX|green|blue   The screen color (default green = 00FF00). Pick it from your footage with --pick.
  --similarity 0-1   How far from that color still counts as screen (default 0.2; raise it if green stays,
                     lower it if the subject disappears)
  --blend 0-1        Softness of the edge (default 0.05; 0 is a hard edge; above 0.1 light colors on the subject start to fade)
  --no-despill       Keep the green tint on hair and edges (despill is on by default)
  --position WHERE   center (default), bottom, bottom-left, bottom-right, top-left, top-right, or X,Y pixels
  --scale FACTOR     Foreground height as a fraction of the background's (default: fit the background's height
                     when the sizes differ, 1 = same height)
  --still SECONDS    Render one frame at that time as a PNG instead of the whole clip, to test settings
  --pick SECONDS     Save the foreground frame at that time and print the colors at its corners (needs ImageMagick)
  --out FILE         Where to write (default output/edit/<fg>-over-<bg>.mp4 or .png, numbered if it exists)
  --dry-run          Print the command without running it
  -h, --help         This text`;

const NAMED = { green: "00FF00", blue: "0000FF" };

function fail(message) {
  console.error(`greenscreen: ${message}`);
  process.exit(1);
}

function have(tool) {
  return spawnSync(tool, ["-version"], { encoding: "utf8" }).status === 0;
}

function show(args) {
  return args.map((a) => (/[\s"'$`\;&|<>()\[\]]/.test(a) ? `'${a.replace(/'/g, `'\\''`)}'` : a)).join(" ");
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
  const info = JSON.parse(result.stdout);
  const video = info.streams.find((s) => s.codec_type === "video");
  if (!video) fail(`${file} has no picture.`);
  const rotation = Number(video.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? 0);
  const sideways = Math.abs(rotation) % 180 === 90;
  const [num, den] = String(video.r_frame_rate || "0/1").split("/").map(Number);
  const isImage = /^(png|mjpeg|jpeg|webp|tiff|bmp|gif)$/.test(video.codec_name) || info.format.format_name?.includes("image2");
  return {
    width: sideways ? video.height : video.width,
    height: sideways ? video.width : video.height,
    duration: isImage ? null : Number(info.format.duration),
    fps: den ? num / den : 0,
    isImage,
    codec: video.codec_name,
    hasAudio: info.streams.some((s) => s.codec_type === "audio"),
  };
}

export function parseColor(value) {
  const named = NAMED[String(value).toLowerCase()];
  const hex = (named || String(value)).replace(/^(#|0x)/i, "").toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(hex)) fail(`--color must be green, blue, or a hex color like 1FB22A (got ${value})`);
  return hex;
}

// Overlay x:y expressions for a named position, or "X,Y" in pixels. W,H are the background, w,h the foreground.
export function positionFor(value) {
  const named = {
    center: ["(W-w)/2", "(H-h)/2"],
    bottom: ["(W-w)/2", "H-h"],
    top: ["(W-w)/2", "0"],
    "bottom-left": ["0", "H-h"],
    "bottom-right": ["W-w", "H-h"],
    "top-left": ["0", "0"],
    "top-right": ["W-w", "0"],
  };
  if (value in named) return named[value];
  const m = /^(-?\d+),(-?\d+)$/.exec(value);
  if (!m) fail(`--position must be one of ${Object.keys(named).join(", ")}, or X,Y in pixels (got ${value})`);
  return [m[1], m[2]];
}

// Which despill type suits the key color: whichever of green or blue the color leans to.
function despillType(hex) {
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return b > g ? "blue" : "green";
}

function freePath(file) {
  if (!existsSync(file)) return file;
  const { dir, name, ext } = path.parse(file);
  for (let n = 2; ; n++) {
    const candidate = path.join(dir, `${name}-${n}${ext}`);
    if (!existsSync(candidate)) return candidate;
  }
}

function pick(foreground, seconds) {
  if (!have("magick")) fail("--pick reads pixels with ImageMagick. Install it with: brew install imagemagick");
  mkdirSync(OUT_DIR, { recursive: true });
  const frame = freePath(path.join(OUT_DIR, `${path.parse(foreground).name}-frame-${seconds}s.png`));
  const grab = run(["ffmpeg", "-hide_banner", "-nostats", "-ss", String(seconds), "-i", foreground, "-frames:v", "1", frame]);
  if (grab.status !== 0) fail(`could not grab a frame:\n${grab.stderr.trim()}`);
  const { width, height } = probe(frame);
  const points = { "top-left": [10, 10], "top-right": [width - 11, 10], "bottom-left": [10, height - 11], "bottom-right": [width - 11, height - 11], center: [Math.floor(width / 2), Math.floor(height / 2)] };
  const format = Object.entries(points).map(([name, [x, y]]) => `${name}: %[hex:p{${x},${y}}]`).join("\\n") + "\\n";
  const read = run(["magick", frame, "-format", format, "info:"]);
  if (read.status !== 0) fail(`ImageMagick could not read the frame:\n${read.stderr.trim()}`);
  console.log(`\nFrame saved to ${frame}\nColors (RRGGBB) at:\n${read.stdout.trim().split("\n").map((l) => "  " + l).join("\n")}`);
  console.log("\nUse a corner's value as --color if the screen is lit evenly; open the frame and read a pixel near the subject's edge if it isn't.");
}

function main(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        color: { type: "string", default: "green" },
        similarity: { type: "string", default: "0.2" },
        blend: { type: "string", default: "0.05" },
        "no-despill": { type: "boolean", default: false },
        position: { type: "string", default: "center" },
        scale: { type: "string" },
        still: { type: "string" },
        pick: { type: "string" },
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
  for (const tool of ["ffmpeg", "ffprobe"]) if (!have(tool)) fail(`${tool} is not installed. Install it with: brew install ffmpeg`);

  const foreground = positionals[0] && path.resolve(positionals[0]);
  if (!foreground || !existsSync(foreground)) fail(`give the green-screen clip first.\n\n${USAGE}`);
  if (o.pick !== undefined) return pick(foreground, Number(o.pick) || 0);

  const background = positionals[1] && path.resolve(positionals[1]);
  if (!background || !existsSync(background)) fail(`give the background (video or image) second.\n\n${USAGE}`);
  const color = parseColor(o.color);
  const similarity = Number(o.similarity);
  const blend = Number(o.blend);
  if (!(similarity > 0 && similarity <= 1)) fail("--similarity must be between 0 and 1");
  if (!(blend >= 0 && blend <= 1)) fail("--blend must be between 0 and 1");
  const [x, y] = positionFor(o.position);

  // 1. Inspect both.
  const fg = probe(foreground);
  const bg = probe(background);
  if (fg.isImage) fail("the foreground must be a video (for a still, see the ImageMagick page)");
  console.log(`Foreground: ${foreground}\n  ${fg.codec} ${fg.width}x${fg.height} ${fg.fps.toFixed(2)} fps, ${fg.duration.toFixed(1)} s${fg.hasAudio ? ", with audio" : ""}`);
  console.log(`Background: ${background}\n  ${bg.isImage ? `${bg.codec} still` : `${bg.codec} video, ${bg.duration.toFixed(1)} s`} ${bg.width}x${bg.height}`);
  console.log(`Key: color ${color}, similarity ${similarity}, blend ${blend}${o["no-despill"] ? "" : `, despill ${despillType(color)}`}, position ${o.position}`);

  // 2. Build the filter graph. Input 0 is the background, input 1 the foreground.
  const scale = o.scale === undefined ? (fg.height === bg.height ? 1 : bg.height / fg.height) : Number(o.scale);
  if (!(scale > 0)) fail("--scale must be a positive number");
  const fgHeight = Math.max(2, Math.round((fg.height * scale) / 2) * 2);
  const fgChain = [`chromakey=0x${color}:${similarity}:${blend}`];
  if (!o["no-despill"]) fgChain.push(`despill=type=${despillType(color)}`);
  if (fgHeight !== fg.height) fgChain.push(`scale=-2:${fgHeight}`);
  const filter = `[1:v]${fgChain.join(",")}[fg];[0:v][fg]overlay=${x}:${y}:shortest=1:format=auto[v]`;

  const still = o.still === undefined ? null : Number(o.still);
  const ext = still === null ? ".mp4" : ".png";
  const output = o.out ? path.resolve(o.out) : freePath(path.join(OUT_DIR, `${path.parse(foreground).name}-over-${path.parse(background).name}${still === null ? "" : `-${still}s`}${ext}`));
  if ([foreground, background].includes(output)) fail("the output would overwrite an input; choose another --out");
  if (existsSync(output)) fail(`${output} already exists; choose another --out`);

  const args = ["ffmpeg", "-hide_banner", "-nostats"];
  if (still !== null) args.push("-ss", String(still));
  if (bg.isImage) args.push("-loop", "1", "-framerate", String(fg.fps || 30));
  args.push("-i", background);
  if (still !== null) args.push("-ss", String(still));
  args.push("-i", foreground, "-filter_complex", filter, "-map", "[v]");
  if (still !== null) {
    args.push("-frames:v", "1", output);
  } else {
    if (fg.hasAudio) args.push("-map", "1:a:0", "-c:a", "aac", "-b:a", "192k");
    else if (bg.hasAudio) args.push("-map", "0:a:0", "-c:a", "aac", "-b:a", "192k");
    if (bg.isImage) args.push("-t", fg.duration.toFixed(3));
    args.push("-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output);
  }

  if (o["dry-run"]) {
    console.log(`\nWould run:\n$ ${show(args)}`);
    return;
  }

  // 3. Render.
  mkdirSync(path.dirname(output), { recursive: true });
  const result = run(args);
  if (result.status !== 0) fail(`ffmpeg failed:\n${result.stderr.trim().split("\n").slice(-8).join("\n")}`);
  console.log(`\nWrote ${output} (${(statSync(output).size / 1e6).toFixed(1)} MB)`);
  if (still !== null) console.log("Open it and look at the edges. Green fringe: raise --similarity a little or keep despill on. Holes in the subject: lower --similarity.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
