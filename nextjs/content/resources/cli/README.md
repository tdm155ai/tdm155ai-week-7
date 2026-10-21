---
title: The command line
description: Why ffmpeg, ImageMagick, SoX and friends pair so well with Claude Code, how to ask for edits, and how to work safely.
author: claude
order: 40
checked: 2026-10-20
---

The editing apps put every decision behind a button. The command-line tools put every decision in a line of text. That is the reason they work so well with Claude Code: Claude reads text, writes text, and can run what it writes.

## Why these tools fit Claude

- **Text in, files out.** A command names its input, says what to do, and names its output. Nothing happens that isn't written down.
- **Claude can see what a file is.** `ffprobe` (video and audio), `magick identify` (images), `soxi` (audio) and `exiftool` (metadata) print a file's codec, size, frame rate, duration, sample rate and so on. Claude reads that output before it writes a command, and reads it again afterward to check the result.
- **Write, run, check.** Claude writes the command, runs it, and probes the output. If the duration is off or the frame rate changed, it can see that and fix it without you scrubbing through a timeline.
- **Repeatable.** A command that worked once works on the next file. Save it in a script or a notes file and you have a recipe.
- **Batchable.** The same command can run over every file in a folder: forty proxies, two hundred resized photos, a folder of interviews normalized to the same loudness.
- **Nothing hidden.** No project file, no preferences pane, no render queue you forgot about. If you want to know why something looks the way it does, the answer is in the command.

The apps are still where you make the judgment calls: watching, listening, choosing the cut. The command line is good at the work around those calls: prep, conversion, batch jobs, measurement, and finishing.

## How to ask

Tell Claude what you have, what you want, and where the result should go. Ask it to check its work. Some prompts that work:

- "Make a 720p H.264 proxy of every .mov in this folder. Put them in `output/proxies/` and don't touch the originals. Check each one with ffprobe when you're done."
- "Cut 00:01:12 to 00:01:40 out of `interview.mp4` without re-encoding, then tell me why the cut point moved."
- "Find the silences longer than half a second in `interview.wav` and give me a list of the talking sections with start and end times. Don't cut anything yet."
- "Resize every photo in `shoot/` so the long edge is 2048 px, strip the location data, and save them as JPEGs in `output/web/`. Show me one before and after with `magick identify`."
- "Make a spectrogram of `room-tone.wav` and look at it. Is there a hum? At what frequency?"

Good habits in a prompt: name the folder, say "don't overwrite", ask for a check (`ffprobe`, `identify`, `soxi`), and ask Claude to explain any flag you don't recognize.

## Install

All four main tools come from [Homebrew](https://brew.sh):

```sh
brew install ffmpeg imagemagick sox exiftool
```

Check that they're there:

```sh
ffmpeg -version
magick -version
sox --version
exiftool -ver
```

The sheets in this section were tested on an Apple Silicon Mac on 2026-10-20 with ffmpeg 9.0.2 (plus 7.1.1 for subtitle burn-in), ImageMagick 7.1.1-47, SoX 14.4.2 and ExifTool 13.25, all from Homebrew.

One thing to know now: the standard Homebrew `ffmpeg` no longer includes subtitle burn-in or on-screen text (`subtitles` and `drawtext`). If you need those, install `ffmpeg-full` alongside it. The [ffmpeg sheet](ffmpeg.md#subtitles) explains.

## Safety habits

These matter more when an agent is running the commands.

1. **Work on copies.** Keep camera originals in a folder you never write to. Copy what you need into a working folder.
2. **Write to an `output/` folder.** Ask Claude to put every result in `output/` (or a named subfolder). Never give an output the same name and folder as an input.
3. **Never overwrite originals.** Watch for `-y` in ffmpeg (overwrite without asking), `magick mogrify` without `-path` (rewrites files in place), and `exiftool` without `-o` (edits the file and leaves a `_original` backup). `ffmpeg -n` refuses to overwrite anything.
4. **Check after.** Probe the output: `ffprobe` for duration, codec, frame rate and size; `magick identify` for dimensions; `soxi` for duration and sample rate. Then open it and look or listen.
5. **Try one file before the whole folder.** Run the command on one file, check it, then batch.
6. **Check what's in the file before you share it.** Phone photos and videos carry location and device data. See [ExifTool](more-tools.md#exiftool).

## The sheets

- [ffmpeg and ffprobe](ffmpeg.md): video and audio: inspect, trim, join, convert, resize, captions, thumbnails, GIFs, speed, vertical crops, fades, loudness, silence and scene detection.
- [ImageMagick](imagemagick.md): images: identify, resize, crop, convert (including HEIC), strip metadata, batch, contact sheets, captions, watermarks, color, animated GIFs. Also `sips`, which comes with macOS.
- [SoX](sox.md): audio: inspect, trim, fade, normalize, convert, join, mix, remove silence, noise reduction, tempo and pitch, spectrograms.
- [More tools](more-tools.md): ExifTool, whisper.cpp (transcripts and SRT captions), auto-editor (silence-based cuts that open in Premiere, Resolve or Final Cut), Demucs (stem separation), ffmpeg-normalize, MediaInfo, yt-dlp.
