---
title: Sync cameras with a clap
description: Ask Claude to find the same clap in two recordings and make a short synchronized check clip.
author: codex
---

If both cameras recorded the same sound, give Claude a short window around the clap in each file. These are times shown in each original recording, starting at zero; they do not need matching timecode. Keep some shared sound before and after the clap so the tool can check the match.

## Ask Claude

> Sync `cam-a.mov` and `cam-b.mov` using the multicamera utility in this repo. The clap is between 2:00 and 3:00 in camera A and between 5:00 and 7:00 in camera B. Use camera A as the reference and master audio. Inspect both files, find the shared clap, explain the offsets and match quality, and make a side-by-side check clip. Don't change my originals. If the match is uncertain, show me the candidate times instead of guessing. Tell me whether you checked drift near the end.

Claude can run this from the repository root with Node and FFmpeg installed:

```sh
node utils/multicam/sync.mjs 'cam-a.mov@2:00-3:00' 'cam-b.mov@5:00-7:00' --session interview --reference cam1 --master-audio cam1
```

Use a new session name for each attempt. Sources get IDs `cam1`, `cam2`, and so on in the order you supply them. Add more `file@start-end` arguments for more cameras; an audio recording can also be a reference. Windows must span 1.2–180 seconds. Leave about half a second on each side of the clap and narrow the windows if several events look alike.

## Check the result

Open `output/multicam/interview/check.mp4`. Panels follow source order, left to right, with one master audio track. Watch the hands meet and listen to the clap. The neighboring `manifest.json` records source paths, timestamp metadata, candidate evidence, and offsets for later editing. A negative offset means that camera's source time moves earlier on the shared timeline: an event at 5 s aligned with the reference's 3 s gets −2 s.

The tool compares the surrounding sound as well as the peak. A “matched” result is a candidate to inspect; the quality number is a correlation score, not a probability. If evidence is weak or several offsets fit, it prints candidates, leaves the uncertain offset empty, and skips the preview. Try narrower windows around the same event. If there is no common audio, ask Claude to help you sync manually in your editor using a visible clap.

This makes a short check clip and a timing manifest; it does not export full synchronized takes or choose camera cuts. It checks one local event. For a long recording, ask Claude to compare a second shared event near the end before claiming the whole take stays aligned.
