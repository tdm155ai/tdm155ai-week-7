# TDM 155AI week 7: instructions for AI assistants

This repository is the week 7 reference for TDM 155AI (*Making Stuff in the Age of AI*): Editing (class October 21, 2026). The week covers editing video, audio, and images, with the standard apps and with AI. In class Marlon tours an audio app (GarageBand / Logic Pro), one or two video apps (DaVinci Resolve, Final Cut Pro, iMovie, Premiere Pro), and Photoshop and Lightroom, then the command line: ffmpeg, ImageMagick, and SoX. Students are editing their first project before the October 28 interview.

## Where things go

Everything the site shows is Markdown in `nextjs/content/`, and each file is a page at the same path (`nextjs/content/resources/cli/ffmpeg.md` is `/resources/cli/ffmpeg`).

- **`nextjs/content/resources/`**: one sheet per app or tool, grouped in `audio/`, `video/`, `images/`, and `cli/`. Each group's `README.md` is its overview. `/resources` shows the folder as a docs site.
- **`nextjs/content/README.md`**: the home page.

When a student asks how to do an edit, start from the sheet for their app or tool. For command-line work, read `nextjs/content/resources/cli/README.md` and the tool's sheet, inspect the file first (`ffprobe`, `magick identify`, `soxi`), work on copies, write results to `output/` (gitignored), and never overwrite the student's originals.

## Writing docs

Every Markdown file you write starts with YAML frontmatter that gives its title, a one-line description, and you as its author, so the student (and anyone reading) can tell your work from theirs:

```yaml
---
title: Cutting a paper edit from a transcript
description: Pick the lines, put them in order, and let ffmpeg assemble the cut.
author: claude
---
```

Relative links between `.md` files work, and an image saved beside a doc shows in it. `order:` in the frontmatter sets a document's place in lists and in the sidebar (lower first; otherwise by title). Don't put an H1 in the body; the title comes from the frontmatter.

## The app

- The site is a Next app in `nextjs/`. The student runs it themselves: `cd nextjs`, `pnpm install`, `pnpm dev`. Don't start it in the background.
- Plain JavaScript with its own CSS (`app/globals.css`); no TypeScript, Tailwind, or API keys.
