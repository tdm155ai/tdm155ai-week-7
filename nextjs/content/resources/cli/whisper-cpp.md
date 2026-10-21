---
title: whisper.cpp
description: Make local transcripts and SRT captions, then review them against the recording.
author: codex
order: 40
checked: 2026-10-21
---

## At a glance

| | |
|---|---|
| What | Local speech recognition, text transcripts, SRT and VTT captions. |
| Install | `brew install whisper.cpp`; model downloaded separately. Formula checked with `brew info whisper-cpp`. |
| Checked | Installed 1.9.5; all flags checked against local help on 2026-10-21. No new transcription run today. |
| Best for | Interview paper edits and draft captions. |
| Docs | [Official CLI guide](https://github.com/ggml-org/whisper.cpp/blob/master/examples/cli/README.md). |

## The shape of a command

```sh
whisper-cli -m /path/to/model.bin -f input.wav -osrt -of output/captions
```

`-m` selects the model, `-f` the recording, `-osrt` the format, and `-of` the output prefix without an extension. Create `output/` first. The executable is `whisper-cli`, not `whisper.cpp`.

## Setup and common jobs

**What it does:** runs OpenAI's Whisper speech-recognition models locally on your Mac, with GPU support. Gives you a plain transcript, or SRT/VTT captions with timestamps you can import into an editor or attach with [ffmpeg](ffmpeg.md#subtitles). Nothing is uploaded.

**Install:** `brew install whisper.cpp` (the formula used to be called `whisper-cpp`). The command it installs is `whisper-cli`.

**Model:** Homebrew installs the program but not a model. Download one `.bin` file from the project's [Hugging Face page](https://huggingface.co/ggerganov/whisper.cpp/tree/main) and keep it somewhere you'll remember:

```sh
mkdir -p ~/whisper-models
curl --fail -L -o ~/whisper-models/ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
```

Start with `base.en` for an English interview; use a multilingual model for other languages. Larger models need more disk space and computation. Compare a short passage before transcribing a long recording.

**Earlier test (2026-10-20):** tested with whisper.cpp 1.9.5 and the `tiny.en` model, on speech made with the Mac's `say` command. It read both a 16 kHz WAV and an MP3 directly. The project's docs say to use 16-bit WAV, so if a file fails, convert it first:

```sh
mkdir -p output
ffmpeg -n -i interview.mp4 -ar 16000 -ac 1 -c:a pcm_s16le output/interview-16k.wav
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

## Review the result

Listen while checking names, numbers, quotations, and caption timing. A transcript is a draft; speech recognition can invent words during silence or music. Keep the original recording and use a new output prefix for each attempt. Models download once; the transcription commands then run locally.

## Learn more

- [whisper.cpp](https://github.com/ggml-org/whisper.cpp)
- [CLI reference](https://github.com/ggml-org/whisper.cpp/blob/master/examples/cli/README.md)
- [Models](https://github.com/ggml-org/whisper.cpp/blob/master/models/README.md)
- [Homebrew formula](https://formulae.brew.sh/formula/whisper-cpp)
