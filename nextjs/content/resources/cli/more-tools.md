---
title: More tools
description: Specialist alternatives, built-in Mac tools, preview players, and advanced timeline tools.
author: codex
order: 40
checked: 2026-10-21
---

Start with the main sheets; add a tool here when it solves a specific problem. Earlier tests below were recorded on October 20. New entries were checked against official documentation and Homebrew information on October 21. `(verify)` means not executed locally; ask Claude to inspect the installed help before running it.

| Tool | Does | Status |
|---|---|---|
| [ExifTool](exiftool.md) | Read, edit, strip metadata | Full sheet |
| [whisper.cpp](whisper-cpp.md) | Transcripts and SRT captions | Full sheet |
| [openai-whisper](#openai-whisper) | The original Whisper, in Python | Documented |
| [auto-editor](auto-editor.md) | Silence-based rough cuts and timelines | Full sheet |
| [Demucs](#demucs) | Split a song into vocals, drums, bass, other | Documented |
| [ffmpeg-normalize](#ffmpeg-normalize) | Loudness-normalize many files at once | Tested (1.43.0) |
| [MediaInfo](#mediainfo) | Readable report of what's in a media file | Documented |
| [yt-dlp](#yt-dlp) | Download video and audio from websites | Installed (2026.08.19); options checked against its help, no downloads |

## ExifTool

See the [ExifTool sheet](exiftool.md) for setup, common jobs, and checks.

## whisper.cpp

See the [whisper.cpp sheet](whisper-cpp.md) for setup, common jobs, and checks.

## openai-whisper

**What it does:** the original Python version of Whisper. Same job as whisper.cpp; slower on a Mac, but simple flags.

**Install:** `brew install openai-whisper` (Homebrew has it) or `pip install -U openai-whisper`. Needs ffmpeg.

**Status:** (verify), documented from the [openai/whisper README](https://github.com/openai/whisper); not run. It downloads its model the first time you run it (the default `turbo` model is about 1.5 GB).

```sh
whisper interview.mp3 --model turbo --language English --output_format srt --output_dir output
```

## auto-editor

See the [auto-editor sheet](auto-editor.md) for setup, common jobs, and checks.

## Demucs

**What it does:** separates a mixed recording into stems: vocals, drums, bass, and everything else. Useful for pulling a voice out of background music, or music out from under a voice.

**Install:** use [adefossez/demucs](https://github.com/adefossez/demucs), which its author describes as the officially maintained Demucs since he left Meta. Its README runs it with `uvx`, which needs [uv](https://docs.astral.sh/uv/) (`brew install uv`):

```sh
uvx demucs --two-stems=vocals -o output/separated song.mp3
```

`--two-stems=vocals` gives you `vocals` and `no_vocals`. Without it you get four files. With the output option above, results go in `output/separated/<model name>/<track name>/` as WAV files (`--mp3` for MP3).

**Status:** (verify), documented from the README; not run. The first run downloads PyTorch and the model (several hundred MB), and separation of a full song takes a while on a laptop.

Only separate music you have the rights to use.

## ffmpeg-normalize

**What it does:** normalizes the loudness of one file or a whole folder using ffmpeg's two-pass EBU R128 loudness filter, so every clip in a project sits at the same level. Works on video files too (it re-encodes the audio and copies the video).

**Install:** run it without installing, using uv: `uvx ffmpeg-normalize ...`. Or `pip install ffmpeg-normalize`. Needs ffmpeg.

**Status:** earlier test (2026-10-20), tested with ffmpeg-normalize 1.43.0 via `uvx`. The output measured -16.0 LUFS.

```sh
uvx ffmpeg-normalize voice.wav -t -16 -o output/voice-16.wav
uvx ffmpeg-normalize interview.mp4 -t -16 -c:a aac -b:a 192k -o output/interview-16.mp4
```

Defaults to know: the target is -23 LUFS (broadcast) unless you set `-t`; -16 is common for online video and podcasts. Without `-o`, results go into a `normalized/` folder as `.mkv`. Video is copied, not re-encoded. Audio is written as uncompressed PCM unless you set `-c:a`, so for an MP4 that plays everywhere add `-c:a aac -b:a 192k`.

Learn more: [ffmpeg-normalize on GitHub](https://github.com/slhck/ffmpeg-normalize)

## MediaInfo

**What it does:** prints a readable report of what's in a media file: container, codecs, bitrates, frame rate, color, timecode, recording date. Some people find it easier to read than ffprobe.

**Install:** `brew install media-info` (the command is `mediainfo`). There is also a Mac app with a window.

**Status:** (verify), documented from [mediaarea.net](https://mediaarea.net/en/MediaInfo); not run.

```sh
mediainfo clip.mov
mediainfo --Output=JSON clip.mov
```

## yt-dlp

**What it does:** downloads video and audio from YouTube and many other sites, with a choice of format, resolution, subtitles and time range.

**Only download what you have the rights to use:** your own uploads, Creative Commons or public-domain material, or footage you have permission for. A site's terms may forbid downloading even when the tool can do it.

**Install:** `brew install yt-dlp` (also install ffmpeg; yt-dlp uses it to merge video and audio).

**Status:** earlier check (2026-10-20), installed (2026.08.19); the options below were checked against `yt-dlp --help`. We did not download anything.

```sh
yt-dlp -P output -F "URL"                                         # list the available formats
yt-dlp -P output -t mp4 "URL"                                     # best quality as an MP4 that plays everywhere
yt-dlp -P output -x --audio-format mp3 "URL"                      # audio only, as MP3
yt-dlp -P output --write-subs --sub-langs en "URL"                # also save the subtitles
yt-dlp -P output --download-sections "*00:01:00-00:02:00" "URL"   # just one minute
```

`-t mp4` is a preset that prefers H.264 and AAC and puts them in an MP4.

Learn more: [yt-dlp on GitHub](https://github.com/yt-dlp/yt-dlp)

## HandBrakeCLI

Use this when you want HandBrake's encoding presets in a script. For trimming, filters, and proxies, start with [ffmpeg](ffmpeg.md).

**Install:** `brew install handbrake` (formula checked: 1.11.2, not installed). This is the command-line formula; the app is a separate cask.

**Status:** (verify), [official command reference](https://handbrake.fr/docs/en/latest/cli/command-line-reference.html) checked. Before selecting a preset, inspect the names available in your version:

```sh
HandBrakeCLI --preset-list
```

Choose the preset and output path deliberately; inspect the encoded file afterward with ffprobe. No encoding recipe has been run here.

## gifski

A dedicated GIF encoder, useful when the GIFs from the [ffmpeg sheet](ffmpeg.md#gif) need a different quality/file-size tradeoff. Keep clips short and compare the resulting size with an MP4 before sharing.

**Install:** `brew install gifski` (formula checked: 1.34.0, not installed). **Status:** (verify); use the [official CLI README](https://github.com/ImageOptim/gifski) for the frame-input workflow and your installed help for options. No conversion run here.

## libvips

For huge images or large thumbnail batches when memory use becomes a problem. ImageMagick remains the general-purpose starting point here.

**Install:** `brew install vips` (formula checked: 8.18.7, not installed). **Status:** (verify); the [official site](https://www.libvips.org/) describes its demand-driven image processing and links to the command-line documentation. No local performance comparison made.

## Real-ESRGAN and Upscayl's backend

For model-based image enlargement, rather than ordinary resizing. Compare faces, text, and textures with the source: enlargement can introduce details. Keep the enlarged image as a new output file.

**Status:** (verify), not installed. [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) documents Python and standalone NCNN routes. [Upscayl's NCNN backend](https://github.com/upscayl/upscayl-ncnn) is a separate project from its desktop app. Binary, models, and GPU support must match your Mac; there is no tested install recipe here. Ordinary resizing with ImageMagick is the simpler default.

## mpv: preview the result

A player to watch and listen after rendering. It complements ffprobe's measurements; it doesn't replace a timeline editor.

**Install:** `brew install mpv` (formula checked: 0.41.0, not installed). **Status:** (verify), commands checked against the [official manual](https://mpv.io/manual/stable/).

```sh
mpv output/rough-cut.mp4
mpv --sub-file=output/interview.srt interview.mp4
```

Space pauses, `.` steps forward one frame while paused, and `q` quits with default bindings. Preview subtitles with the matching recording, before any cuts that would change their timing.

## sips: built-in image fallback

Comes with macOS. Good for a quick dimension check or resize without installing anything. The [ImageMagick sheet](imagemagick.md#sips-built-into-macos) also covers it.

**Status:** local `sips --help` checked and generated-image resize run on 2026-10-21.

```sh
mkdir -p output
sips -g pixelWidth -g pixelHeight photo.jpg
sips -Z 2048 photo.jpg --out output/photo-small.jpg
```

`-Z` sets a maximum dimension while preserving proportions. Always provide `--out`: modification commands can otherwise change the source. Learn more: `man sips` on your Mac.

## afconvert: built-in audio conversion

Comes with macOS. Useful for making a PCM WAV for SoX from audio that Core Audio can read.

**Status:** local `afconvert -h` checked and generated-audio conversion run on 2026-10-21.

```sh
mkdir -p output
afconvert input.aiff output/converted.wav -f WAVE -d LEI16@48000
```

This chooses a WAV container and little-endian 16-bit PCM at 48 kHz. It doesn't normalize loudness. Specify a new output path each time. `afconvert -hf` lists the formats supported on your Mac; `afconvert -h` documents the options.

## OpenTimelineIO: advanced interchange

Use when a project needs to inspect or exchange editorial cut information programmatically. It stores references and timing, not embedded media, and doesn't render a finished video. Format adapters are a separate compatibility question.

**Status:** (verify), not installed; no `opentimelineio` Homebrew formula found here. Follow the [official installation and adapter docs](https://opentimelineio.readthedocs.io/en/latest/). For a first silence-based rough cut, use auto-editor's tested export route instead.

## MLT melt: advanced multitrack work

A command-line multitrack editor built on the MLT framework. Worth exploring for an automated compositing pipeline; it adds more framework concepts than the core ffmpeg recipes need.

**Install:** `brew install mlt` (formula checked: 7.42.0, not installed). **Status:** (verify); the [official melt reference](https://www.mltframework.org/docs/melt/) documents producers, tracks, filters, and consumers. No multitrack render tested here.
