#!/usr/bin/env node
// Extract still frames from a video with ffmpeg, plus a contact sheet.
//
//   node utils/stills.mjs clip.mp4                    12 evenly spaced frames (default)
//   node utils/stills.mjs clip.mp4 --n 6               6 evenly spaced frames
//   node utils/stills.mjs clip.mp4 --every 2            one frame every 2 seconds
//   node utils/stills.mjs clip.mp4 --at 00:00:03.5      a single frame at that timestamp
//
// Options:
//   --n COUNT        Evenly spaced frames across the whole clip (default 12; ignored with --every or --at).
//   --every SECONDS  One frame every SECONDS, starting at 0.
//   --at HH:MM:SS    A single frame at that timestamp (HH:MM:SS or HH:MM:SS.mmm); no contact sheet.
//   --out DIRECTORY  New folder for the frames (default: alongside the video, "<name>-stills").
//   --dry-run        Print the ffmpeg/ffprobe commands; run nothing, create nothing.
//
// Requires ffmpeg and ffprobe on PATH. Frames are frame-01.jpg, frame-02.jpg, ...; multi-frame runs
// also get contact-sheet.jpg (ffmpeg's tile filter). The output folder is never overwritten.
import {mkdirSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {dirname, join, basename, extname, resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {evenTimestamps, everyTimestamps, parseTimestamp, frameCommands, contactSheetCommand, durationCommand} from './lib/stills.mjs';

function probeDuration(video) {
  const [bin, ...args] = durationCommand(video);
  let output;
  try { output = execFileSync(bin, args, {encoding: 'utf8'}); }
  catch (error) {
    if (error.code === 'ENOENT') throw new Error(`${bin} was not found on PATH; install ffmpeg (which includes ffprobe).`);
    throw new Error(`ffprobe could not read ${video}: ${error.message}`);
  }
  const duration = parseFloat(output.trim());
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Could not read a duration for ${video}; is it a valid video file?`);
  return duration;
}

function runFfmpeg(command) {
  const [bin, ...args] = command;
  try { execFileSync(bin, args, {stdio: ['ignore', 'ignore', 'pipe']}); }
  catch (error) {
    if (error.code === 'ENOENT') throw new Error(`${bin} was not found on PATH; install ffmpeg.`);
    throw new Error(`${bin} failed: ${(error.stderr || error.message).toString().trim().split('\n').slice(-1)[0]}`);
  }
}

function main() {
  const {values: o, positionals} = parseArgs({
    args: process.argv.slice(2), allowPositionals: true,
    options: {n: {type: 'string'}, every: {type: 'string'}, at: {type: 'string'}, out: {type: 'string'},
      'dry-run': {type: 'boolean'}, help: {type: 'boolean', short: 'h'}},
  });
  if (o.help || !positionals.length) {
    console.log(`Usage: node utils/stills.mjs VIDEO [--n 12 | --every SECONDS | --at HH:MM:SS] [--out DIR] [--dry-run]
  --n COUNT        Evenly spaced frames across the whole clip (default 12)
  --every SECONDS  One frame every SECONDS, starting at 0
  --at HH:MM:SS    A single frame at that timestamp; no contact sheet
  --out DIRECTORY  New folder for the frames (default: "<video-name>-stills" beside the video)
  --dry-run        Print the ffmpeg/ffprobe commands; run nothing, create nothing
Requires ffmpeg and ffprobe on PATH.`);
    process.exit(o.help ? 0 : 1);
  }
  if ([o.every, o.at].filter(v => v !== undefined).length > 1) throw new Error('Choose only one of --every and --at (or leave both unset to use --n).');
  const video = resolve(positionals[0]);
  if (!existsSync(video)) throw new Error(`Video not found: ${video}`);
  const out = resolve(o.out || join(dirname(video), `${basename(video, extname(video))}-stills`));
  if (existsSync(out)) throw new Error(`${out} already exists; choose a new --out.`);

  const single = o.at !== undefined;
  let mode, timestamps, duration = null;
  if (single) {
    mode = 'at';
    timestamps = [parseTimestamp(o.at)];
  } else {
    duration = probeDuration(video);
    if (o.every !== undefined) {
      mode = 'every';
      const every = Number(o.every);
      if (!Number.isFinite(every) || every <= 0) throw new Error('--every must be a positive number of seconds.');
      timestamps = everyTimestamps(duration, every);
    } else {
      mode = 'n';
      const n = Number(o.n ?? 12);
      if (!Number.isInteger(n) || n < 1) throw new Error('--n must be a positive integer.');
      timestamps = evenTimestamps(duration, n);
    }
    if (!timestamps.length) throw new Error('No timestamps fell within the clip; check --every against the clip duration.');
  }

  const frames = frameCommands(video, timestamps, out);
  const sheet = frames.length > 1 ? contactSheetCommand(out, frames.length, join(out, 'contact-sheet.jpg')) : null;

  if (o['dry-run']) {
    console.log(JSON.stringify({
      video, duration, mode, out,
      frames: frames.map(f => ({frame: f.frame, timestamp: f.timestamp, file: f.file, command: f.command.join(' ')})),
      contactSheet: sheet ? {cols: sheet.cols, rows: sheet.rows, file: join(out, 'contact-sheet.jpg'), command: sheet.command.join(' ')} : null,
      network: false,
    }, null, 2));
    return;
  }

  mkdirSync(out, {recursive: true});
  for (const frame of frames) {
    runFfmpeg(frame.command);
    console.error(`ok     frame ${String(frame.frame).padStart(2, '0')} at ${frame.timestamp.toFixed(2)}s -> ${frame.file}`);
  }
  if (sheet) {
    runFfmpeg(sheet.command);
    console.error(`ok     contact sheet (${sheet.cols}x${sheet.rows}) -> ${join(out, 'contact-sheet.jpg')}`);
  }
  console.error(`Saved ${out}`);
}

main();
