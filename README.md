# tdm155ai-week-7

TDM 155AI week 7 (class 2026-10-21): Editing. Editing video, audio, and images, with the standard apps and with AI. A local Next app in `nextjs/` renders the week's Markdown in `nextjs/content/`; the main section is `/resources`, one sheet per editing app and command-line tool. Private; nested in `ll-26-27/the-notebook` at `apps/tdm155ai/tdm155ai-week-7/`.

## Run it

```
cd nextjs
pnpm install
pnpm dev
```

## Utilities

`utils/` at the repo root, outside the app, holds the generation scripts carried forward from week 6 (text, images, and video through OpenRouter, fal, and Harvard's HUIT gateways), the model listers, the stills extractor, and an image compressor; week 7's editing tools are being added beside them in `utils/multicam/` and `utils/edit/`. Copy `.env.example` to `.env` at the root and fill in the keys provided in class; run `pnpm install` once at the root (for Sharp), then `pnpm text`, `pnpm image`, `pnpm video`, `pnpm stills`, `pnpm compress-image`, and `pnpm test` for the offline tests. What the scripts make lands in `output/` (gitignored). See [utils/README.md](utils/README.md) for every command and `utils/examples.md` for the ones that were run for real.

## Layout

- `nextjs/content/README.md`: the home page.
- `nextjs/content/resources/`: the resource sheets, in four groups: `audio/` (GarageBand, Logic Pro, AI audio tools), `video/` (iMovie, Final Cut Pro, DaVinci Resolve, Premiere Pro, AI video tools), `images/` (Photoshop, Lightroom, AI image tools), and `cli/` (ffmpeg, ImageMagick, SoX, and more tools). `/resources` shows them as a docs site with every sheet in a sidebar; the header links go straight to each group.
- Any page prints from `/print/<path>`; `/print/set` prints the documents listed in `print_set:` in the home page's frontmatter (the three CLI sheets to start).
- `_media/` is gitignored, for local files.
- `utils/`: the scripts (see Utilities above); `output/` is gitignored, for what they make.

## Where it came from

**Copied 2026-10-20 from `tdm155ai/tdm155ai-week-6` at `1740c7a`**, the Markdown-rendering parts of its Next app only: `lib/content.mjs`, the catch-all page, `/print`, `/context-media` (images beside a doc), the Markdown and sidebar components, and the CSS. Week 6's `/skills` docs route became `/resources`. Left behind: activities, concepts, explorations, the Tools tab with capture, live, and video generation, the streaming server, and the origin-story skill; `utils/` followed on 2026-10-21 (see Utilities). The accent changed from red to amber.

The resource sheets were written by Claude on 2026-10-20, checked against vendor pages that day (each sheet's `checked:` frontmatter), with every command-line example run on a Mac with Homebrew's ffmpeg, ImageMagick, SoX, and exiftool.
