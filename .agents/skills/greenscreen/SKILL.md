---
name: greenscreen
description: Put a person shot on a green or blue screen onto a different background (a video or a still). Use when the student says "put me on a different background", "key out the green", "green screen", "chroma key", "replace the background of my video", or "composite this over that". ffmpeg chromakey + despill + overlay, with a picked key color and a test still before the full render.
---

# Green-screen key

The demo is on the ffmpeg page: `nextjs/content/resources/cli/ffmpeg.md`, "Demo: green-screen key" (`/resources/cli/ffmpeg#demo-green-screen-key`), including how to pick the color from a frame and how to test similarity values on one still before rendering. Don't repeat it; follow it.

## Steps

1. **Inspect both files.** `ffprobe` the foreground (the green-screen shot) and the background (video or image): sizes, lengths, whether each has audio. Say which is which.
2. **Pick the key color** from the footage rather than assuming pure green: `node utils/edit/greenscreen.mjs FG.mp4 --pick 2` saves the frame at 2 s to `output/edit/` and prints the colors at its corners and center. Lit screens come out around `1FB22A` or `00B140`, not `00FF00`. If the corners disagree a lot, the screen is unevenly lit; look at the frame and read a pixel near the subject's edge.
3. **Ask, if not obvious:** where should the subject sit (`--position center|bottom|bottom-left|…` or `X,Y`), how big (`--scale 0.8`), and should the sound come from the foreground (the default when it has any)?
4. **Test on one frame first.** `node utils/edit/greenscreen.mjs FG.mp4 BG.mp4 --color 1FB22A --still 2` writes a PNG. Open it and look at hair and edges. Green fringe left: raise `--similarity` (0.2 → 0.3). Parts of the subject gone, light colors going see-through, or anything green on them vanished: lower it (0.15). Hard, jagged edge: raise `--blend` a little (0.05 → 0.1; past that, light colors on the subject fade). Try two or three values; each still takes a second.
5. **Render:** the same command without `--still`. Output `output/edit/<fg>-over-<bg>.mp4`, the background's size, the foreground's length (or the background's if that's shorter). A still background is looped for the foreground's length.
6. **Check** the whole clip for frames where the key breaks (the subject moving into shadow, motion blur). **Report** the color, similarity, and blend used, the output path, and the ffmpeg command the script printed.

## Don'ts

- Don't render the full clip before a still looks right.
- Don't overwrite the inputs.
- If the "green" screen is a wall of some other color, pass that color; `chromakey` keys any color. For a blue screen pass `--color blue` or its hex; despill switches to blue on its own.
