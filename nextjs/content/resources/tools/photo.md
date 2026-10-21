---
title: The photo editor
description: Crop, turn, resize, and adjust a photo in the browser and save it as a new file; a starter to copy and change with Claude.
author: claude
---

[The photo editor](/tools/photo) does the everyday fixes to a still: crop, turn, resize, and adjust the light and color. All of it happens in your browser on a canvas; the server only lists, uploads, and saves files.

## Using it

1. **Open a photo.** The menu lists the images in `_media/photos/`. Drop a photo on the box (or choose one) to add it. iPhone photos in HEIC are converted to JPEG as they arrive, with macOS's `sips`, because most browsers (Chrome and Firefox among them) can't show HEIC.
2. **Crop.** Drag across the photo to draw a box; drag inside it to move it. **1:1**, **4:5**, **16:9**, and **9:16** keep the box at that shape (and start from the largest centered box), **Free** lets it be any shape, **Clear** removes it.
3. **Turn.** ⟲ and ⟳ turn a quarter at a time; **Flip ↔** and **Flip ↕** mirror it. Turning or flipping starts the crop over.
4. **Adjust.** Exposure (in stops: +1 doubles the light), brightness, contrast, saturation, and warmth. Double-click a slider to put it back to zero. The presets (Bright, Punchy, Warm, Cool, Faded, Black & white) set the sliders, which you can then change.
5. **Size.** Type a width; the height follows. Leave it empty to keep the crop's own size.
6. **Show before** shows the original, untouched; **Show after** goes back.
7. **Save as a new file** writes `<name>-edit.jpg` (or `.png` for a PNG, WebP, or GIF) to `_media/photos/`, adding `-2`, `-3` … if that name is taken. The original is never changed.

## How it's built

| File | What it does |
|---|---|
| `app/tools/photo/page.jsx` | The page around the editor. |
| `app/tools/photo/PhotoEditor.jsx` | The editor. `render()` is the whole pipeline: turn and flip, crop, resize, then `adjust()` changes each pixel. |
| `app/tools/photo/photo.css` | How it looks. |
| `app/api/photo/route.js` | Lists `_media/photos/` (GET) and saves a new file there (PUT), converting HEIC with `sips`. The background remover uses it too. |
| `lib/media.mjs` and `app/media/` | The shared media layer: safe reading and writing in `_media/`, served at `/media/…`. |

`adjust()` is plain arithmetic on each pixel's red, green, and blue (0–255), in this order: exposure multiplies, brightness adds, contrast stretches away from middle gray, saturation pushes each color away from the pixel's gray, and warmth adds red and takes away blue. Change a formula there and every slider and preset follows.

## Forking it

Copy `app/tools/photo/` and `app/api/photo/` into your own Next app (with `lib/media.mjs` and `app/media/` if it doesn't have them), then ask Claude. Each file starts with a comment saying what it does and what to change first.

```text
In the photo editor, add a "Vignette" slider that darkens the corners, and a
"Grain" slider that adds film-like noise. Put both in adjust(), and add a
"Film" preset that uses them.
```

```text
Add a "Contact sheet" button to the photo editor: it applies the current
settings to every photo in _media/photos/ and saves the results in
_media/photos/batch/, then shows them in a grid.
```

```text
Add a straighten slider (-10° to +10°) to the photo editor that rotates the
photo and crops in just enough that no empty corners show.
```
