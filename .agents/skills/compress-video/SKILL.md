---
name: compress-video
description: Make a video file smaller. Use when the student says "make this smaller", "it won't upload", "too big to email / for Canvas / for Slack", "under 25 MB", "compress", "export for the web", or wants a 1080p or 720p version of phone or camera footage. H.264 or HEVC with ffmpeg, by quality (CRF) or to a target size in MB, with optional downscaling.
---

# Compress video

The demo is on the ffmpeg page: `nextjs/content/resources/cli/ffmpeg.md`, "Demo: compress footage" (`/resources/cli/ffmpeg#demo-compress-footage`). It also explains delivery compression versus edit proxies. Don't repeat it; run it.

## Steps

1. **Inspect first.** `ffprobe -v error -show_entries format=size,duration,bit_rate:stream=codec_name,width,height,r_frame_rate -of json FILE`. Say the size, length, resolution, codec, and bitrate. Phone footage is often 4K at 50–100 Mbit/s; that's why it's big.
2. **Decide with the student, one question at most:**
   - A size limit ("under 25 MB for email", "100 MB for Canvas")? Use `--size MB` (two-pass).
   - Otherwise quality: default `--crf 23` is a good share copy; `--crf 20` for something they'll be proud of; `--crf 28` when small matters most.
   - Resolution: `--max 1080` if the source is 4K and the destination is a screen or a website; `--max 720` for chat and email.
   - Codec: H.264 (default) unless they know the destination plays HEVC; HEVC is about 30% smaller but some websites and older players refuse it.
   - Speed: `--hw` uses the Mac's VideoToolbox encoder, several times faster and a little bigger. Good for long footage when time matters; not available with `--size`.
3. **Run the script** from the repo root: `node utils/edit/compress-video.mjs FILE --max 1080` (plus `--size 25` or `--crf N`). Output goes to `output/edit/<name>-h264.mp4`; the input is never changed. Without the script, run the demo's ffmpeg command on a copy, writing to `output/`.
4. **Check.** Read the summary: input size → output size, resolution, bitrate, time. Open the output and scrub through it; look at fast motion and dark areas for blockiness. If it's over the size limit, the script says so: lower `--max` or `--size`.
5. **Report** sizes before and after, what was kept (frame rate, rotation, audio), and the ffmpeg command the script printed.

## Don'ts

- Don't change the frame rate or crop unless asked.
- Don't use this to make an edit proxy; the proxy recipe on the ffmpeg page is for that (fast preset, 720p, later relinked to the originals).
- Don't overwrite the original.
