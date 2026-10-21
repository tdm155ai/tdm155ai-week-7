---
title: The background remover
description: Cut the subject out of a photo with rembg on your own machine or with Nano Banana on OpenRouter, then put it on a new background.
author: claude
---

[The background remover](/tools/remove-bg) cuts the subject out of a photo, shows the result over a checkerboard so you can see what's transparent, and lets you put it on a new background. Every result is a new PNG in `_media/photos/`; the original is never changed.

## Two ways to cut it out

**On this computer (rembg).** [rembg](../cli/rembg.md) runs a small segmentation model on your own machine: free, private, and a few seconds a photo. Install it once from a terminal:

```bash
uv tool install --python 3.13 'rembg[cpu,cli]==2.0.85'
```

Then reload the page. The first time you use a model, rembg downloads it, so that first photo is slower (about 30 seconds on Marlon's Mac for `u2netp`). `u2netp` is the smallest and quickest; `isnet-general-use`, `birefnet-general-lite`, and `bria-rmbg` are bigger downloads and often cleaner at the edges.

**Nano Banana (OpenRouter).** Sends the photo to one of Google's Nano Banana image models through OpenRouter, with a prompt asking it to keep the subject exactly as it is on a flat, one-color backdrop. It is very good at deciding what the subject is, and it costs a few cents a photo; the page shows what each call cost. None of these models can return transparency (OpenRouter's `background: transparent` option isn't offered for them), so the page checks the result, and if it came back solid it offers **Cut out the flat background**, which removes the backdrop color with ImageMagick. Choose a backdrop color that isn't in your subject: green for most subjects, magenta for anything green.

It needs an OpenRouter key: copy `.env.example` at the repo root to `.env` and put the key after `OPENROUTER_API_KEY=`. Only the server reads it; it never reaches the browser.

The models offered, cheapest first, with OpenRouter's listed price for image output on October 21, 2026:

| Model | ID | $ per million image tokens |
|---|---|---|
| Nano Banana 2 Lite | `google/gemini-3.1-flash-lite-image` | 30 |
| Nano Banana 2.1 | `google/gemini-nano-banana-2.1` | 30 |
| Nano Banana (the original) | `google/gemini-2.5-flash-image` | 30 |
| Nano Banana 2 | `google/gemini-3.1-flash-image` | 60 |
| Nano Banana Pro | `google/gemini-3-pro-image` | 120 |

What one image costs depends on how many tokens it is, which depends on its size, so trust the cost the page reports after each call rather than this table.

## Checking and finishing

- **The checkerboard** is where the photo is now transparent. Look at hair, fur, and anything thin or see-through; the page also says how much of the image is transparent, and "no transparency" means the background is still there.
- **A new background:** a swatch, any color, or another photo from `_media/photos/` (scaled to cover the frame). **Save with this background** writes `<cut-out name>-on-<color or photo>.png`.

## Where the files go

```text
_media/photos/
  parrot.jpg                      the original (HEIC uploads arrive as JPEG)
  parrot-rembg.png                cut out with rembg
  parrot-nano-banana.png          Nano Banana's answer, on a flat backdrop
  parrot-nano-banana-cutout.png   the backdrop cut out with ImageMagick
  parrot-rembg-on-2f6fdf.png      on a new background
output/photo-tools/<run>/         each Nano Banana call: request.json, response.json, the image
```

## How it's built

| File | What it does |
|---|---|
| `app/tools/remove-bg/page.jsx`, `RemoveBg.jsx`, `remove-bg.css` | The page: choosing, the method switch, the result over a checkerboard, the new background (drawn on a canvas in the browser). |
| `app/api/remove-bg/route.js` | GET says what's installed; POST runs one method and saves the result. |
| `app/api/remove-bg/cutout.mjs` | Runs rembg and ImageMagick, and checks whether an image really has transparency. |
| `lib/openrouter.mjs` | The Nano Banana models and prompts, and `runNanoBanana()`, which runs `utils/generate-image.mjs` and returns the command it ran. |
| `app/api/photo/route.js` | Lists, uploads, and saves photos (shared with the photo editor). |

The Nano Banana call is the same command you can run yourself from the repo root, for example:

```bash
node utils/generate-image.mjs openrouter --model google/gemini-3.1-flash-lite-image --ref _media/photos/parrot.jpg --aspect 1:1 -- "Remove the background from this photo. Keep the main subject exactly as it is …"
```

The page shows the exact command after each call. The flat cut-out is ImageMagick flood-filling transparency in from each corner, with a "fuzz" tolerance for colors close to the backdrop:

```bash
magick parrot-nano-banana.png -alpha set -fuzz 12% -fill none -draw "color 0,0 floodfill" -draw "color %[fx:w-1],0 floodfill" -draw "color 0,%[fx:h-1] floodfill" -draw "color %[fx:w-1],%[fx:h-1] floodfill" -channel A -blur 0x0.7 +channel parrot-nano-banana-cutout.png
```

## Forking it

Copy `app/tools/remove-bg/`, `app/api/remove-bg/`, `app/api/photo/`, and `lib/openrouter.mjs` (with `lib/media.mjs`, `app/media/`, and the repo's `utils/` if your app doesn't have them), then ask Claude:

```text
In the background remover, add a "soft shadow" option that puts a blurred,
darkened copy of the cut-out's shape under it, a little down and to the right,
before the new background is saved.
```

```text
Let me cut out every photo in _media/photos/ with rembg at once, and show the
results side by side over the checkerboard so I can pick which to keep.
```

```text
Add a third method to the background remover that asks Nano Banana to put the
subject into a new scene I describe in words ("on a beach at dusk"), keeping
the subject unchanged. Show the cost and the command, as the cut-out does.
```
