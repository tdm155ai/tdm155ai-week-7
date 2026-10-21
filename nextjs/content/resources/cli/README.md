---
title: The command line
description: Why ffmpeg, ImageMagick, SoX and friends pair so well with Claude Code, how to ask for edits, and how to work safely.
author: codex
order: 40
checked: 2026-10-21
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

Verification varies by page: check each sheet's version and status. On October 21, Homebrew install names above and the local ExifTool, whisper.cpp, auto-editor, SoX, sips, and afconvert help were checked. `(verify)` marks optional workflows not run locally. Install only what you need.

For subtitle burn-in, check the filters in your ffmpeg build first. See the [ffmpeg subtitle notes](ffmpeg.md#subtitles) for build-specific instructions.

## Safety habits

These matter more when an agent is running the commands.

1. **Work on copies.** Keep camera originals in a folder you never write to. Copy what you need into a working folder.
2. **Write to an `output/` folder.** Ask Claude to put every result in `output/` (or a named subfolder). Never give an output the same name and folder as an input.
3. **Never overwrite originals.** Watch for `-y` in ffmpeg (overwrite without asking), `magick mogrify` without `-path` (rewrites files in place), and `exiftool` without `-o` (edits the file and leaves a `_original` backup). `ffmpeg -n` refuses to overwrite anything.
4. **Check after.** Probe the output: `ffprobe` for duration, codec, frame rate and size; `magick identify` for dimensions; `soxi` for duration and sample rate. Then open it and look or listen.
5. **Try one file before the whole folder.** Run the command on one file, check it, then batch.
6. **Check what's in the file before you share it.** Phone photos and videos carry location and device data. See [ExifTool](exiftool.md).

## The sheets: start with your job

### Photo

- [ImageMagick](imagemagick.md): resize, crop, convert, contact sheets, and image batches.
- [ExifTool](exiftool.md): inspect camera and location metadata; make a sharing copy.
- [More tools](more-tools.md): built-in [sips](more-tools.md#sips-built-in-image-fallback), libvips for large batches, and model-based enlargement options.

### Video

- [ffmpeg and ffprobe](ffmpeg.md): trims, conversions, proxies, crops, captions, and output inspection.
- [auto-editor](auto-editor.md): preview silence-based cuts and export an editable rough cut.
- [More tools](more-tools.md): HandBrakeCLI presets, gifski, and mpv for playback checks.

### Audio

- [SoX](sox.md): effects chains, noise profiles, fades, and spectrograms.
- [ffmpeg](ffmpeg.md#audio-with-ffmpeg): extract and convert soundtracks, mix, and measure loudness.
- [More tools](more-tools.md): Demucs for stems, ffmpeg-normalize for batches, and the Mac's afconvert.

### Transcripts and captions

- [whisper.cpp](whisper-cpp.md): local transcript and SRT/VTT drafts; review against the recording.
- [ffmpeg subtitles](ffmpeg.md#subtitles): attach or burn captions into video after checking timing.

### Inspecting files

- [ffprobe](ffmpeg.md#inspect-with-ffprobe): streams, codecs, dimensions, duration, and frame rate.
- [ImageMagick identify](imagemagick.md#identify-what-is-this-image): image dimensions and format.
- [soxi](sox.md#inspect-with-soxi): audio sample rate, channels, and duration.
- [ExifTool](exiftool.md): metadata as readable text or JSON.
- [MediaInfo](more-tools.md#mediainfo): an alternative readable media report.

## Demos

- [Demo: normalize audio](ffmpeg.md#demo-normalize-audio): two-pass loudness normalization.
- [Demo: compress footage](ffmpeg.md#demo-compress-footage): quality, file size, and resolution choices.
- [Demo: green-screen key](ffmpeg.md#demo-green-screen-key): choose the key, test a still, and composite.

C2 still-background-removal demo link pending: the orchestrator will add it once C2 reports. The rembg sheet is being prepared by C2.
