---
name: normalize-audio
description: Fix the level of a recording or a video's soundtrack. Use when the student says the audio is too quiet, too loud, uneven, "can you make it louder", "match the volume", "normalize", or asks what loudness a podcast, YouTube, or Instagram wants. Two-pass EBU R128 loudnorm with ffmpeg; works on WAV, MP3, M4A, and on MP4/MOV (picture copied untouched).
---

# Normalize audio

The demo, with every step explained, is on the ffmpeg page: `nextjs/content/resources/cli/ffmpeg.md`, "Demo: normalize audio" (`/resources/cli/ffmpeg#demo-normalize-audio` on the site). Don't repeat it here; run it.

## Steps

1. **Inspect first.** `ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,sample_rate,channels -of json FILE`. Say what the file is (audio only, or video with sound) and how long.
2. **Ask one question if the destination isn't obvious:** where is this going? That sets the target: `web` (-14 LUFS, YouTube, Spotify, Instagram, a website) is the default; `podcast` (-16 LUFS, Apple Podcasts' spec, also fine for speech going anywhere); `broadcast` (-23 LUFS, EBU R128, television). If the student names a number, pass it (`--target -18`).
3. **Run the script** from the repo root: `node utils/edit/normalize-audio.mjs FILE --target web`. It measures (pass 1), applies the measured values (pass 2), measures the result, writes to `output/edit/<name>-normalized.<ext>`, and never touches the input. If the script is missing or the student is in another folder, run the two ffmpeg commands from the demo instead, on a copy, writing to `output/`.
4. **Check.** Read the "Before" and "After" lines. After should be within 1 LU of the target with a true peak at or under -1 dBTP. If it's off by more, the file is short or very peaky and loudnorm's limiter held it back: say so; `--lra 7` flattens more, or accept it.
5. **Report** the before and after loudness, the output path, and the ffmpeg command the script printed, so the student learns the command.

## Don'ts

- Don't normalize by peak (`volume=` or `-filter:a loudnorm` one-pass) when the student asked for a platform level; two-pass hits the number.
- Don't re-encode the picture; the script copies it (`-c:v copy`).
- Don't overwrite the original, ever.
