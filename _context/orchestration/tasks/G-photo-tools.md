---
task: G
title: A photo editor and a background remover (local and Nano Banana)
author: claude
status: Waiting on F's media-layer commit
owns: nextjs/app/tools/photo/, nextjs/app/tools/remove-bg/, nextjs/app/api/photo/, nextjs/app/api/remove-bg/, nextjs/lib/openrouter.mjs (new), nextjs/content/resources/tools/{photo,remove-bg}.md (new), the tools array at the top of nextjs/app/tools/page.jsx (two entries only)
depends_on: F's first commit (lib/media.mjs and app/media/); C2's rembg sheet for the local method's install line
report: reports/G-photo-tools.md
---

## Marlon's words

October 21: "and then a photo editor and photo background remover (including one that uses openrouter nano banana because it's good at that)". Same standard as F: **forkable starters**, one folder per tool, plainly written, a comment at the top saying what to change first.

## Read first

F's report (or, if it isn't written yet, `nextjs/lib/media.mjs` from F's media-layer commit): use its helpers to read and write `_media/photos/`, and don't change them; if you need something more, say so in your report. Week 6's `nextjs/app/api/video/` and `lib/video-jobs.mjs` show how an app route calls a model with a key from `nextjs/.env.local`.

## The task

1. **`/tools/photo`, the photo editor**, all in the browser with a canvas: open from `_media/photos/` or drop a file (saved there); crop (free and fixed ratios: 1:1, 4:5, 16:9, 9:16), rotate and flip, resize, exposure/brightness, contrast, saturation, warmth, a few presets; before/after toggle; save as a new file in `_media/photos/` (never overwrite the original). HEIC from iPhones: say whether the browser can open it, and if not, convert on upload with `sips` or ImageMagick server-side.
2. **`/tools/remove-bg`, the background remover**, with a method switch:
   - **Local:** a server route that runs rembg (see C2's `cli/rembg.md`; if rembg isn't installed, the page says so and shows the install line rather than failing silently).
   - **Nano Banana (OpenRouter):** a server route that sends the image to Google's Nano Banana image model on OpenRouter and asks for the subject on a transparent (or plain) background. Find the current model ID and how OpenRouter returns images from its catalog and docs (The Notebook's `openrouter-models` skill, or `https://openrouter.ai/api/v1/models`), not from memory; there may be both Nano Banana and a newer Pro version: offer both if both exist, cheapest as default, and show the cost per image if the API reports it. Check whether the output actually has an alpha channel; if the model returns a solid background instead, say so on the page and offer a one-click flat-background cut-out (ImageMagick, as in C2) to finish it.
   - Show the result over a checkerboard, then a "new background" picker (color or another photo from `_media/photos/`), and save the PNG to `_media/photos/`.
3. **Keys:** `OPENROUTER_API_KEY` in the repo's root `.env`, the one file the `utils/` scripts also read (week 6's pattern: its `/tools/video` page runs `utils/generate-video.mjs` with the root `.env`). If B has brought `utils/generate-image.mjs` over and it can send an input image to Nano Banana, have the route run it the way week 6 does and show the command it ran; otherwise `lib/openrouter.mjs` reads the root `.env` itself. Task B owns `.env.example`; if `OPENROUTER_API_KEY` isn't in it, say so in your report. The key never reaches the browser: only server routes read it. If it's missing, the Nano Banana option says how to add it. The repo's `AGENTS.md` currently says the app has no API keys; don't edit `AGENTS.md`, give the orchestrator the replacement sentence in your report.
4. **Optional, if the rest is done and solid:** an "Ask Nano Banana" box in the photo editor for an edit in words ("make it dusk", "remove the person on the left"), saving the result as a new file beside the original.
5. **Docs:** `nextjs/content/resources/tools/photo.md` and `remove-bg.md`, as F's `trimmer.md`: what it does, where files go, how to fork it, with example prompts.

Check both on the running dev server, http://localhost:3007/tools/photo and `/tools/remove-bg` (rule 5), with a real photo, including one Nano Banana call if the key is present (say what it cost). Say what you checked by hand.

## When you finish

Commit by path (rule 7) and write `_context/orchestration/reports/G-photo-tools.md` (rule 8), with the model IDs you used and where you confirmed them.
