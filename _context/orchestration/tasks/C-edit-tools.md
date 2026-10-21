---
task: C
title: Editing utilities on ffmpeg, SoX, and ImageMagick
author: claude
status: Waiting on Marlon's pick
owns: utils/edit/, utils/test/edit*.test.mjs
depends_on: none (B adds the package.json script line)
report: reports/C-edit-tools.md
---

## Why

Codex's board, from Marlon's October 21 voice planning (paraphrased): new video and audio editing tools in `utils/`, including FFmpeg and ImageMagick.

## Proposed tools (the orchestrator's list; Marlon picks)

Each is a small `.mjs` script that probes first, works on copies, writes to `output/`, and prints the exact ffmpeg / sox / magick command it ran so a student can learn from it.

1. **papercut**: render a rough cut from a list of sections (an SRT-style or JSON list of in/out times over one or more files), making an all-intra copy first when the source is long-GOP so cuts land where asked. The video README already describes this by hand.
2. **silence**: find silences in an interview (ffmpeg `silencedetect`) and write a list of the talking sections, for a paper cut or for `papercut`.
3. **loudness**: measure and normalize to a target (EBU R128 `loudnorm`, two-pass), audio or the audio of a video, video stream copied.
4. **contact-sheet**: a grid of stills from a video at an interval or at scene changes (ffmpeg + ImageMagick montage), for choosing shots and thumbnails.
5. **proxy**: smaller edit-friendly copies of a folder of camera files.
6. **captions**: burn an SRT into a video, or shift an SRT's times by an offset.

## When you finish

Commit by path (rule 7) and write `_context/orchestration/reports/C-edit-tools.md` (rule 8).
