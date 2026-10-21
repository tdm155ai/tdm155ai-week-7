---
task: C1
title: Recipes for footage and sound — normalize audio, compress footage, green-screen key
author: claude
status: Ready
owns: nextjs/content/resources/cli/ffmpeg.md, nextjs/content/resources/cli/_images/ffmpeg-* (new), utils/edit/normalize-audio.mjs, utils/edit/compress-video.mjs, utils/edit/greenscreen.mjs, utils/test/edit-{normalize-audio,compress-video,greenscreen}.test.mjs, .agents/skills/{normalize-audio,compress-video,greenscreen}/, .claude/skills/{normalize-audio,compress-video,greenscreen}
depends_on: none (reuses B's utils/lib if it has landed)
report: reports/C1-video-audio-recipes.md
---

Read [C-edit-tools.md](C-edit-tools.md) first: Marlon's words and the three forms every recipe takes (demo on the page with an "Ask Claude" prompt, script, skill). Then read `nextjs/content/resources/cli/ffmpeg.md`, which already has short "Convert and compress", "Loudness", and compositing-adjacent sections; build the demos from them and replace or trim what they duplicate, keeping the rest of the page.

## The three recipes

1. **Normalize audio** (`normalize-audio`). Two-pass EBU R128 `loudnorm`: measure, then apply with the measured values. Targets by destination, chosen with a flag: web/streaming (around -14 LUFS integrated, -1 dBTP), broadcast/podcast-style speech (-16 or -23; check current platform guidance and say which you used and why). Works on an audio file or a video's audio, copying the video stream. Report before and after loudness.
2. **Compress footage** (`compress-video`). Make phone or camera footage small enough to share or upload: H.264 (and HEVC as an option; on Apple Silicon say whether `h264_videotoolbox`/`hevc_videotoolbox` is used and the quality trade-off), CRF-based by default, or a target size in MB (two-pass bitrate). Optional downscale (`--max 1080`). Keeps frame rate, rotation, and audio sane; prints input and output size, resolution, bitrate. Explain on the page the difference between compressing for delivery and making an edit-friendly proxy, and link the existing proxy section.
3. **Green-screen key** (`greenscreen`). Put a foreground shot against a green (or blue) screen on top of a background video or still: ffmpeg `chromakey` (or `colorkey`) with similarity and blend, `despill`, scale and position, the background's duration or the foreground's. The script takes `--color` (default green, accepts a hex picked from the footage), `--similarity`, `--blend`, `--position`. The demo walks through picking the key color from a frame (`ffmpeg -ss … -frames:v 1` then reading the pixel with ImageMagick), trying a few similarity values on a single still before rendering the whole clip, and checking edges. For the demo media, generate a foreground with lavfi (a moving shape on `color=green`) unless Marlon supplies real green-screen footage.

Verify every flag against the installed ffmpeg (9.0.2): `ffmpeg -h filter=loudnorm`, `-h filter=chromakey`, `-h encoder=libx264`, and so on.

## When you finish

Commit by path (rule 7) and write `_context/orchestration/reports/C1-video-audio-recipes.md` (rule 8), with the `package.json` script lines and the CLI README link lines you want, and what you checked by eye or ear versus by test.
