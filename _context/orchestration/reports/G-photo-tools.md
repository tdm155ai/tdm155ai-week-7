---
task: G
title: "Report: the photo editor and the background remover (rembg and Nano Banana)"
author: claude
thread_id: 14e8ccdd-aafb-4252-9041-2412f462a8cc
agent: Claude Code (Opus 5.5)
started_in: /Users/mk/Development/mk-27/apps/the-notebook
resume: "cd /Users/mk/Development/mk-27/apps/the-notebook && claude --resume 14e8ccdd-aafb-4252-9041-2412f462a8cc"
status: done, except a live Nano Banana call (no usable key) and the optional "Ask Nano Banana" box (not built)
date: 2026-10-21
---

The same thread did task F first (`reports/F-tools-and-trimmer.md`); Marlon queued G in it. G uses F's media layer (`44dec72`) unchanged.

## What I built

- **`/tools/photo`, the photo editor** (`nextjs/app/tools/photo/`): open from `_media/photos/` or drop a file; crop by dragging (move the box by dragging inside it), Free / 1:1 / 4:5 / 16:9 / 9:16 (a ratio starts from the largest centered box), Clear; turn ⟲ ⟳ and flip ↔ ↕ (these restart the crop); exposure (stops), brightness, contrast, saturation, warmth sliders (double-click resets one); presets None, Bright, Punchy, Warm, Cool, Faded, Black & white; width (height follows); Show before / Show after; **Save as a new file** → `<name>-edit.jpg` (`.png` for PNG/WebP/GIF sources), never overwriting. Everything runs in the browser on a canvas: `render()` is the pipeline (turn/flip → crop → resize → `adjust()`), and `adjust()` is plain per-pixel arithmetic a student can read and change.
- **`/tools/remove-bg`, the background remover** (`nextjs/app/tools/remove-bg/`): pick a photo (thumbnails) or drop one; method switch:
  - **On this computer (rembg)**, a model menu (`u2netp` default, `isnet-general-use`, `birefnet-general-lite`, `bria-rmbg`). If rembg isn't installed, the page shows the install line and the button is disabled.
  - **Nano Banana (OpenRouter)**, a model menu (five, cheapest first, with $/M image tokens) and a backdrop color (green, magenta, white, black). If there's no key, the page says how to add it and the button is disabled.
  - The result shows over a checkerboard with its size and "N% transparent" (or "no transparency"), the command that made it, and the cost when there is one. If the result is **opaque**, the page says so and offers **Cut out the flat background** (ImageMagick flood fill from the corners, with a fuzz slider), which keeps the Nano Banana cost and command alongside.
  - New background: None, six swatches, any color, or another photo from `_media/photos/` (cover-fit), drawn on a canvas; **Save with this background** → `<cut-out>-on-<color|photo>.png`.
- **`/api/photo`** (`nextjs/app/api/photo/route.js`): GET lists `_media/photos/`; PUT `?name=` saves a new file there (taken names get `-2`, `-3` …). **HEIC/HEIF is converted to JPEG with `sips`** on upload. I checked: Chrome can't show HEIC, and this Mac's ImageMagick 7.1.1-47 has no HEIC delegate, but `sips` reads and writes it. Both tools upload and save through this route.
- **`/api/remove-bg`** (`route.js` + `cutout.mjs`): GET reports rembg / ImageMagick / key availability, the models, and the photos; POST `{ photo, method: rembg|nano|flat, … }` makes a new PNG and returns `{ name, path, src, width, height, opaque, transparent, command, cost }`. The photo is turned upright first (`magick -auto-orient`). For Nano Banana it's sent as a JPEG of at most 2048 px, with the nearest supported aspect ratio. The POST refuses cross-site callers (Origin / Sec-Fetch-Site), because it can spend money, and requires a JSON content type.
- **`nextjs/lib/openrouter.mjs`**: the Nano Banana model list, `nearestRatio()`, the backdrop prompt `cutoutPrompt()`, an `editPrompt()` for the optional step, `hasOpenRouterKey()` (yes/no only), and `runNanoBanana()`. That last one **runs B's `utils/generate-image.mjs` as a child process** (week 6's `/tools/video` pattern) with `--ref` and `--aspect`, writing to `output/photo-tools/<run>/`, and returns the shell command, the image, and `usage.cost` from `response.json`.
- **Docs**: `nextjs/content/resources/tools/photo.md` and `remove-bg.md` (what it does, where files go, the file map, the commands, how to fork, three prompts each). Two cards were added to the `tools` array in `app/tools/page.jsx`.

## Model IDs, and where I confirmed them

From OpenRouter's catalog on 2026-10-21, `https://openrouter.ai/api/v1/models`, `https://openrouter.ai/api/v1/images/models`, and each model's `/api/v1/images/models/<id>/endpoints`:

| Name | ID | image-output $/M tokens | resolutions | `background` param |
|---|---|---|---|---|
| Nano Banana 2 Lite (**default**) | `google/gemini-3.1-flash-lite-image` | 30 | 1K | no |
| Nano Banana 2.1 | `google/gemini-nano-banana-2.1` | 30 | 1K–4K | no |
| Nano Banana (original) | `google/gemini-2.5-flash-image` | 30 (+$0.30/M input image) | — | no |
| Nano Banana 2 | `google/gemini-3.1-flash-image` | 60 | 512–4K | no |
| Nano Banana Pro | `google/gemini-3-pro-image` | 120 (+$2/M input image) | 1K–4K | no |

The `-preview` duplicates of Nano Banana 2 and Pro also exist and were left out. "Cheapest" means cheapest by these listed prices: three tie on output tokens, and 2 Lite has the lowest prompt price and no input-image charge. The real cost per image depends on its token count, so the page reports `usage.cost` after each call. How the API works came from OpenRouter's Image API guide (`https://openrouter.ai/docs/guides/overview/multimodal/image-generation`): `POST /api/v1/images`, images in `input_references` as data URLs, base64 images back in `data[]`, `usage.cost` in dollars, and `background: transparent` as a per-endpoint option that **no Nano Banana endpoint offers**. That's why the page asks for a flat backdrop and offers the ImageMagick cut-out.

## How to try it

With the dev server on http://localhost:3007: http://localhost:3007/tools, http://localhost:3007/tools/photo, http://localhost:3007/tools/remove-bg. `_media/photos/` has three real photos to start from (`parrot.jpg`, `owl.jpg`, `eagle.jpg`, converted from macOS's own `/Library/User Pictures/Animals/*.heic`), plus a flat-green test image and the results listed below.

For rembg (now installed on this Mac, see below), from any terminal:

```bash
uv tool install --python 3.13 'rembg[cpu,cli]==2.0.85'
```

For Nano Banana, create the root `.env` from `.env.example` and set `OPENROUTER_API_KEY`.

## What I checked by hand

- **Upload**: `Parrot.heic`, `Owl.heic`, and (from the browser's file input) `Eagle.heic` were converted to JPEG with sips and selected; a `.svg` was refused.
- **rembg through the route**, on real photos: parrot (busy green background, `u2netp`): 52% transparent, 30.8 s the first time with the model download; owl (white background, `isnet-general-use`): 11% transparent, since the owl fills the frame, 7.9 s; eagle (`u2netp`): 63%. I looked at the parrot and owl over a checkerboard, and both edges were clean.
- **Flat cut-out**: a green test image with an orange disc came out 78.7% transparent, which matches the geometry. I confirmed that ImageMagick evaluates the `%[fx:w-1]` corner coordinates in `-draw` (a test with a bar that splits the image: only the fx-addressed corner's half was filled). The command in `remove-bg.md` runs as written in zsh.
- **In the browser** (headless Chrome for Testing, my own instance): photo editor: 16:9 crop, turn right (crop cleared), drawn crop, Warm then Punchy, width 300, before/after, save → `parrot-edit.jpg` 300×169 (checked with `magick identify`, and by eye in the screenshot); HEIC upload through the file input. Background remover: Nano Banana without a key shows the instructions and disables the button; rembg on the parrot; a blue swatch saved `parrot-rembg-2-on-2f6fdf.png` (512×512, opaque, as it should be); the owl as a background drew correctly (screenshot). **The opaque Nano Banana case was simulated**: I stubbed that one POST in the browser to return the flat-green test image as an opaque "Nano Banana" result costing $0.039. The page showed the warning, and the real **Cut out the flat background** call made `green-test-cutout-2.png` (79% transparent), keeping the stub's cost line. No console errors on either page.
- **Nano Banana request, without spending**: `generate-image.mjs --dry-run` with the arguments `runNanoBanana()` builds → `POST https://openrouter.ai/api/v1/images`, the right model, `aspect_ratio`, one `input_references` image, and the key absent from the output. `runNanoBanana()` with a **fake key** reached OpenRouter and got its real HTTP 401, returned with the command and without the key; a non-Nano-Banana model ID is refused. That failed run's folder was deleted.
- The command text shown for rembg first named `parrot-rembg.png` while the file was saved as `parrot-rembg-2.png`. Fixed: commands now name the saved file (checked: `eagle-rembg.png`).

## What I couldn't do or didn't check

- **No live Nano Banana call, so no real cost figure and no real check of whether its output has an alpha channel.** Week 7 has no root `.env`, and the board's to-do says week 6's key hit its monthly limit (403 "Key limit exceeded"). I did not create a `.env` or borrow another key. The first real call should confirm (a) that the image comes back on a flat backdrop that the corner fill removes cleanly, and (b) the cost shown.
- **Step 4 ("Ask Nano Banana" in the photo editor) is not built.** It's optional, and it couldn't be checked without a key. `editPrompt()` is ready in `lib/openrouter.mjs`, so it is a small addition (a route like `/api/photo/ask` calling `runNanoBanana()` and saving `<name>-nano-edit.png`).
- **I installed rembg on Marlon's Mac**, with the line the page gives students (`uv tool install --python 3.13 'rembg[cpu,cli]==2.0.85'`, into `~/.local/bin/rembg`), and its `u2netp` and `isnet-general-use` models downloaded to rembg's cache on first use. Undo with `uv tool uninstall rembg`. `findRembg()` also looks in `~/.local/bin`, because a server started without it on PATH wouldn't see it.
- `remove-bg.md` links to `../cli/rembg.md`, which is C2's and wasn't committed when I finished; the link dangles until C2 lands.
- No `next build` (it would share `.next/` with the running dev server). Safari wasn't tried (it can show HEIC natively, but uploads convert anyway). The crop box can't be resized from its edges, only redrawn or moved. The full-resolution save does its pixel loop on the main thread, which is fine for phone photos and slow for very large files.
- Files left in `_media/photos/` (gitignored) from testing: the three animal photos, `green-test.png`, `parrot-edit.jpg`, `parrot-rembg.png`, `parrot-rembg-2.png`, `parrot-rembg-2-on-2f6fdf.png`, `owl-rembg.png`, `eagle-rembg.png`, `green-test-cutout.png`, `green-test-cutout-2.png`. Delete any of them freely.

## For other tasks and the orchestrator

- **`AGENTS.md` (repo root)**: its line "Plain JavaScript with its own CSS (`app/globals.css`); no TypeScript, Tailwind, or API keys." is no longer quite true. Suggested replacement: "Plain JavaScript with its own CSS (`app/globals.css`); no TypeScript or Tailwind. The app has one optional key: the background remover's Nano Banana option runs `utils/generate-image.mjs`, which reads `OPENROUTER_API_KEY` from the gitignored root `.env`; only the server reads it, and it never reaches the browser." (`nextjs/CLAUDE.md` says the same "no … API keys" and could take the same change.)
- **`.env.example`** (B's) already has `OPENROUTER_API_KEY=`, so nothing is needed there.
- **C2**: the web tool uses your flat recipe (corner flood fill with fuzz, alpha-only blur 0.7) and your rembg install line and pinned version; it doesn't trim, so composites keep the original framing.
- **Tools group in `/resources`**: `nextjs/content/resources/tools/` now has three docs and no `README.md`; a two-line README would give the sidebar group an overview (not mine to add).
- No `package.json` changes needed.

## Commits

- `fad8573` G: `/tools/photo`, `/tools/remove-bg`, `/api/photo`, `/api/remove-bg`, `lib/openrouter.mjs`, the two docs, and the two tool cards
- this report (next commit)

## Marlon's words

October 21: "and then a photo editor and photo background remover (including one that uses openrouter nano banana because it's good at that)"

And, queuing this task in the same thread: "once you are done that, work on this one: … your brief, _context/orchestration/tasks/G-photo-tools.md, and do that task. F's media layer (nextjs/lib/media.mjs) is committed; use it without changing it."

## Decisions and open questions

- **Default Nano Banana model: Nano Banana 2 Lite**, as the brief's "cheapest as default". It may be the weakest at deciding what the subject is; if the first real tries are poor, Nano Banana 2.1 costs the same per output token and may be a better default.
- **Backdrop default: green.** The prompt asks for a "solid, perfectly flat" color and explicitly "no checkerboard", because image models asked for transparency often paint a fake checkerboard.
- **The photo is sent at most 2048 px on its long side** (JPEG), to keep the upload small; the result comes back at the model's own size (1K for 2 Lite), so it's smaller than a large original. Worth saying to students, or passing `--resolution 2K` for models that take it.
- Results never overwrite: each run adds a numbered file. A "replace the last result" option, or a cleanup button, is possible if `_media/photos/` gets crowded.
