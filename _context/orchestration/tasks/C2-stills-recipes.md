---
task: C2
title: Recipe for stills — remove the background from a photo
author: claude
status: Ready
owns: nextjs/content/resources/cli/imagemagick.md, nextjs/content/resources/cli/rembg.md (new), nextjs/content/resources/cli/_images/{imagemagick,rembg}-* (new), utils/edit/remove-bg.mjs, utils/test/edit-remove-bg.test.mjs, .agents/skills/remove-background/, .claude/skills/remove-background
depends_on: none (reuses B's utils/lib if it has landed)
report: reports/C2-stills-recipes.md
---

Read [C-edit-tools.md](C-edit-tools.md) first: Marlon's words and the three forms every recipe takes (demo on the page with an "Ask Claude" prompt, script, skill). Then read `nextjs/content/resources/cli/imagemagick.md` (it has "Compositing and watermarks") and `more-tools.md` for the sheet format.

## The recipe: remove background of a still (`remove-background`)

Two routes, and the page should say when to use which:

1. **A flat, even background** (a seamless, a wall, a green screen): ImageMagick only. Pick the background color from a corner pixel, make it transparent with `-fuzz` and `-transparent` (or a flood fill from the corners so the subject's own matching colors survive), soften the edge, trim, save as PNG. Show what happens at different `-fuzz` values.
2. **Any background** (a person in a room, an object on a table): **rembg**, an open-source segmentation tool (U²-Net and related models). Write a new sheet, `cli/rembg.md`, in the format of the other CLI sheets: what it is, install without polluting the system (`uv tool install "rembg[cli]"` or `uvx`; check the current package name, extras, and Python support on PyPI and the project's README, and say what you verified), the first run downloading a model (size and where it's cached), models to choose between (`u2net`, `u2net_human_seg`, `isnet-general-use`, `birefnet-*` if present in the installed version), alpha matting for hair, batch a folder, and its license.

Then, for both routes: put the cut-out on a new background with ImageMagick (`-composite`, or a solid color with `-flatten`), and add a soft shadow if it's simple to do well.

The script `utils/edit/remove-bg.mjs` takes `--method flat|rembg` (default: try to tell, and say which it chose and why), `--fuzz`, `--model`, and an optional `--background <color|image>`. The skill's description should catch "cut out the background", "transparent PNG", "put this on white", "remove the background".

The test can cover the flat route with an ImageMagick-drawn subject on a solid background; test rembg only if it's installed, and skip cleanly otherwise. Demo images beside the docs: use a photo you make or one with a clear open license (say which), small.

## When you finish

Commit by path (rule 7) and write `_context/orchestration/reports/C2-stills-recipes.md` (rule 8), with the `package.json` script line, the CLI README link lines, and whether rembg was installed and run for real on Marlon's machine.
