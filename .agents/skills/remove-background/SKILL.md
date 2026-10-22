---
name: remove-background
description: Remove the background from a still image, cut out the background, make a transparent PNG, put this on white, or put a photo on a different background using local ImageMagick or rembg.
title: Remove a still-image background
author: codex
---

Work from this repository's root. Read the demos in `nextjs/content/resources/cli/imagemagick.md` and `nextjs/content/resources/cli/rembg.md` for commands and examples.

- Inspect the original with `magick identify` before editing. Check dimensions, orientation, alpha and whether it is a single still. Look at the image to decide what belongs to the subject; uniform corners alone do not prove the background is flat.
- Use `flat` for an even backdrop connected to the corners. Ask about tolerance only if the subject and backdrop overlap in color; start low and compare edges. Use `rembg` for a room, foliage, or other varied scene. It downloads a model on first use, then processes locally. Use an explicit local model; the sheet explains model choices and their separate licenses.
- Resolve the desired result from the request: transparent PNG, a solid color, or a supplied background image. Ask for a missing background image or subject selection only when needed. Preserve originals and write new files in `output/edit/`.
- Run `node utils/edit/remove-bg.mjs --help`, then run the script with the chosen `--method`, `--fuzz` or `--model`, and optional `--background`. The default output directory is unique. For hair, try `--alpha-matting` with rembg and compare against the first pass. Do not silently install a different tool, use a cloud backend, or treat model output as a verified mask.
- View the cutout against light and dark backgrounds at 100%. Check hair, glass, holes between limbs, matching colors inside the subject, and any objects the model mistakenly kept. Use `mask-stage.png` for the untrimmed result. Lower fuzz if subject detail disappeared; use rembg or a manual mask if flood fill leaks through a matching edge.
- Report the chosen method and settings, the exact command, output paths, and any edge defects still visible. Link the relevant resource demo rather than copying its full instructions.
