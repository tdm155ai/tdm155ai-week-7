---
title: More tools
description: Short entries for ExifTool, whisper.cpp, auto-editor, Demucs, ffmpeg-normalize, MediaInfo and yt-dlp, with which ones we tested.
author: claude
order: 40
checked: 2026-10-20
---

Each entry says what the tool does, how to install it, and one example. The **Status** line says whether we ran it on a Mac on 2026-10-20 or documented it from the official pages.

| Tool | Does | Status |
|---|---|---|
| [ExifTool](#exiftool) | Read, edit, strip metadata | Tested (13.25) |
| [whisper.cpp](#whispercpp) | Transcripts and SRT captions, on your Mac | Tested (1.9.5, tiny.en model) |
| [openai-whisper](#openai-whisper) | The original Whisper, in Python | Documented |
| [auto-editor](#auto-editor) | Cut silences; export a timeline to Premiere, Resolve, Final Cut | Tested (31.7.2) |
| [Demucs](#demucs) | Split a song into vocals, drums, bass, other | Documented |
| [ffmpeg-normalize](#ffmpeg-normalize) | Loudness-normalize many files at once | Tested (1.43.0) |
| [MediaInfo](#mediainfo) | Readable report of what's in a media file | Documented |
| [yt-dlp](#yt-dlp) | Download video and audio from websites | Installed (2026.08.19); options checked against its help, no downloads |

## ExifTool

**What it does:** reads and writes the metadata inside photos, video and audio files: camera, lens, date taken, GPS location, duration, frame rate. Use it to check what a file reveals before you share it, to strip location data, and to rename files by the date they were shot.

**Install:** `brew install exiftool`

**Status:** tested with ExifTool 13.25.

```sh
exiftool -s -Model -DateTimeOriginal -GPSPosition photo.jpg         # a few fields
exiftool -json photo.jpg                                            # everything, as JSON (for Claude)
exiftool -T -FileName -ImageSize -Duration shoot/                   # one line per file in a folder
exiftool -gps:all= photo.jpg                                        # remove GPS only
exiftool -all= -o output/photo-clean.jpg photo.jpg                  # remove everything, write a new file
exiftool '-FileName<DateTimeOriginal' -d '%Y%m%d-%H%M%S%%-c.%%e' photo.jpg   # rename to 20261018-143000.jpg
```

When ExifTool edits a file in place, it keeps the original as `photo.jpg_original`. Add `-o output/...` to write a new file instead, or `-overwrite_original` only when you're sure.

Learn more: [exiftool.org](https://exiftool.org/)

## whisper.cpp

**What it does:** runs OpenAI's Whisper speech-recognition models locally on your Mac, fast, using the GPU. Gives you a plain transcript, or SRT/VTT captions with timestamps you can import into an editor or attach with [ffmpeg](ffmpeg.md#subtitles). Nothing is uploaded.

**Install:** `brew install whisper.cpp` (the formula used to be called `whisper-cpp`). The command it installs is `whisper-cli`.

**Model:** Homebrew installs the program but not a model. Download one `.bin` file from the project's [Hugging Face page](https://huggingface.co/ggerganov/whisper.cpp/tree/main) and keep it somewhere you'll remember:

```sh
mkdir -p ~/whisper-models
curl -L -o ~/whisper-models/ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
```

| Model | Size on disk | Notes |
|---|---|---|
| `tiny.en` | 75 MiB | Fastest; fine for testing |
| `base.en` | 142 MiB | Good start for English |
| `small.en` | 466 MiB | More accurate |
| `large-v3-turbo` | 1.5 GiB | Most accurate here; any language |

`.en` models are English-only and do better on English. Sizes from the [whisper.cpp models page](https://github.com/ggml-org/whisper.cpp/blob/master/models/README.md).

**Status:** tested with whisper.cpp 1.9.5 and the `tiny.en` model, on speech made with the Mac's `say` command. It read both a 16 kHz WAV and an MP3 directly. The project's docs say to use 16-bit WAV, so if a file fails, convert it first:

```sh
ffmpeg -i interview.mp4 -ar 16000 -ac 1 -c:a pcm_s16le output/interview-16k.wav
```

Transcribe to SRT (writes `output/interview.srt`):

```sh
whisper-cli -m ~/whisper-models/ggml-base.en.bin -f output/interview-16k.wav -osrt -of output/interview
```

Shorter caption lines, split on whole words:

```sh
whisper-cli -m ~/whisper-models/ggml-base.en.bin -f output/interview-16k.wav -osrt -ml 30 -sow -of output/interview-short
```

Other outputs: `-otxt` (plain text), `-ovtt` (WebVTT), `-oj` (JSON). `-l auto` detects the language (with a non-`.en` model).

A transcript with timestamps is the most useful thing you can give Claude about an interview: it can find the quotes, mark the sections, and turn your choices into cut lists.

Learn more: [whisper.cpp on GitHub](https://github.com/ggml-org/whisper.cpp)

## openai-whisper

**What it does:** the original Python version of Whisper. Same job as whisper.cpp; slower on a Mac, but simple flags.

**Install:** `brew install openai-whisper` (Homebrew has it) or `pip install -U openai-whisper`. Needs ffmpeg.

**Status:** documented from the [openai/whisper README](https://github.com/openai/whisper); not run. It downloads its model the first time you run it (the default `turbo` model is about 1.5 GB).

```sh
whisper interview.mp3 --model turbo --language English --output_format srt
```

## auto-editor

**What it does:** finds the silent parts of a video or audio file and cuts them out. It can render a new file, or export the edit as a **timeline** you open in Premiere Pro, DaVinci Resolve, Final Cut Pro, Shotcut or Kdenlive, so you keep every cut adjustable.

**Install:** `brew install auto-editor`. (The project no longer publishes the command-line tool on pip, so ignore older `pip install` instructions. It also offers a downloadable binary.)

**Status:** tested with auto-editor 31.7.2 on a test clip with a 3-second pause.

See what it would cut, without writing anything:

```sh
auto-editor talk.mp4 --preview
```

On the test clip: 8.17 s in, 5.37 s out, one cut of 2.80 s.

Render a new file:

```sh
auto-editor talk.mp4 --margin 0.3s -o output/talk-cut.mp4
```

`--margin 0.3s` keeps 0.3 s of air around each bit of speech so words don't get clipped. `--edit audio:threshold=0.04` changes how quiet counts as silence.

Export a timeline instead of a video:

```sh
auto-editor talk.mp4 --export premiere -o output/talk-premiere          # writes talk-premiere.xml
auto-editor talk.mp4 --export resolve -o output/talk-resolve            # writes talk-resolve.fcpxml
auto-editor talk.mp4 --export final-cut-pro -o output/talk-fcp          # writes talk-fcp.fcpxml
```

Other modes: `shotcut`, `kdenlive`, `resolve-fcp7` (XML for Resolve), and `v3` (auto-editor's own JSON). The timeline points at your original media file, so don't move or rename it before you import.

Learn more: [auto-editor.com](https://auto-editor.com/), [cookbook](https://auto-editor.com/docs/cookbook)

## Demucs

**What it does:** separates a mixed recording into stems: vocals, drums, bass, and everything else. Useful for pulling a voice out of background music, or music out from under a voice.

**Install:** use [adefossez/demucs](https://github.com/adefossez/demucs), which its author describes as the officially maintained Demucs since he left Meta. Its README runs it with `uvx`, which needs [uv](https://docs.astral.sh/uv/) (`brew install uv`):

```sh
uvx demucs --two-stems=vocals song.mp3
```

`--two-stems=vocals` gives you `vocals` and `no_vocals`. Without it you get four files. Results go in `separated/<model name>/<track name>/` as WAV files (`--mp3` for MP3).

**Status:** documented from the README; not run. The first run downloads PyTorch and the model (several hundred MB), and separation of a full song takes a while on a laptop.

Only separate music you have the rights to use.

## ffmpeg-normalize

**What it does:** normalizes the loudness of one file or a whole folder using ffmpeg's two-pass EBU R128 loudness filter, so every clip in a project sits at the same level. Works on video files too (it re-encodes the audio and copies the video).

**Install:** run it without installing, using uv: `uvx ffmpeg-normalize ...`. Or `pip install ffmpeg-normalize`. Needs ffmpeg.

**Status:** tested with ffmpeg-normalize 1.43.0 via `uvx`. The output measured -16.0 LUFS.

```sh
uvx ffmpeg-normalize voice.wav -t -16 -o output/voice-16.wav
uvx ffmpeg-normalize interview.mp4 -t -16 -c:a aac -b:a 192k -o output/interview-16.mp4
```

Defaults to know: the target is -23 LUFS (broadcast) unless you set `-t`; -16 is common for online video and podcasts. Without `-o`, results go into a `normalized/` folder as `.mkv`. Video is copied, not re-encoded. Audio is written as uncompressed PCM unless you set `-c:a`, so for an MP4 that plays everywhere add `-c:a aac -b:a 192k`.

Learn more: [ffmpeg-normalize on GitHub](https://github.com/slhck/ffmpeg-normalize)

## MediaInfo

**What it does:** prints a readable report of what's in a media file: container, codecs, bitrates, frame rate, color, timecode, recording date. Some people find it easier to read than ffprobe.

**Install:** `brew install media-info` (the command is `mediainfo`). There is also a Mac app with a window.

**Status:** documented from [mediaarea.net](https://mediaarea.net/en/MediaInfo); not run.

```sh
mediainfo clip.mov
mediainfo --Output=JSON clip.mov
```

## yt-dlp

**What it does:** downloads video and audio from YouTube and many other sites, with a choice of format, resolution, subtitles and time range.

**Only download what you have the rights to use:** your own uploads, Creative Commons or public-domain material, or footage you have permission for. A site's terms may forbid downloading even when the tool can do it.

**Install:** `brew install yt-dlp` (also install ffmpeg; yt-dlp uses it to merge video and audio).

**Status:** installed (2026.08.19); the options below were checked against `yt-dlp --help`. We did not download anything.

```sh
yt-dlp -F "URL"                                         # list the available formats
yt-dlp -t mp4 "URL"                                     # best quality as an MP4 that plays everywhere
yt-dlp -x --audio-format mp3 "URL"                      # audio only, as MP3
yt-dlp --write-subs --sub-langs en "URL"                # also save the subtitles
yt-dlp --download-sections "*00:01:00-00:02:00" "URL"   # just one minute
```

`-t mp4` is a preset that prefers H.264 and AAC and puts them in an MP4.

Learn more: [yt-dlp on GitHub](https://github.com/yt-dlp/yt-dlp)
