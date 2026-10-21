---
task: F
title: The Tools tab, the shared media layer, and a clip trimmer
author: claude
status: Ready
owns: nextjs/app/tools/ (page.jsx, tools.css, trimmer/), nextjs/app/api/trim/, nextjs/app/media/, nextjs/lib/media.mjs, nextjs/app/components/ (the nav link only), nextjs/content/resources/tools/trimmer.md (new)
depends_on: none. G and A2 build on the media layer: commit it first, on its own (step 1), so they can start.
report: reports/F-tools-and-trimmer.md
---

## Marlon's words

October 21: "I'd also like the next app to have a forkable starter for some of the video editing tools. like a simple clip trimmer page that will let us select a whole bunch of segments and then export them as individual clips, saving to the gitignored _media folder maybe?"

**Forkable starter** sets the standard: each tool is a short, plainly written page a student can copy into their own app and change with Claude. One folder per tool, a comment at the top of each file saying what it does and what to change first, no clever abstractions, no new UI library.

## Copy from week 6 first

`apps/tdm155ai/tdm155ai-week-6/nextjs/` (in The Notebook) has a `/tools` tab (`app/tools/page.jsx`, `tools.css`), `lib/media.mjs` (the gitignored root `_media/`, resolved from `process.cwd()/..`), and `app/media/` (serves files from `_media/`). Read them, copy what fits, and say in your report which week 6 commit you copied from. Week 7's root `.gitignore` already ignores `_media/*` except `.gitkeep`.

## The task

1. **The media layer** (commit this first, alone, with "media layer" in the message): `lib/media.mjs` with safe helpers to list, read, and write under `_media/<area>/` (reject `..`, absolute paths, and symlinks out of `_media/`), and `app/media/[...path]` serving those files with correct content types and HTTP range requests so video seeks. Areas used this week: `sources/`, `clips/`, `photos/`. Write the helpers so G (photo tools) and A2 (multicam) can use them without changing them.
2. **`/tools`**: an index page with a card per tool (Trimmer now; G adds Photo editor and Background remover by adding to a plain array you leave at the top of `page.jsx`). Add "Tools" to the site nav.
3. **`/tools/trimmer`**:
   - Choose a source: the videos in `_media/sources/`, or drop a file to upload it there.
   - Play it with a scrub bar; mark in (I) and out (O) at the playhead, add as a segment, name it; J/K/L and arrow-key frame stepping if they're simple to do well. The segment list is editable (rename, nudge in/out, delete, preview a segment), and saved beside the source (`_media/sources/<name>.segments.json`) so a reload restores it.
   - Export: an API route (`app/api/trim/route.js`) runs ffmpeg once per segment and writes `_media/clips/<source-name>/<nn>-<segment-name>.mp4`. Offer "fast (stream copy, may start at the previous keyframe)" and "exact (re-encode H.264/AAC)" and explain the difference in one line on the page. Show progress per clip and link each finished clip.
   - Probe the source with ffprobe on load (duration, frame rate, size) and show it.
   - Server-side only uses `child_process.spawn` with an argument array (never a shell string built from user input).
4. **A short doc** `nextjs/content/resources/tools/trimmer.md` (frontmatter per `AGENTS.md`): what it does, where files go, how to fork it ("copy `app/tools/trimmer/` and `app/api/trim/` and ask Claude to …", with two or three example prompts in `text` blocks).

Check it on the running dev server, http://localhost:3007/tools/trimmer (rule 5), with a real video: generate one with ffmpeg `lavfi` into `_media/sources/` if there's none, and export at least three segments both ways. Say what you checked by hand.

## When you finish

Commit by path (rule 7) and write `_context/orchestration/reports/F-tools-and-trimmer.md` (rule 8), including the media layer's API (function names and signatures) for G and A2.
