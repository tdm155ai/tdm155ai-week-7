---
title: Lightroom
description: Adobe's photo organizer and raw developer, for culling a whole shoot, applying a look across it, and exporting a set. Two apps with one name; free to Harvard students.
author: claude
order: 20
checked: 2026-10-20
---

## At a glance

| | |
| --- | --- |
| **Maker** | Adobe |
| **Two apps** | **Lightroom Classic** (desktop, files on your drive) and **Lightroom** (desktop, mobile, and web, synced through Adobe's cloud) |
| **How you get it** | Both are included in Harvard's Adobe Creative Cloud license through HUIT, with your HarvardKey. See the [Photoshop sheet](photoshop.md#getting-it-through-harvard) for who's eligible and how to sign in. |
| **Version as of this writing** | Lightroom Classic 15.6 and Lightroom 9.6 (both September 2026). Check the About box in the app menu for yours. |
| **Project format** | Classic: a catalog file (`.lrcat`) that points to your photos in their folders. Lightroom: a cloud library. Edits are stored as settings, never baked into the original. |

## What it's for

Lightroom is for a whole shoot at once. You import everything, look through it fast, flag the keepers and reject the rest, develop the keepers (exposure, color, crop), copy a look from one photo to all the others, and export the set at the size you need. It's a raw processor, so it gets the most out of raw files, and it works on JPEG, HEIC, and others too. Send the one or two photos that need layers, text, or compositing to [Photoshop](photoshop.md).

## Lightroom or Lightroom Classic?

| | Lightroom Classic | Lightroom |
| --- | --- | --- |
| Where the photos live | In folders on your drive, wherever you put them | Uploaded to Adobe's cloud (full originals), with a local cache |
| The interface | Modules: Library, Develop, Map, Book, Slideshow, Print, Web | One simpler window: grid, detail view, Edit panel |
| Devices | One computer | Desktop, phone, iPad, web, all in sync |
| Strengths | Folders you control, keywording, big catalogs, export presets, plug-ins | Phone photos, editing anywhere, a simpler start |
| AI features | Some arrive here later or not at all (Generative Expand and Generative Upscale are in Lightroom, not Classic, as of this writing) | Gets new AI features first |

**For this course, use Lightroom Classic** if your photos are on your laptop and you want Claude Code to be able to see and work with the same files: they stay in ordinary folders. Use **Lightroom** if you shoot mostly on your phone and want edits to sync, or want the newest AI features. Harvard's license includes 100 GB of cloud storage; check whether that covers a Lightroom library before uploading a large shoot.

The rest of this sheet names things the way **Lightroom Classic** does, with notes where Lightroom differs.

## The tour (Lightroom Classic)

| Part | What it does |
| --- | --- |
| **Library module** (G for Grid) | Import, browse, flag, rate, keyword, and sort. The **Folders** panel on the left mirrors the folders on your drive; **Collections** are groupings that don't move files. |
| **Develop module** (D) | Edit one photo. Right side, top to bottom: Histogram, the tool strip (Crop, Remove, Red Eye, Masking), then the panels. |
| **Develop panels** | **Basic** (white balance, exposure, contrast, highlights, shadows, whites, blacks, texture, clarity, dehaze, vibrance, saturation), **Tone Curve**, **Color Mixer**, **Color Grading**, **Detail** (sharpening, noise reduction, Denoise), **Lens Corrections**, **Transform**, **Lens Blur**, **Effects**, **Calibration** |
| **Presets panel** | Left side of Develop. Saved combinations of settings; hover to preview, click to apply. |
| **Filmstrip** | Bottom strip of the current folder or collection. |
| **Catalog** | The `.lrcat` file that remembers every photo and every edit. Back it up. If you move photos in Finder instead of in Lightroom's Folders panel, Lightroom loses track of them (they show a "?" until you relink). |

In **Lightroom** (the cloud one), the same develop controls are grouped in the Edit panel as Light, Color, Effects, Detail, Optics, and Geometry, with Crop, Remove, and Masking as tools beside it.

## The basic edit

1. **Import** (Shift-Command-I). Choose the source (card or folder), choose **Add** to leave files where they are or **Copy** to copy them to a folder you choose, and import.
2. **Cull** in Library. Press E for a large view, then go through with the arrow keys: P to pick, X to reject, U to unflag, 1–5 for stars. Turn on Caps Lock to auto-advance after each flag. Filter to Picks with the Library Filter bar (the backslash key shows it in Grid view).
3. **Compare** close calls: select two with Command-click and press C, or select several and press N for Survey.
4. **Develop** the best one (D). Crop first (R). Set white balance and exposure in Basic, then highlights and shadows. Press `\` to see before and after.
5. **Local adjustments** with Masking (Shift-W): Subject, Sky, Background, People, Objects, or Landscape, or a brush or gradient. Brighten just the face, darken just the sky.
6. **Clean up** with the Remove tool (Q).
7. **Sync the look**: with the edited photo selected, Command-Shift-C copies its settings; select the others and Command-Shift-V pastes. Or select them all with the edited one active and click Sync.
8. **Export** (Shift-Command-E): pick a folder, file type, size, and quality, and save those choices as an export preset (the **Add** button at the bottom left of the Export dialog) so next time it's one click.

## Shortcuts to learn first (Lightroom Classic)

| Keys | Does |
| --- | --- |
| G / E | Library Grid / Loupe (single large photo) |
| D | Develop |
| C / N | Compare two / Survey several |
| P / X / U | Pick / Reject / Unflag |
| 1–5 / 0 | Star rating / clear rating |
| Caps Lock | Auto-advance after flagging or rating |
| R | Crop |
| Q | Remove tool |
| Shift-W | Masking |
| V | Black and white |
| `\` / Y | Before only / before and after side by side |
| J | Show highlight and shadow clipping |
| Command-Shift-C / Command-Shift-V | Copy / paste develop settings |
| Command-' (apostrophe) | Virtual copy (a second version of a photo, no new file) |
| Tab / Shift-Tab | Hide side panels / hide all panels |
| L | Lights out (dims everything but the photo) |
| Shift-Command-I / Shift-Command-E | Import / Export |

## AI in the app

| Feature | Where | What it does | Runs |
| --- | --- | --- | --- |
| **Assisted Culling** | Library. Turn it on in Catalog Settings > Metadata > Assisted Culling; can also run at import | Scores photos for subject focus, eye focus, and eyes open, and flags exposure problems and misfires. You set the thresholds, review its Selects and Rejects, and then apply flags, stars, or labels in a batch. The **Faces** panel (15.4) shows the eye scores for each face. In Lightroom too (October 2025). | Analyzes your photos; Adobe's page mentions no credits |
| **Auto Stack** and **duplicate detection** | Library | Groups near-identical frames by time and look; finds duplicates (15.4). | Local |
| **Masking: Subject, Sky, Background, People, Objects, Landscape** | Develop > Masking (Shift-W) | Builds a mask from what it recognizes. People masks can target face skin, hair, eyes, clothes. Feather and Edge sliders (15.5) soften the result. | Local |
| **Denoise** | Photo > Enhance | Removes noise from high-ISO raw files; Adobe's Enhance page describes it making an enhanced DNG. Works on raw and linear DNG files, not JPEG. | Local, uses the GPU heavily |
| **Raw Details / Super Resolution** | Photo > Enhance | Finer raw detail; Super Resolution doubles the width and height. Both make a new DNG. | Local |
| **Generative Remove** | Develop > Remove (Q) > Use Generative AI | Paint over a distraction; Adobe Firefly gives three variations to choose from. **Detect Objects** finds the object, its shadow, and reflections from a rough stroke. Needs an internet connection. Adobe says no generative credits are deducted. | Cloud |
| **Distraction removal** | Develop > Remove | Options in the Remove tool for distracting people, sensor dust spots, and reflections in glass (Reflection Removal improved in 15.6). | See Adobe's help for each |
| **Lens Blur** | Develop > Lens Blur panel | Adds background blur using an estimated depth map, with a focus point you choose. | Local |
| **Natural language search** | Lightroom (the cloud app) search, April 2026 | Find photos by describing them, without keywords. | Lightroom only |
| **Generative Expand, Generative Upscale, Generate Video, AI Sharpen, prompt editing** | **Lightroom** only, as of this writing | Extend the frame, enlarge, add motion, deblur, edit by prompt. Generative features use credits (1,000 a month through Harvard). | Cloud, credits |

Assisted Culling is a first pass, not a verdict. It's good at "which of these 12 frames has her eyes open and in focus" and has no idea which moment matters. Use it to clear the obvious misses, then pick by looking.

## Working with Claude

Lightroom keeps your edits as text settings rather than new pixels, which makes them something Claude can read and write.

**Presets are XMP files.** A develop preset is a small XML file (`.xmp`) of Camera Raw settings such as `crs:Exposure2012`, `crs:Contrast2012`, `crs:Shadows2012`, `crs:Vibrance`. Export one from the Presets panel (right-click a preset > Export), and Claude can read it, explain what it does, or write variations ("the same look but warmer, with lifted blacks"). Import the result from the **+** at the top of the Presets panel > Import Presets. Start from a preset Lightroom exported; it has the header fields Lightroom expects, which are hard to get right from scratch.

**Sidecars.** For raw files, Lightroom Classic can write edits to an `.xmp` sidecar next to each raw file (Catalog Settings > Metadata > Automatically write changes into XMP, or Metadata > Save Metadata to File, Command-S). Then the edit for `IMG_0412.CR3` sits in `IMG_0412.xmp` in the same folder, where Claude can see it. For JPEGs the settings are written into the file itself.

**exiftool** reads and writes that metadata. It's covered on the [more tools](../cli/more-tools.md) sheet. Two useful ones (tested with exiftool 13.25):

```sh
# Show the develop settings stored in a preset or sidecar
exiftool -XMP-crs:all look.xmp

# Copy a folder of exports with GPS location removed (originals untouched)
mkdir -p output
exiftool -gps:all= -o output/ *.jpg
```

Removing location matters before you post photos taken at home or of other people.

**Contact sheets and sequencing.** To think about order away from the app, export small JPEGs of your picks and have Claude make a contact sheet with [ImageMagick](../cli/imagemagick.md):

```sh
magick montage -label '%f' picks/*.jpg -thumbnail 400x400 -geometry +8+8 -tile 3x output/contact-sheet.jpg
```

(Tested with ImageMagick 7.1.1-47.) Print it, cut it up, and move the pictures around on a table. Rename the files in the order you settle on, and that's your sequence.

**What Claude can't do** is see your catalog. The `.lrcat` file is a database Lightroom expects to own; don't let anything edit it while Lightroom is open, and back it up before any experiment.

> Here's a Lightroom preset I exported (`warm-film.xmp`). Explain each setting it changes in plain language, then write a copy called `warm-film-cooler.xmp` that keeps everything except a cooler white balance and less saturation. Don't change the header fields.

## Export settings that work

| For | Settings |
| --- | --- |
| Web, Slack, a slideshow | JPEG, sRGB, quality 80, resize to fit Long Edge 2048 px, output sharpening for Screen |
| Handing to Photoshop or a print shop | TIFF, 16-bit, full size (or let Photoshop open it directly with Photo > Edit In) |
| A set you'll process with `magick` | Full-size JPEG at quality 90 into one folder, then let Claude make the variants |

Save each as an export preset with **Add** in the Export dialog. Export presets are stored as `.lrtemplate` files.

## Learn more

- [Lightroom Classic User Guide](https://helpx.adobe.com/lightroom-classic/desktop.html) and [what's new](https://helpx.adobe.com/lightroom-classic/desktop/introduction-to-lightroom-classic/whats-new.html)
- [Lightroom Classic keyboard shortcuts](https://helpx.adobe.com/lightroom-classic/desktop/introduction-to-lightroom-classic/keyboard-shortcuts.html)
- [Select best photos with Assisted Culling](https://helpx.adobe.com/lightroom-classic/desktop/organize-photos-in-lightroom-classic/assisted-culling.html)
- [Masking](https://helpx.adobe.com/lightroom-classic/desktop/process-and-develop-photos/masking.html) · [Generative Remove](https://helpx.adobe.com/lightroom-classic/desktop/process-and-develop-photos/remove-tool.html)
- [What's new in Lightroom](https://helpx.adobe.com/lightroom/desktop/introduction/whats-new.html) (the cloud app)
