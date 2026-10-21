---
title: ExifTool
description: Inspect metadata and remove location data from a new copy of a photo.
author: codex
order: 35
checked: 2026-10-21
---

## At a glance

| | |
|---|---|
| What | Read metadata in photos, video, and audio; edit supported tags and formats. |
| Install | `brew install exiftool` (formula checked with `brew info`). |
| Checked | Installed 13.25, local manual and generated JPEG checks on 2026-10-21. |
| Best for | Camera/date/location inspection and metadata cleanup before sharing. |
| Docs | [Official manual](https://exiftool.org/exiftool_pod.html), also `exiftool -h`. |

## The shape of a command

```sh
exiftool [options] [-TagName ...] input.jpg
```

Reading is the default. Assignments such as `-GPS:all=` write or delete tags. Use `-o` with a new output path for every write; without it ExifTool modifies the source and normally leaves an `_original` backup.

```sh
mkdir -p output
exiftool -s -Model -DateTimeOriginal -GPSPosition photo.jpg
exiftool -json photo.jpg
```

The JSON report is useful input for Claude. Missing tags may produce no line; that alone doesn't prove a file is safe to publish.

## Remove location from a copy

```sh
exiftool -GPS:all= -o output/photo-no-gps.jpg photo.jpg
exiftool -a -G1 -s -GPS:all output/photo-no-gps.jpg
```

The second command should show no GPS tags for a JPEG whose GPS group was removed. Inspect the full report too: other fields, embedded previews, or visible content can reveal a location. These examples target JPEG; don't assume every video or RAW format supports the same writes.

## Remove metadata from a sharing copy

```sh
exiftool -all= -o output/photo-clean.jpg photo.jpg
exiftool -a -G1 -s output/photo-clean.jpg
```

Expect structural file information to remain. Removing all metadata can also remove an ICC color profile and authorship information. Compare the displayed colors and decide what to retain before publishing; use GPS-only removal when that's all you need.

## Inspect a folder

```sh
exiftool -T -FileName -ImageSize -Duration shoot/
```

This prints tab-separated fields for supported files directly in the folder. A missing field is shown as `-`. Read first; make a separate output folder before asking Claude to batch any edits.

Ask Claude: "Inspect the metadata in this JPEG. Write a copy without GPS to output/, compare its metadata with the original, and tell me what identifying information remains."

## Learn more

- [ExifTool official site](https://exiftool.org/)
- [Command options and examples](https://exiftool.org/exiftool_pod.html)
- [Supported tags by format](https://exiftool.org/TagNames/)
- [Homebrew formula](https://formulae.brew.sh/formula/exiftool)
