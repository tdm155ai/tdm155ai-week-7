---
title: ImageMagick
description: The command-line image tool. Resize, crop, convert, strip metadata, batch a folder, make contact sheets, captions, watermarks and GIFs. Plus sips, which comes with macOS.
author: claude
order: 20
checked: 2026-10-20
---

## At a glance

| | |
|---|---|
| What | Reads, edits and writes images from the command line. One command, `magick`, does everything. |
| Install | `brew install imagemagick` |
| Tested with | ImageMagick 7.1.1-47 (Homebrew, Apple Silicon), 2026-10-20 |
| Reads | JPEG, PNG, TIFF, WebP, GIF, PSD (flattened), HEIC/AVIF if built with libheif, JPEG XL, PDF (needs Ghostscript) and many more. List them with `magick -list format`. |
| Docs | [imagemagick.org command-line options](https://imagemagick.org/script/command-line-options.php) |

**ImageMagick 7 uses `magick`.** Older tutorials use `convert`, `identify`, `mogrify` and `montage` as separate commands. In version 7 you write `magick` (in place of `convert`) or `magick identify`, `magick mogrify`, `magick montage`. Ask Claude to use the IM7 forms.

The shape of a command: input, operations in order, output.

```sh
magick input.jpg -resize 1600x1600 -quality 82 output/result.jpg
```

Examples below use `photos/photo1.jpg` (4032x3024, with camera and GPS metadata), `photos/photo2.jpg` (3024x4032), `photos/logo-on-white.png` and `photos/watermark.png` (white text on a transparent background). Run `mkdir -p output` first.

## Identify: what is this image?

```sh
magick identify photos/photo1.jpg
```

prints `photos/photo1.jpg JPEG 4032x3024 4032x3024+0+0 8-bit sRGB 273437B ...`.

Just the fields you want, for a whole folder (good for Claude to read):

```sh
magick identify -format "%f %wx%h %m %[colorspace] q%Q\n" photos/*.jpg
```

Everything, including EXIF: `magick identify -verbose photos/photo1.jpg`. For metadata, [ExifTool](more-tools.md#exiftool) gives cleaner output.

## Resize

```sh
magick photos/photo1.jpg -resize 1600x1600 output/photo1-1600.jpg     # fits inside 1600x1600: 1600x1200
magick photos/photo1.jpg -resize 50% output/photo1-half.jpg            # half size: 2016x1512
magick photos/photo1.jpg -resize 1200x output/photo1-1200w.jpg         # 1200 wide, height to match
```

**Only shrink, never enlarge:** add `>` (quote it, or the shell treats `>` as a redirect).

```sh
magick photos/logo-on-white.png -resize '4000x4000>' output/logo.png   # stays 1200x800
```

**Fill a square, then crop the overflow** (`^` means "cover"):

```sh
magick photos/photo1.jpg -resize '1080x1080^' -gravity center -extent 1080x1080 output/photo1-square.jpg
```

## Crop and gravity

```sh
magick photos/photo1.jpg -crop 800x600+100+200 +repage output/crop.jpg                  # 800x600 starting 100 right, 200 down
magick photos/photo1.jpg -gravity center -crop 1080x1350+0+0 +repage output/crop-4x5.jpg  # centered 4:5 crop
```

`-gravity` sets where offsets are measured from: `center`, `north` (top), `south`, `east`, `west`, `northeast` and so on. `+repage` clears the leftover canvas offset so the cropped file behaves normally in other apps.

**Trim borders** (removes edges that match the corner color; `-fuzz` allows near matches):

```sh
magick photos/logo-on-white.png -fuzz 5% -trim +repage output/trimmed.png
```

## Convert formats, including HEIC

Change the extension and ImageMagick converts:

```sh
magick photos/photo1.jpg output/photo1.png
magick photos/photo1.jpg -quality 82 output/photo1.webp
```

**iPhone HEIC to JPEG.** First check your build can read HEIC:

```sh
magick -list format | grep -i heic
```

If you see `HEIC  HEIC  rw+`, convert with:

```sh
magick IMG_0109.HEIC -auto-orient -quality 85 output/IMG_0109.jpg
```

If you get `no decode delegate for this image format 'HEIC'`, ImageMagick's HEIC support is missing or broken. That happened on our test Mac partway through testing, after Homebrew upgraded a library that the HEIC reader depends on. Try `brew update && brew upgrade imagemagick libheif`, or use `sips` (below), which reads iPhone photos on any Mac.

## Quality and stripping metadata

```sh
magick photos/photo1.jpg -quality 82 -strip output/photo1-web.jpg
```

- `-quality` for JPEG and WebP runs 1–100. 80–85 is a good web default; phone cameras save around 90+.
- `-strip` removes EXIF and other metadata, **including GPS location**.

Resizing alone keeps the metadata. In testing, `-resize` without `-strip` kept the camera model and GPS coordinates in the output. Strip before you post.

A sensible "make it ready to share" line:

```sh
magick photos/photo1.jpg -auto-orient -resize '2048x2048>' -strip -quality 82 output/photo1-share.jpg
```

`-auto-orient` rotates the pixels to match the camera's orientation tag, so the photo doesn't turn sideways once the tag is stripped.

## Batch a folder with mogrify

`magick mogrify` applies the same operations to many files. **Always give it `-path`.** Without `-path`, mogrify overwrites the originals in place.

```sh
mkdir -p output/web
magick mogrify -path output/web -resize '1600x1600>' -quality 82 -strip -format jpg photos/*.jpg photos/*.png
```

`-format jpg` converts as it goes, so the PNGs come out as JPEGs too. Or use a shell loop, which is easier to read and to change:

```sh
for f in photos/*.jpg; do magick "$f" -resize '1600x1600>' -strip -quality 82 "output/web/$(basename "$f")"; done
```

## Contact sheets with montage

```sh
magick montage -label '%f' -font /System/Library/Fonts/Supplemental/Arial.ttf -pointsize 14 -background '#222' -fill white photos/*.jpg photos/*.png -thumbnail 300x300 -geometry +8+8 -tile 3x output/contact.jpg
```

- `-label '%f'` puts each file name under its thumbnail. It has to come **before** the file names; in testing, putting it after gave a sheet with no labels.
- `-tile 3x` means three columns, as many rows as needed. `-geometry +8+8` is the spacing.

A contact sheet is a good way to show Claude a whole folder of photos in one image.

## Borders and captions

**Fonts.** ImageMagick's built-in font names don't always match your Mac's fonts. Giving a font file path always works: `-font /System/Library/Fonts/Supplemental/Arial.ttf`. `magick -list font | grep Font:` shows the names it knows.

```sh
magick photos/photo1.jpg -resize 1200x -bordercolor white -border 40 output/border.jpg
```

A caption bar under the photo:

```sh
magick photos/photo1.jpg -resize 1200x -gravity south -background black -splice 0x100 -font /System/Library/Fonts/Supplemental/Arial.ttf -pointsize 48 -fill white -annotate +0+25 'Harvard Yard, October 2026' output/caption.jpg
```

`-splice 0x100` with `-gravity south` adds 100 px at the bottom. `-annotate +0+25` places the text 25 px up from the bottom edge.

## Compositing and watermarks

```sh
magick photos/photo1.jpg photos/watermark.png -gravity southeast -geometry +40+40 -composite output/watermarked.jpg
```

At 50% opacity:

```sh
magick photos/photo1.jpg \( photos/watermark.png -alpha set -channel A -evaluate multiply 0.5 +channel \) -gravity southeast -geometry +40+40 -composite output/watermarked-50.jpg
```

The parentheses (escaped with `\` for the shell) apply the opacity change to the watermark only.

## Color adjustments

```sh
magick photos/photo2.jpg -auto-level output/autolevel.jpg              # stretch to full black-to-white range
magick photos/photo2.jpg -level 5%,95% output/levels.jpg               # set black point and white point
magick photos/photo2.jpg -modulate 105,130,100 output/modulate.jpg     # brightness 105%, saturation 130%, hue unchanged
magick photos/photo2.jpg -brightness-contrast 10x15 output/bc.jpg      # +10 brightness, +15 contrast
magick photos/photo2.jpg -colorspace Gray output/gray.jpg              # black and white
```

To check how much a file changed: `magick compare -metric RMSE photos/photo2.jpg output/levels.jpg null:` prints a difference score (0 means identical).

## Animated GIF from frames

```sh
magick -delay 10 -loop 0 frames/*.jpg -resize 480x output/anim.gif
magick output/anim.gif -coalesce -layers Optimize output/anim-small.gif
```

`-delay` is in hundredths of a second per frame (10 = 10 fps). `-loop 0` loops forever. To make the frames from a video, use ffmpeg: `ffmpeg -i clip.mp4 -vf fps=10 frames/%03d.jpg` (or make the GIF in ffmpeg directly; see [ffmpeg](ffmpeg.md#gif)).

## sips: built into macOS

Every Mac has `sips` (scriptable image processing system). It does less than ImageMagick, but needs no install and reads anything Preview can open, including iPhone HEIC.

```sh
sips -s format jpeg -s formatOptions 85 IMG_0109.HEIC --out output/IMG_0109.jpg   # HEIC to JPEG, quality 85
sips -Z 1600 photos/photo1.jpg --out output/photo1-sips.jpg                        # long edge 1600 px
sips -g pixelWidth -g pixelHeight photos/photo1.jpg                                # report size
```

All three tested on macOS with a real iPhone HEIC photo. Like `mogrify`, `sips` edits the file in place unless you give `--out`.

## Learn more

- [ImageMagick command-line options](https://imagemagick.org/script/command-line-options.php): every option on this page
- [Porting to ImageMagick 7](https://imagemagick.org/script/porting.php): why it's `magick` now, and what changed from `convert`
- [Format and print image properties](https://imagemagick.org/script/escape.php): the `%f`, `%w`, `%h` codes used with `-format` and `-label`
- [ImageMagick Usage examples](https://usage.imagemagick.org/): a large worked-example collection (written for version 6; swap `convert` for `magick`)
- `man sips` in Terminal for the full `sips` reference
