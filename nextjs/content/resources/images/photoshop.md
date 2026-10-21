---
title: Photoshop
description: Adobe's layer-based image editor, for retouching, compositing, text, and thumbnails, one image at a time. Free to Harvard students through HUIT.
author: claude
order: 10
checked: 2026-10-20
---

## At a glance

| | |
| --- | --- |
| **Maker** | Adobe |
| **Platforms** | macOS, Windows, iPad, web |
| **How you get it** | Free for Harvard students (FAS, the College, GSAS, SEAS, and most schools; DCE students excluded) through HUIT's Adobe Creative Cloud license. Sign in with HarvardKey. See below. |
| **Version as of this writing** | Photoshop 2026, version 27.11 (September 2026). Check Help > About Photoshop for yours; Adobe updates monthly. |
| **Project format** | `.psd` (layers, masks, Smart Objects, adjustment layers all preserved). Export to JPEG, PNG, WebP, TIFF. |

### Getting it through Harvard

HUIT's [Adobe Creative Cloud page](https://www.huit.harvard.edu/adobe-creative-cloud) says the license covers students in Central Administration, FAS, the College, GSAS, SEAS, GSD, GSE, HBS, HDS, HKS, HLS, HMS, HSDM, Radcliffe, and SPH (DCE students are excluded). It includes:

- Photoshop, Lightroom, Lightroom Classic, Premiere Pro, Illustrator, and the rest of the desktop apps ([full list](https://harvard.service-now.com/ithelp?id=kb_article&sys_id=76fe9f12479cd190566cf147536d4354))
- installs on up to **two devices at once**, personal or Harvard-owned
- **1,000 generative credits per month** for Firefly features, and 100 GB of cloud storage
- Firefly video generation and Firefly Custom Models are **not** included

Your Adobe account is created automatically once you have claimed your HarvardKey with a Harvard email address. HUIT's [getting started article](https://harvard.service-now.com/ithelp?id=kb_article&sys_id=9f3244d3dba304d430ed1dca489619e0) has the three steps: install the Creative Cloud desktop app, sign in, and install Photoshop from it. If sign-in fails, HUIT's help line is (617) 495-7777.

## What it's for

Photoshop is for working closely on one image: retouching, removing things, combining several images into one, putting text on a picture, and building a thumbnail or poster. It works in **layers**, so you can keep every change separate and adjustable. For sorting and color-correcting a whole shoot, use [Lightroom](lightroom.md) first and send the few images that need detailed work to Photoshop (in Lightroom Classic, Photo > Edit In > Photoshop). For a quick crop or brightness fix, Photos or Preview is faster.

## The tour

| Part | Where | What it does |
| --- | --- | --- |
| **Toolbar** | Left edge | The tools: Move, Marquee, Lasso, Object Selection, Crop, Remove and Spot Healing, Brush, Clone Stamp, Eraser, Type, and more. Tools with a small triangle hide related tools; press and hold to see them. |
| **Options bar** | Top, under the menus | Settings for the current tool (brush size, crop ratio, Generative Expand fill). |
| **Contextual Task Bar** | Floats over the canvas | The next likely steps for what you have selected: Select Subject, Remove Background, Generative Fill, Generate Image. Window > Contextual Task Bar if it's hidden. |
| **Layers panel** | Right | The stack of layers. Eye icon hides a layer. The buttons at the bottom add a mask, an adjustment layer, a group, a new layer. |
| **Properties panel** | Right | Settings for the selected layer: adjustment sliders, mask feather and density, text, generative variations. |
| **Adjustments panel** | Right | One-click adjustment layers: Levels, Curves, Hue/Saturation, Black & White, and newer ones (Light, Color and Vibrance, Clarity and Dehaze, Grain). |
| **History panel** | Window > History | Every step since you opened the file; click back to any of them. |

Four ideas carry most of the work:

- **Adjustment layers** change the color or tone of the layers below without touching their pixels. Delete or re-edit them any time.
- **Masks** decide where a layer shows: white shows, black hides. Click the mask button at the bottom of the Layers panel to add one. With a selection active, the mask is made from the selection.
- **Smart Objects** wrap a layer so you can scale it down and back up without losing quality, and so filters become **Smart Filters** you can re-edit. Right-click a layer > Convert to Smart Object.
- **Clipping masks** limit a layer to the shape of the one below it (a texture only inside the text). Option-Command-G.

## The basic edit

1. **Open** the image (File > Open). For a raw file, Photoshop opens it in Camera Raw first; set exposure and white balance there and click Open.
2. **Save as a PSD** right away (File > Save As > Photoshop) so your layers survive.
3. **Crop** (C). Pick a ratio in the Options bar (16:9 for a video thumbnail), drag, press Return. Turn off Delete Cropped Pixels to keep them.
4. **Fix tone and color** with adjustment layers from the Adjustments panel: Curves or Levels for brightness and contrast, Hue/Saturation or Color Balance for color. For a quick overall pass, convert the layer to a Smart Object and use Filter > Camera Raw Filter (Shift-Command-A).
5. **Retouch** on a new empty layer (Shift-Command-N). Choose the Remove tool (J), turn on Sample All Layers in the Options bar, and paint over what you want gone.
6. **Select and mask** what needs separate treatment: Select > Subject (or the Object Selection tool, W), then add a mask or an adjustment layer. The adjustment then applies only inside the selection.
7. **Add text** with the Type tool (T) if the image needs it. Type stays editable.
8. **Export** a copy: File > Export > Export As (Option-Shift-Command-W). Choose JPEG or PNG, set the size, check the file size it shows, and export. Keep the PSD.

## Shortcuts to learn first

| Keys | Does |
| --- | --- |
| V | Move tool |
| M / L | Marquee / Lasso selection |
| W | Object Selection and Quick Selection tools |
| C | Crop |
| J | Remove tool and Spot Healing Brush |
| B / E / S | Brush / Eraser / Clone Stamp |
| T | Type |
| Space (hold) | Hand tool, to pan while using another tool |
| `[` / `]` | Smaller / larger brush |
| D, then X | Default black and white colors, then swap them (handy for painting masks) |
| Command-Z / Shift-Command-Z | Undo / redo (repeats through history) |
| Command-J | Duplicate the layer, or copy the selection to a new layer |
| Shift-Command-N | New layer |
| Command-T | Free Transform (scale, rotate) |
| Command-D / Shift-Command-I | Deselect / invert the selection |
| Command-0 / Command-1 | Fit on screen / 100% |
| Tab | Hide or show the panels |
| Option-Shift-Command-W | Export As |
| Option-Shift-Command-K | Edit > Keyboard Shortcuts, to see and change all of them |

## AI in the app

Most of these run on Adobe's servers and use **generative credits** (you get 1,000 a month through Harvard). Standard features such as Generative Fill with Adobe's Firefly model cost 1 credit per generation; partner models and premium features cost more. The Generative Credits Usage panel (added in 27.6) shows what each feature costs and what you've spent. All of this changes month to month; the [release notes](https://helpx.adobe.com/photoshop/desktop/whats-new/photoshop-on-desktop-release-notes.html) are the source of truth.

| Feature | Where | What it does | Runs |
| --- | --- | --- | --- |
| **Generative Fill** | Make a selection > Contextual Task Bar > Generative Fill | Fills the selection from a text prompt, or with a blank prompt fills it to match the surroundings. Results land on a generative layer with three variations in Properties. A **Reference Image** can guide it. | Cloud, credits |
| **Generative Expand** | Crop tool (C), drag past the edge, choose Generative Expand in the Options bar | Extends the canvas and invents what's beyond the frame. Useful for turning a vertical photo into a 16:9 thumbnail. | Cloud, credits |
| **Model picker** | In the Contextual Task Bar for Generative Fill, Expand, and Generate Image | Choose Adobe Firefly models (Firefly Image 5, the Firefly Fill & Expand model) or partner models (FLUX.2 pro, Gemini, GPT Image 2). The picker shows each model's credit cost. Partner models are premium and cost more; check what Harvard's license allows. | Cloud, credits |
| **Generate Image** | Contextual Task Bar, or the Generate Image button | Makes a new image from a prompt and places it on the canvas. | Cloud, credits |
| **Prompt to edit / AI Assisted Editor (Beta)** | Contextual Task Bar (27.10, August 2026) | Describe the edit in plain language ("make the jacket red"); Photoshop applies it to the selection. **Markup** lets you draw arrows and circles to show what you mean. | Cloud, credits |
| **Remove tool** | Toolbar (J) | Paint over a distraction and it's gone. **Find Distractions** detects wires, people, and other clutter for you. Since 27.7 (May 2026) there's an optional **on-device model** you can download, so removal can run without the cloud. | Cloud or on-device |
| **Select Subject / Remove Background** | Select > Subject; Contextual Task Bar | Selects the main subject in one click; Remove Background turns that into a mask. **Enhance edge** (27.11) improves hair and fur edges. | No credits for Select Subject |
| **Harmonize** | Contextual Task Bar, with a placed object or person selected | Matches a pasted-in object's light, color, and shadows to the scene. | Generative (cloud); check the credit cost before you run it |
| **Generative Upscale** | Added in 27.0 | Enlarges an image with Topaz Labs models (a partner model, so premium). | Cloud, credits |
| **Neural Filters** | Filter > Neural Filters | A gallery of ML filters (smoothing skin, colorizing old photos, depth blur, and others). Each filter downloads its model the first time. | Mostly on-device; Smart Portrait and Depth Blur use the cloud for some steps |
| **Rotate object** | Contextual Task Bar (27.6) | Turns a flat object so you can change its angle. 20 credits per object, charged on the first rotation. | Cloud, credits |

A note on judgment: generative features invent pixels. Removing a stray cup is retouching; adding a person who wasn't there changes what the photo claims happened. For documentary or interview work, keep generative edits to cleanup, and say so if you used them.

## Working with Claude

Claude can't see your Photoshop window, but it can write the files Photoshop runs, and it can do the batch work outside Photoshop entirely.

**Scripts.** Photoshop runs JavaScript. Modern scripts use **UXP** and have the extension `.psjs` (Photoshop 23.5 and later); older **ExtendScript** scripts end in `.jsx` and still run. Run either with File > Scripts > Browse. Claude can write a script that, for example, exports every layer group as its own PNG or adds a caption layer to each open document. Adobe's [UXP scripting docs](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/media/uxpscripting/) are the reference; point Claude at them.

> Write a Photoshop UXP script (.psjs) that exports each top-level layer group of the active document as a PNG named after the group, into a folder next to the PSD. Use the Photoshop UXP API and batchPlay only where the DOM doesn't cover it.

**Actions and batch.** Record repetitive steps in the **Actions** panel (Window > Actions), then run them on a folder with File > Automate > Batch. File > Scripts > Image Processor converts and resizes a folder to JPEG, PSD, or TIFF. These are good for steps that need Photoshop itself (an adjustment you dialed in by eye, a Generative Fill you can't do elsewhere).

**Outside Photoshop.** Resizing, cropping to a ratio, converting formats, making contact sheets, and stripping location data don't need Photoshop at all. Ask Claude Code to do them with [ImageMagick](../cli/imagemagick.md) and [exiftool](../cli/more-tools.md) on copies of your files. For example, a 1280×720 thumbnail with a title, cropped from the center of any photo:

```sh
mkdir -p output
magick photo.jpg -resize 1280x720^ -gravity center -extent 1280x720 \
  -font Helvetica-Bold -pointsize 96 -fill white -stroke black -strokewidth 3 \
  -gravity south -annotate +0+60 'THE INTERVIEW' -quality 85 output/thumb.jpg
```

(Tested with ImageMagick 7.1.1-47.) The text will look better done in Photoshop, where you can see it; the command is for making twenty of them, or a quick draft.

**Round trip.** A common split: Photoshop for the one image that needs hands-on work, saved as PSD; then Claude and `magick` for the versions (web size, square crop for social, a small preview), all generated from one export.

## Export settings that work

| For | Settings |
| --- | --- |
| Web or Slack | Export As > JPEG, quality around 80, long edge 2048 px, sRGB (Convert to sRGB checked) |
| Video thumbnail | 1280×720 JPEG or PNG, sRGB |
| Anything with transparency | PNG (or WebP) |
| Print or more editing later | Keep the PSD; export a TIFF if someone else needs a flat high-quality file |

## Learn more

- [Photoshop User Guide](https://helpx.adobe.com/photoshop/desktop.html) (Adobe Help Center)
- [Photoshop release notes](https://helpx.adobe.com/photoshop/desktop/whats-new/photoshop-on-desktop-release-notes.html): what changed this month
- [View keyboard shortcuts](https://helpx.adobe.com/photoshop/desktop/get-started/settings-and-preferences/view-keyboard-shortcuts.html)
- [Generative credits FAQ](https://helpx.adobe.com/creative-cloud/apps/generative-ai/generative-credits-faq.html)
- [Batch-process files](https://helpx.adobe.com/photoshop/desktop/automate-tasks/process-a-batch-of-files/batch-process-files.html)
