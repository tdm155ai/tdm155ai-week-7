---
task: C1
title: Report — normalize audio, compress footage, green-screen key
thread_id: eb2b904e-37c0-42eb-a534-a897385e72ae
agent: Claude Code (Claude Fable 5.1)
started_in: /Users/mk/Development/mk-27/apps/the-notebook
resume: cd /Users/mk/Development/mk-27/apps/the-notebook && claude --resume eb2b904e-37c0-42eb-a534-a897385e72ae
status: Done
date: 2026-10-21
---

## What I built

Three editing recipes, each in the three forms the family brief asks for.

**On the ffmpeg page** (`nextjs/content/resources/cli/ffmpeg.md`), after "Inspect with ffprobe": an intro section ("Three demos") with four `lavfi` commands that generate the demo media (`quiet.wav`, `interview.mp4`, `greenscreen.mp4`, `background.mp4`), then "Demo: normalize audio", "Demo: compress footage", and "Demo: green-screen key". Each has what you need, numbered steps with one line on each command, a check, the script lines, and an "Ask Claude" prompt in a `text` block that makes Claude inspect first, work on a copy, write to `output/`, and show its commands. Three JPEGs beside the doc in `cli/_images/` (waveforms before/after, the green-screen frame before/after; 6–18 KB each). The old "Convert and compress" section kept its flag table and lost the videotoolbox line (now in the demo); "Loudness" kept the measure command and points at the demo instead of the one-pass normalize; the audio table's Normalize row points there too. Everything else on the page is untouched. The compress demo explains delivery compression versus edit proxies and links the proxy section.

**Scripts** in `utils/edit/`, plain Node ES modules with `--help`, `--dry-run`, ffprobe first, output to `output/edit/` (numbered if the name exists, never over an input), every ffmpeg command printed, and an install line when ffmpeg is missing. Task B's `utils/lib` had not landed when I started, so each script is self-contained (about 40 lines of shared helpers duplicated per file; `probe`, `run`, `freePath`).

- `normalize-audio.mjs INPUT [--target web|podcast|broadcast|-18] [--tp -1] [--lra 11] [--out]`: two-pass `loudnorm`, measures the input, applies with the `measured_*` values and `linear=true`, measures the written file again and prints before/after. Audio-only files keep their format (WAV → pcm_s16le, MP3 → libmp3lame, M4A → AAC); videos copy the picture (`-c:v copy`) and re-encode the sound to AAC 192k. Targets: web -14 LUFS / -1 dBTP (YouTube and Spotify play back at about -14), podcast -16 / -1 (Apple Podcasts' delivery spec; the page demo uses this one), broadcast -23 / -1 (EBU R128).
- `compress-video.mjs INPUT [--crf 23 | --size MB] [--codec h264|hevc] [--hw] [--quality 55] [--max 1080] [--preset] [--audio 128k] [--out]`: libx264 CRF by default; `--size` computes the bitrate (minus audio, 3% margin) and runs two passes with a pass log in the temp dir, cleaned up; `--codec hevc` uses libx265 with `-tag:v hvc1`; `--hw` uses `h264_videotoolbox` / `hevc_videotoolbox` with `-q:v` (1–100). `--max N` caps the shorter side (1080p stays 1080p whether landscape or portrait), computed in Node from the probe with the phone's rotation tag applied, so a portrait clip comes out portrait. Frame rate untouched. Prints input and output size, resolution, bitrate, codec, encode time, and percent smaller.
- `greenscreen.mjs FG BG [--color 00FF00|green|blue|hex] [--similarity 0.2] [--blend 0.05] [--no-despill] [--position center|bottom|…|X,Y] [--scale] [--still SECONDS] [--out]` and `greenscreen.mjs FG --pick SECONDS`: `chromakey` + `despill` (green or blue, chosen from the key color) + `overlay`. The background can be a video or a still (looped for the foreground's length); output is the background's size; sound from the foreground if it has any, else the background. `--still` renders one PNG for trying values; `--pick` saves a frame and prints the colors at its corners and center with ImageMagick.

**Skills** in `.agents/skills/{normalize-audio,compress-video,greenscreen}/SKILL.md`, linked from `.claude/skills/<name>` (relative symlinks, as week 6 does). Descriptions in the student's words ("make this smaller", "the audio is too quiet", "put me on a different background"). Bodies: inspect, the one question to ask, run the script (or the demo's commands if the script isn't there), check, report; each points at its demo rather than repeating it.

**Tests** in `utils/test/edit-{normalize-audio,compress-video,greenscreen}.test.mjs` plus a shared `utils/test/edit-helpers.mjs` (temp dirs, lavfi fixtures, probe, loudness, pixel reads via rawvideo so ImageMagick isn't needed). 18 tests, all passing, about 7 s. They cover: parse helpers; `--help`; a quiet WAV landing within 1 LU of -14 LUFS with true peak under the ceiling, sample rate kept, input untouched, refusing to overwrite an output; a video keeping its h264 stream and reaching -16; CRF output smaller with size and frame rate kept; `--max 360` on a rotation-tagged clip giving 360x640; `--size 1 --codec hevc` within 0.6–1.1 MB, tagged hvc1, pass logs cleaned; `--dry-run` writing nothing; the composite's corner being the background color and the subject's pixel the subject color at t=1, length equal to the foreground's; a still background looping; `--still` making a PNG; `--pick` reporting `00FF0x` (skipped quietly if `magick` is absent).

## How to try it

From the repo root (`apps/tdm155ai/tdm155ai-week-7`), with ffmpeg installed:

```sh
node --test utils/test/edit-normalize-audio.test.mjs utils/test/edit-compress-video.test.mjs utils/test/edit-greenscreen.test.mjs
```

Make the demo media (the four commands under "Three demos" on the page), then:

```sh
node utils/edit/normalize-audio.mjs quiet.wav --target podcast
node utils/edit/normalize-audio.mjs interview.mp4
node utils/edit/compress-video.mjs interview.mp4 --max 480
node utils/edit/compress-video.mjs interview.mp4 --size 1 --codec hevc
node utils/edit/compress-video.mjs interview.mp4 --hw
node utils/edit/greenscreen.mjs greenscreen.mp4 --pick 2
node utils/edit/greenscreen.mjs greenscreen.mp4 background.mp4 --still 2
node utils/edit/greenscreen.mjs greenscreen.mp4 background.mp4 --position bottom --scale 0.8
```

The page: http://localhost:3007/resources/cli/ffmpeg (anchors `#demo-normalize-audio`, `#demo-compress-footage`, `#demo-green-screen-key`). The dev server was up and the three images returned 200 as `image/jpeg` when I checked.

## Commits

One commit, by path: the ffmpeg page and its three images, the three scripts, the four test files, the three skills and their symlinks, and this report. Hash in `git log`; message "C1: normalize audio, compress footage, green-screen key …".

## What I couldn't do or didn't check

- **Only generated media.** No real green-screen footage or phone clip was available (Marlon's to-do). The key was tuned on a flat `0x00FF00` screen with a two-tone shape; real footage will want the picked color and probably similarity 0.2–0.3. The compress numbers on the page are for a test pattern already in H.264, and say so.
- **Checked by eye:** the before/after key stills (the pale square on the shape survives at 0.2/0.05 and fades at 0.3/0.1, which is why I moved the script's defaults from 0.3/0.1 to 0.2/0.05 and the page says so), the waveform image. **Checked by ear:** nothing; the demo audio is pink noise, and the loudness claims rest on loudnorm's own measurement of the written files.
- **Loudness targets** are from memory of the platforms' published guidance (YouTube/Spotify about -14, Apple Podcasts -16/-1, EBU R128 -23), dated on the page as "checked 2026-10-21" in the sense that I chose them that day; I did not fetch the platform pages. Worth a 2-minute confirmation before class if the numbers will be quoted.
- **`linear=true` note:** loudnorm uses its linear (plain gain) mode only when the measured true peak after gain stays under the ceiling and the measured LRA is non-zero; on the peaky demo noise it fell back to dynamic and re-measured half an LU under the target, which the page explains. A plain voice recording should land on the number.
- **HEVC hardware with `--size`** is refused (no two-pass in VideoToolbox); the page says sizing is software-only.
- The hardware encoder was run once on the demo clip; I did not compare its picture against libx264 at matched sizes beyond file size.
- I did not run `pnpm` for anything: no dependencies were added, and the root `package.json` is B's.

## For other tasks

**Root `package.json` scripts** (for the orchestrator or B):

```json
"normalize-audio": "node utils/edit/normalize-audio.mjs",
"compress-video": "node utils/edit/compress-video.mjs",
"greenscreen": "node utils/edit/greenscreen.mjs",
"test": "node --test utils/test/*.test.mjs"
```

**CLI README link lines** (for E, `nextjs/content/resources/cli/README.md`), to put wherever the page lists recipes:

```md
- [Demo: normalize audio](ffmpeg.md#demo-normalize-audio): two-pass loudnorm to -14 / -16 / -23 LUFS, for a file or a video's soundtrack
- [Demo: compress footage](ffmpeg.md#demo-compress-footage): H.264 or HEVC by quality or to a size in MB, 4K to 1080p, the Mac's hardware encoder
- [Demo: green-screen key](ffmpeg.md#demo-green-screen-key): pick the color, test similarity on a still, render over a video or image
```

**`AGENTS.md` line** (for the orchestrator), under "Where things go" or the CLI paragraph:

> Editing scripts live in `utils/edit/` (`normalize-audio`, `compress-video`, `greenscreen`, each with `--help` and a matching skill in `.agents/skills/`); they inspect first, write to `output/edit/`, and print the ffmpeg command they ran. The step-by-step versions are the demos at the top of `nextjs/content/resources/cli/ffmpeg.md`.

**For `utils/README.md`** (B): a "Editing" section listing the three scripts with their one-line usage; the `--help` text of each is current.

**For B, if `utils/lib` lands:** the three scripts each carry the same `probe`, `run`, `show`, `freePath`, `have` helpers; they could move to `utils/lib/media.mjs` in one pass. I left them inline so the scripts work today and don't touch B's files.

**For C2:** `utils/test/edit-helpers.mjs` has `tempDir`, `ffmpeg`, `runScript`, `probe`, `pixel` (reads a pixel through rawvideo, no ImageMagick needed); feel free to import it from `edit-remove-bg.test.mjs`. The page uses `_images/ffmpeg-*.jpg` beside the doc; `/context-media/resources/cli/_images/…` serves them and the folder is hidden from the sidebar.

**For E:** I did not touch `cli/README.md`, `more-tools.md`, or `sox.md` (they were modified in the working tree by another agent while I worked). The ffmpeg page still links `more-tools.md#ffmpeg-normalize` and `#auto-editor`; if those anchors move, two links on the ffmpeg page need updating.

**For the orchestrator:** the glob `node --test utils/test/edit-*.test.mjs` also picks up C2's `edit-remove-bg.test.mjs`, which was failing in the shared tree when I ran it (not mine; it may need rembg installed). My three files pass on their own.

## Marlon's words

From the family brief, October 21: "in the usual ll-utilities folder I want some video editing scripts this time around. or at least editing skills. some things = normalize audio. compress footage. remove background of still. greenscreen key to put one video layer on top of another. these can be step by step demos that exist on the resource pages of the command line toool pages, and we can have copy-pastable claude prompts there."

No further words from Marlon reached this thread.

## Decisions and open questions

- **Key defaults 0.2 / 0.05, not 0.3 / 0.1.** Measured on the generated clip: at similarity 0.3 with blend 0.1 a pale (`F0D080`) square on the subject came out partly transparent; at 0.4 it vanished. The page teaches this with the three-still test. Real footage may still want 0.3; the script makes that a flag.
- **`--max` caps the shorter side**, so "1080" means 1080p for both landscape and portrait phone footage. The brief's `--max 1080` read as height; for portrait clips that would have meant 608x1080, which nobody wants.
- **Default compress target is CRF 23 H.264 at the source resolution**; downscaling is opt-in (`--max`) because students shooting 4K for a project may want to keep it.
- **Podcast target on the page, web in the script's default.** The demo file is "speech", so the walkthrough uses -16; the script defaults to web (-14) because most student output goes to YouTube, Instagram, or a website. Easy to flip if Marlon prefers one number everywhere.
- **Demos placed after "Inspect with ffprobe"**, not at the very top, because every demo starts with ffprobe. The at-a-glance table and the shape of a command stay first.
- **The demo media is generated on the page** (four `lavfi` commands) rather than committed, following rule 3; if Marlon supplies real green-screen footage, the "Make the demo media" block and the two key stills should be swapped for it.
- Open: should the three scripts be the seed of an "edit" kit in `ll-kits` once a second app copies them?
