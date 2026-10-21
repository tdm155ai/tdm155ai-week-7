---
title: Images
description: Editing still images, from a single photo to a set and a thumbnail, in Photoshop, Lightroom, the free alternatives, and AI tools.
author: claude
order: 30
checked: 2026-10-20
---

Editing an image is a set of decisions: what's in the frame, how bright it is, what color it is, what gets removed or added, and which pictures from a shoot make it into the final set. The apps below each handle part of that. Lightroom is for working through a whole shoot. Photoshop is for working deep on a single image. The [AI tools](ai-tools.md) sheet covers editing with image models by prompt, background removal, and upscaling, and the [ImageMagick](../cli/imagemagick.md) sheet covers the command line, where Claude Code can do the repetitive part.

## The sheets

| Sheet | Use it for |
| --- | --- |
| [Photoshop](photoshop.md) | One image at a time: retouching, compositing, layers and masks, text, thumbnails, Generative Fill |
| [Lightroom](lightroom.md) | A whole shoot: import, cull, pick, develop raw files, apply a look across many photos, export a set |
| [AI image tools](ai-tools.md) | Editing by instruction with image models (Gemini, GPT Image, FLUX), background removal, upscaling |
| [ImageMagick](../cli/imagemagick.md) | Resizing, cropping, converting, and batch work from the terminal |
| [More tools](../cli/more-tools.md) | exiftool for reading and stripping metadata, and other command-line helpers |

## What editing an image covers

| Kind of edit | What it means | Where to do it |
| --- | --- | --- |
| **Crop and straighten** | Choose the frame and the aspect ratio. Level the horizon. | Any app; `magick` for exact sizes |
| **Exposure and color** | Brightness, contrast, highlights and shadows, white balance, saturation, a look | Lightroom (best for raw), Photoshop adjustment layers, Photos |
| **Retouching** | Remove dust, blemishes, wires, a stranger in the background | Photoshop Remove tool, Lightroom Remove, Photos Clean Up |
| **Compositing** | Combine parts of several images: a subject on a new background, a sky swap, text over a picture | Photoshop (layers and masks) |
| **Selecting and sequencing** | Pick the frames that work from a shoot and put them in order | Lightroom (flags, stars, collections), a contact sheet from `magick montage` |
| **Packaging a thumbnail** | One image at a fixed size (1280×720 for a 16:9 video thumbnail), with or without text, that reads at small size | Photoshop, then `magick` to check size and weight |

Selecting is editing too. Out of 200 frames from a shoot, the 8 you keep and the order you put them in say more than any slider.

## Raster and raw

A **raster** image is a grid of pixels: JPEG, PNG, HEIC, WebP, TIFF, PSD. Every app can open one. When you save a JPEG, the edits are baked into the pixels and some information is thrown away each time.

A **raw** file (`.CR3`, `.NEF`, `.ARW`, `.DNG`, Apple ProRAW) is what the camera sensor recorded before the camera turned it into a picture. It holds more range in the highlights and shadows and lets you set white balance after the fact, but it has to be processed to be seen. Lightroom and Adobe Camera Raw (inside Photoshop) are raw processors. If your camera or phone can shoot raw and you plan to edit, shoot raw (or raw + JPEG).

## Destructive and non-destructive

A **destructive** edit changes the pixels: paint on the layer, apply a filter to it, save over the JPEG. You can undo it in the session, but once saved it's done.

A **non-destructive** edit stores the instruction and leaves the original alone, so you can change it later.

- **Lightroom** is non-destructive by design: your original file is never changed, and the edits live in the catalog or in an XMP file beside the original. You only make new pixels when you export.
- **Photoshop** can be either. Work non-destructively by using **adjustment layers** instead of Image > Adjustments, retouching on a **new empty layer**, converting a layer to a **Smart Object** before filtering or scaling it, and saving a `.psd`.
- **The command line** is destructive unless you write to a new file. Always write to `output/` and keep the originals.

## Layers and masks

**Layers** stack images, text, and adjustments on top of each other, like sheets of acetate. The order matters: an adjustment layer changes everything below it.

A **mask** decides where a layer shows. White on the mask shows the layer, black hides it, gray is in between. Masks are how you put a subject on a new background, brighten just a face, or fade a photo into another. Selection tools (Select Subject, Select Sky, Object Selection) make the selection, and the mask button turns it into a mask you can keep painting on. Lightroom's **Masking** panel does the same job for adjustments (brighten just the subject, darken just the sky) without layers.

## Free and built-in alternatives

You don't need Adobe for most of this. These are worth knowing; they don't get full sheets here.

| App | What it is | Cost (as of 2026-10-20) |
| --- | --- | --- |
| **Photos** (macOS) | Crop, light and color adjustments, filters, and **Clean Up** for removing distractions (needs Apple Intelligence: Apple silicon Mac, macOS 15.1 or later). Edits are non-destructive; Revert to Original undoes them. | Built in |
| **Preview** (macOS) | Crop, resize (Tools > Adjust Size), color (Tools > Adjust Color), export to other formats, and a **Remove Background** button. | Built in |
| **Copy Subject** (macOS) | Control-click a photo in Photos, Quick Look, Safari, and other apps and choose Copy Subject to lift the subject off its background. | Built in |
| **Pixelmator Pro** | A full layer-based editor for Mac, owned by Apple. | Part of Apple Creator Studio ($12.99/month or $129/year; $2.99/month or $29.99/year education), or a one-time App Store purchase |
| **Affinity** | Canva's free app for Mac and Windows that combines photo editing (Pixel), vector design (Vector), and page layout (Layout). Opens PSD files. Its AI tools need a paid Canva plan. | Free for individuals |
| **GIMP** | The long-running open-source editor. Version 3.2 (March 2026) added non-destructive link and vector layers. | Free |

## Learn more

- [Adobe Creative Cloud at Harvard (HUIT)](https://www.huit.harvard.edu/adobe-creative-cloud): how students get Photoshop and Lightroom
- [Photos for Mac user guide](https://support.apple.com/guide/photos/welcome/mac)
- [Remove a background in Preview](https://support.apple.com/guide/preview/remove-a-background-or-extract-an-image-prvw15636/mac)
- [Affinity](https://www.affinity.studio/) · [GIMP](https://www.gimp.org/) · [Apple Creator Studio](https://www.apple.com/apple-creator-studio/)
