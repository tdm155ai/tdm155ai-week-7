---
title: The trimmer
description: Mark many segments in a video and export each as its own clip; a starter you can copy into your own app and change with Claude.
author: claude
---

[The trimmer](/tools/trimmer) cuts one long video into many short clips. You mark the segments you want, name them, and export them all at once; ffmpeg does the cutting on your own machine, and nothing is uploaded anywhere.

## Using it

1. **Choose a source.** The menu lists the videos in `_media/sources/`. To add one, drop it on the box (or choose it); it is copied there. The page shows what ffprobe found: length, frame rate, size, codecs.
2. **Mark segments.** Play and scrub to a moment, press **I** for the in point, move on, press **O** for the out point, and **Enter** to add the segment. The keys:

   | Key | Does |
   |---|---|
   | Space | play / pause |
   | J · K · L | play backwards · stop · play forwards (press J or L again to go faster) |
   | ← → | one frame back / on (with Shift: one second) |
   | I · O | mark in · mark out |
   | Enter | add the segment |

3. **Fix the list.** Rename a segment (the name becomes its filename), nudge its in or out point a frame at a time with − and +, set either to the playhead with **here**, **Preview** it, or delete it. The list saves itself beside the video, so a reload brings it back.
4. **Export.** Pick a mode and press **Export**. Each clip shows its progress and then a link.
   - **Fast** copies the video as it is (`-c copy`): seconds per clip and no loss of quality, but a cut can only begin on a keyframe, so a clip may start a little before your in point.
   - **Exact** re-encodes to H.264 and AAC: each clip starts on the frame you marked and plays anywhere, and it takes longer.

## Where the files go

Everything is in the gitignored `_media/` folder at the repo root, beside `nextjs/`, so none of it is committed:

```text
_media/
  sources/
    interview.mp4
    interview.mp4.segments.json    the segment list, saved as you work
  clips/
    interview/
      01-opening.mp4               <number>-<segment name>.mp4
      02-the-good-answer.mp4
```

Exporting again replaces clips with the same number and name; clips from segments you have since renamed or deleted stay until you remove them. The source video is never changed.

## How it's built

| File | What it does |
|---|---|
| `app/tools/trimmer/page.jsx` | The page: lists the videos in `_media/sources/` and shows the trimmer. |
| `app/tools/trimmer/Trimmer.jsx` | Everything in the browser: the player, the keys, the segment list, the upload, the export progress. |
| `app/tools/trimmer/trimmer.css` | How it looks. |
| `app/api/trim/route.js` | Probes a source and returns its segments (GET); cuts the clips and reports progress line by line (POST). |
| `app/api/trim/ffmpeg.mjs` | Runs ffprobe and ffmpeg. The two export recipes are in `clipArgs()`. |
| `app/api/trim/upload/route.js` | Saves a dropped video into `_media/sources/`. |
| `app/api/trim/segments/route.js` | Saves the segment list. |
| `lib/media.mjs` | The shared media layer: safe reading and writing inside `_media/`, used by every tool. |
| `app/media/[...path]/route.js` | Serves `_media/` at `/media/…`, so the page can play the videos. |

The ffmpeg command for one clip in exact mode is, in effect (the quotes keep zsh from reading `?` as a wildcard):

```bash
ffmpeg -ss 10.000 -i _media/sources/interview.mp4 -t 3.000 -map '0:v:0?' -map '0:a:0?' \
  -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k \
  -movflags +faststart _media/clips/interview/02-the-good-answer.mp4
```

Fast mode swaps the encoding options for `-c copy -avoid_negative_ts make_zero`.

## Forking it

Copy `app/tools/trimmer/` and `app/api/trim/` into your own Next app, with `lib/media.mjs` and `app/media/` if it doesn't have them, then ask Claude to change it. Each file starts with a comment saying what it does and what to change first. Some prompts to start from:

```text
In the trimmer, add a third export mode that saves each segment as an animated GIF,
640 pixels wide at 12 frames per second, next to the MP4s. Check the ffmpeg options
against ffmpeg -h on this machine before you use them.
```

```text
Add a "Join" button to the trimmer that puts the exported clips together, in list
order, into one video at _media/clips/<source>/joined.mp4. Use ffmpeg's concat demuxer
in fast mode and re-encode in exact mode.
```

```text
Let me load a transcript (an .srt or .vtt beside the source in _media/sources/) and
show it under the player. Clicking a line should seek there, and selecting several
lines should add them as one segment, named after the first few words.
```
