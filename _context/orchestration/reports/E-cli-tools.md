---
title: CLI tools recommendations and delivery
description: Codex recommendations, verification, and handoff for task E.
author: codex
task: E
thread_id: 01a15ef3-e996-7802-bd44-c7475b4d8e8b
agent: codex
started_in: /Users/mk/Development/mk-27/apps/the-notebook
resume: codex resume 01a15ef3-e996-7802-bd44-c7475b4d8e8b
status: Done
---

## Recommendation

Codex proposal: retain ffmpeg, ImageMagick, and SoX; promote ExifTool, whisper.cpp, and auto-editor. Keep the rest as short entries. This recommendation was written before creating the sheets.

| Tool | Placement and reason |
|---|---|
| ffmpeg / ffprobe | Existing sheet: the general video/audio workhorse. C1 owns it. |
| ImageMagick | Existing sheet: general image editing. C2 owns it and rembg. |
| SoX | Retain: effects chains, noise profiles, and spectrograms complement ffmpeg. Homebrew still supplies 14.4.2; sox_ng conflicts with it. |
| ExifTool | New sheet: inspection and safe metadata removal merit a full workflow. Installed 13.25. |
| whisper.cpp | New sheet: model setup, transcript review, and caption outputs merit their own workflow. Installed 1.9.5. |
| auto-editor | New sheet: preview, margin tuning, and editable timeline export merit their own workflow. Installed 31.7.2. |
| HandBrakeCLI | Short entry: useful presets, overlaps ffmpeg. Homebrew handbrake 1.11.2; not installed. |
| gifski | Short entry: specialized GIF encoding; ffmpeg already covers basic GIFs. Homebrew 1.34.0; not installed. |
| libvips | Short entry: large image batches and low memory use; ImageMagick is the teaching default. Homebrew vips 8.18.7; not installed. |
| Real-ESRGAN / Upscayl CLI | Short entry, defer setup: separate model/backend requirements; no verified local workflow. Official backend and upstream links checked; brew has no real-esrgan formula here. |
| Demucs | Short entry: specialized stem separation, substantial model setup. Check maintained fork rather than archived Meta repository; not run. |
| mpv | Short entry: fills the missing preview role, without becoming another editor. Homebrew 0.41.0; not installed. |
| sips / afconvert | Short entries: useful built-in fallbacks without another installation; local help checked. |
| OpenTimelineIO | Short entry, advanced: editorial interchange, not media rendering; official docs checked. No Homebrew opentimelineio formula here. |
| MLT melt | Short entry, advanced: multitrack framework, too much setup for the core class workflow. Homebrew mlt 7.42.0; official melt reference checked. |
| openai-whisper | Short alternative: duplicate transcription job; avoid a second default. |
| ffmpeg-normalize | Short entry: batch loudness convenience; C1 covers the main recipe. |
| MediaInfo | Short entry: readable inspection alternative to ffprobe. |
| yt-dlp | Short entry: media acquisition rather than editing. |

## What I built

Three full sheets: `exiftool.md`, `whisper-cpp.md`, `auto-editor.md`, each with frontmatter, At a glance, command shape, common jobs, and official references. More tools keeps one-line pointers under the old headings so incoming fragment links still work, and adds short entries for every requested candidate. The CLI README is grouped by photo, video, audio, transcripts, and inspection. C1's report arrived before completion, so its three demo links are included; C2's demo remains a placeholder.

SoX changes are small: create output first, move intermediate music/speech writes under output, use ffmpeg's refusal-to-overwrite flag, and remove a noise-fixture example that wrote outside output. Existing October 20 test observations remain historical rather than being presented as new tests.

Verification on October 21: local tool help, Homebrew information, and current official references checked. Generated JPEG metadata-copy commands succeeded; original JPEG SHA-256 unchanged. sips resized 64×32 to 32×16. Generated four-second video with a silent middle: auto-editor preview succeeded; explicit AAC render produced 2.583333 seconds; Premiere XML, Resolve FCPXML, and Final Cut Pro FCPXML files were created. WAV preparation for Whisper succeeded. afconvert produced one second of 48 kHz, mono, 16-bit PCM, verified with soxi. All six changed/new CLI pages returned HTTP 200 on the existing port 3007 server. Frontmatter and local file links passed; git diff --check passed.

## How to try it

Open http://localhost:3007/resources/cli and the ExifTool, whisper.cpp, auto-editor, More tools, and SoX pages. The existing orchestrator server was used; no server started.

Exact commands for checking installed tools and pages, from a terminal:

```sh
cd /Users/mk/Development/mk-27/apps/the-notebook/apps/tdm155ai/tdm155ai-week-7
exiftool -ver
whisper-cli --version
auto-editor --version
curl -s http://localhost:3007/resources/cli/auto-editor
```

Generated verification artifacts are gitignored in `output/e-cli-check/`. To inspect the completed render and exports:

```sh
cd /Users/mk/Development/mk-27/apps/the-notebook/apps/tdm155ai/tdm155ai-week-7
ffprobe -v error -show_entries format=duration output/e-cli-check/talk-cut-aac.mp4
soxi output/e-cli-check/converted.wav
exiftool -a -G1 -s output/e-cli-check/photo-clean.jpg
```

To repeat the key render with a fresh destination:

```sh
cd /Users/mk/Development/mk-27/apps/the-notebook/apps/tdm155ai/tdm155ai-week-7
auto-editor output/e-cli-check/talk.mp4 --margin 0.3s -c:a aac -o output/e-cli-check/recheck.mp4
```

The student-facing sheets contain the copyable workflows for their own inputs. No generated fixtures or temporary verification harness committed.

## Commits

- `4083c8b` — Organize CLI resources and add metadata transcript and rough-cut sheets. Six task-owned documentation paths only, authored as `mkuzmick <29003991+mkuzmick@users.noreply.github.com>`.
- This report is committed separately by its exact path with message `Record task E CLI tools verification and handoff`.

No push and no parent Notebook pointer change.

## What I couldn't do or didn't check

No new software or models installed. No fresh Whisper transcription (local flags checked; October 20 result clearly attributed). No real student media, GUI import of exported timelines, mpv playback, stem separation, or AI enlargement tested. GPS removal was exercised on a generated JPEG without GPS tags, so this checks command behavior and source preservation, not removal from a GPS-bearing camera file.

Auto-editor's default render failed opening `aac_at`; the explicit `-c:a aac` passed and is now in the sheet. The failed default is not presented as a working recipe. Commands not executed locally are marked `(verify)` on the pages. Homebrew info initially hit the sandbox cache restriction; rerun with approval succeeded for the available formulas. Missing formulas are reported above, not invented install instructions.

## For other tasks

No edits to ffmpeg.md, imagemagick.md, rembg.md, shared utilities, package scripts, or the board. C1 demo links folded in from its report. C2 still-background-removal demo link remains an orchestrator placeholder. Old More tools headings (`#exiftool`, `#whispercpp`, `#auto-editor`) stay as pointers for compatibility. No package scripts requested.

## Marlon's words

From the brief, October 21: "i also want resources pages on the command line tools = imagemagick, ffmpeg and any others you recommend for photo video and audio editing."

## Decisions and open questions

Three new full sheets keep the core list manageable. Specialist tools stay discoverable in More tools. Student media and editor imports still need human review.
