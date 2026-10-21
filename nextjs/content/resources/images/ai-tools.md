---
title: AI image tools
description: Editing images with AI outside Adobe: image models that take a picture and an instruction, background removal, and upscaling.
author: claude
order: 30
checked: 2026-10-20
---

Photoshop and Lightroom have their own AI features (see their sheets). This sheet covers the rest: sending an image to an image model with an instruction, cutting out a subject, and making a small image bigger. Model names and prices here were checked on 2026-10-20 and change often; the providers' own model lists are the source of truth.

## At a glance

| Job | Tools | Cost |
| --- | --- | --- |
| Edit by instruction | Gemini image models ("Nano Banana"), OpenAI GPT Image, FLUX.2 / FLUX.3 from Black Forest Labs | Per image, through OpenRouter or fal (the course keys), or in the Gemini and ChatGPT apps |
| Remove a background | Preview, Copy Subject, Photoshop, `rembg`, Canva | Free (built in, open source) to subscription |
| Upscale | Lightroom Super Resolution, Photoshop Generative Upscale, Topaz Gigapixel, Real-ESRGAN / Upscayl | Free to subscription |

## Editing with image models

Current image models don't only make pictures from text. Give one **an input image and an edit instruction** ("remove the man on the left", "make it dusk", "turn the sign so it reads OPEN") and it returns a new image. Some take several reference images at once ("put the mug from image 2 on the table in image 1").

| Model | Maker | Model IDs (as of 2026-10-20) | Notes |
| --- | --- | --- | --- |
| **Nano Banana 2.1** | Google (Gemini) | `gemini-nano-banana-2.1` in the Gemini API; `google/gemini-nano-banana-2.1` on OpenRouter | Newest (October 2026). Also Nano Banana 2 (`gemini-3.1-flash-image`), Nano Banana Pro (`gemini-3-pro-image`), and the original Nano Banana (`gemini-2.5-flash-image`). The Gemini app also edits images from a prompt. |
| **GPT Image 2.5** | OpenAI | `gpt-image-2.5-sunburst` (OpenAI recommends it where editing precision matters), `gpt-image-2.5-flare` (faster); `gpt-image-2` still available | OpenAI's Images API has an edits endpoint that takes an image and a prompt. On fal: `openai/gpt-image-2/edit`. In ChatGPT as ChatGPT Images. |
| **FLUX.2** | Black Forest Labs | On fal: `fal-ai/flux-2-pro/edit`; on OpenRouter: `black-forest-labs/flux.2-pro`, `flux.2-flex`, `flux.2-max` | BFL's recommended editing line. The older **FLUX.1 Kontext** (`fal-ai/flux-pro/kontext`) still works but is the previous generation. |
| **FLUX.3 Image** | Black Forest Labs | `black-forest-labs/flux-3-image` on OpenRouter | Released October 1, 2026; edits selected regions and takes up to 10 reference images. |
| **Nano Banana 2 edit** | Google, via fal | `fal-ai/nano-banana-2/edit` | The fal route to Gemini editing. |

Photoshop's Generative Fill model picker offers some of the same partner models (FLUX.2 pro, Gemini, GPT Image 2) inside Photoshop, paid with Adobe generative credits instead of API credits.

### With the course scripts

The generation scripts from earlier weeks (`utils/generate-image.mjs`, in your week 5 repo) already take an input image: add `--ref FILE` (PNG, JPEG, or WebP; repeat it for several). Run from that repo's root, with your keys in its `.env`. Try `--dry-run` first: it shows the request without sending it or spending credits.

```sh
node utils/generate-image.mjs openrouter "Remove the person on the left. Keep everything else the same." \
  --model google/gemini-nano-banana-2.1 --ref photos/street.jpg --dry-run
```

Remove `--dry-run` to send it. On fal, pick an edit endpoint:

```sh
node utils/generate-image.mjs fal "Change the season to winter, with snow on the ground." \
  --model fal-ai/flux-2-pro/edit --ref photos/street.jpg
```

Each run saves the image and the request in a new folder under `output/image/`. `node utils/list-fal-models.mjs --category image-to-image` lists fal's current editing endpoints. (The OpenRouter dry run above was checked on 2026-10-20; the live calls depend on today's model list.)

### Writing edit instructions

- **Say what to change and what to keep.** "Replace the sky with an overcast sky. Keep the people, the building, and the framing exactly the same."
- **One change per request.** Chain edits: feed the output back in as the next `--ref`.
- **Check the whole picture, not just the part you asked about.** These models redraw the image. Faces drift, text on signs changes, small objects vanish. Compare side by side:

```sh
magick original.jpg edited.jpg -resize x800 +append output/before-after.jpg
```

- **Know what you're claiming.** Removing a stray cup is cleanup. Adding a crowd that wasn't there changes what the photo says happened. For interview and documentary work, label generated or heavily edited images.
- **Mind whose photo it is.** Sending a photo of someone to a cloud model sends their face to that company. Ask first.

## Background removal

| Tool | How | Notes |
| --- | --- | --- |
| **Preview** (macOS) | Open the image, click the Remove Background button in the toolbar | Built in. Converts to PNG to keep the transparency; choose File > Duplicate first to keep the original. |
| **Copy Subject** (macOS) | Control-click a photo in Photos, Quick Look, Safari, and other apps > Copy Subject | Built in. Pastes as a cutout into Keynote, Pages, Messages, Photoshop. |
| **Photoshop** | Contextual Task Bar > Remove Background, or Select > Subject plus a mask | Best when the edge needs hand work (hair, glass). See the [Photoshop sheet](photoshop.md). |
| **rembg** | Open-source command-line tool (Python), runs on your Mac | Good for a folder of product shots or headshots. Several models, including BiRefNet variants. |
| **remove.bg** | Website and API | Being folded into Canva: remove.bg says its standalone site closes **December 1, 2026**. Canva's own background remover needs a paid Canva plan. |

`rembg` from the command line, using `uvx` (from `brew install uv`) so nothing is installed globally:

```sh
mkdir -p output
uvx --python 3.12 --from "rembg[cpu,cli]" rembg i -m u2net subject.jpg output/subject-cutout.png
```

`-m u2net` picks a model that downloads once (about 176 MB). Without `-m`, rembg 2.0.85 uses `bria-rmbg`, which is about 1 GB to download; try it, or `birefnet-general`, when the edges matter. For a whole folder, `rembg p input-folder output-folder`. Output is PNG with transparency. (Tested with rembg 2.0.85 on 2026-10-20.)

## Upscaling

| Tool | What it does | Cost (as of 2026-10-20) |
| --- | --- | --- |
| **Lightroom Super Resolution** | Photo > Enhance; doubles width and height, runs on your Mac | Included with Harvard's Adobe license |
| **Photoshop Generative Upscale** | Enlarges with Topaz Labs models inside Photoshop | Adobe generative credits |
| **Lightroom Generative Upscale** | In Lightroom (the cloud app), February 2026 | Adobe generative credits |
| **Topaz Gigapixel** | Desktop app dedicated to upscaling, with several models for faces, text, and low-resolution sources | Subscription only: $149/year or $29/month (Personal); also in the Topaz Studio bundle. No perpetual licenses. |
| **Real-ESRGAN** | Open-source upscaling models. The `realesrgan-ncnn-vulkan` release includes a macOS build. | Free. Last release 2022; still works, not actively developed. |
| **Upscayl** | Free, open-source Mac app with a window around Real-ESRGAN-type models | Free. Last release December 2024. |

Upscaling invents detail. It works well for a soft photo going into a thumbnail or a print; it won't recover a face that wasn't in focus, and it can make one up. Look at faces and text at 100% before you use the result.

For plain resizing that doesn't invent anything (fit to 2048 px, make a 1280×720 thumbnail), use [ImageMagick](../cli/imagemagick.md).

## Working with Claude

Claude Code can run all of the command-line parts: the generation script with `--ref`, `rembg` on a folder, `magick` for before-and-after sheets and resizing, and `exiftool` (see [more tools](../cli/more-tools.md)) to check or strip metadata before you share. A prompt that keeps your originals safe:

> In `photos/picks/`, make a background-removed PNG of each JPEG with rembg into `output/cutouts/`, then make one contact sheet of the cutouts on a gray background with magick. Don't modify anything in `photos/`.

Ask Claude to try a `--dry-run` first whenever a step would spend credits, and to show you the before-and-after sheet before it goes further.

## Learn more

- [Gemini API: image generation and editing](https://ai.google.dev/gemini-api/docs/image-generation)
- [OpenAI: image generation and editing](https://developers.openai.com/api/docs/guides/image-generation)
- [OpenRouter image models](https://openrouter.ai/models?output_modalities=image) · [fal image-to-image models](https://fal.ai/models)
- [rembg on GitHub](https://github.com/danielgatis/rembg) · [Real-ESRGAN on GitHub](https://github.com/xinntao/Real-ESRGAN)
- [Remove a background in Preview](https://support.apple.com/guide/preview/remove-a-background-or-extract-an-image-prvw15636/mac)
