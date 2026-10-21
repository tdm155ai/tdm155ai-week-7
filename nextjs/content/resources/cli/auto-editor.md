---
title: auto-editor
description: Preview silence-based cuts and export a rough cut to an editing timeline.
author: codex
order: 45
checked: 2026-10-21
---

## At a glance

| | |
|---|---|
| What | Audio-driven rough cuts, rendered media, or editable timeline exports. |
| Install | `brew install auto-editor` (formula checked). |
| Checked | Installed 31.7.2; local help and generated-media preview/render/export on 2026-10-21. Editor imports not tested. |
| Best for | A first pass on a long talking-head recording. |
| Docs | [Official options](https://auto-editor.com/ref/options). |

## The shape of a command

```sh
auto-editor input.mp4 --margin 0.3s -c:a aac -o output/rough-cut.mp4
```

The input comes first; options specify how to cut and where to save. Start with `--preview` before rendering.

## Common jobs


**What it does:** finds the silent parts of a video or audio file and cuts them out. It can render a new file, or export the edit as a **timeline** you open in Premiere Pro, DaVinci Resolve, Final Cut Pro, Shotcut or Kdenlive, so you keep every cut adjustable.

**Install:** `brew install auto-editor`. (The project no longer publishes the command-line tool on pip, so ignore older `pip install` instructions. It also offers a downloadable binary.)

**Earlier test (2026-10-20):** tested with auto-editor 31.7.2 on a test clip with a 3-second pause.

See what it would cut, without writing anything:

```sh
auto-editor talk.mp4 --preview
```

On the test clip: 8.17 s in, 5.37 s out, one cut of 2.80 s.

Render a new file:

```sh
mkdir -p output
auto-editor talk.mp4 --margin 0.3s -c:a aac -o output/talk-cut.mp4
```

On this Mac, the default `aac_at` encoder failed during the generated-media test. The explicit `-c:a aac` above selects the encoder that passed.

`--margin 0.3s` keeps 0.3 s of air around each bit of speech so words don't get clipped. `--edit audio:threshold=0.04` changes how quiet counts as silence.

Export a timeline instead of a video:

```sh
auto-editor talk.mp4 --export premiere -o output/talk-premiere          # writes talk-premiere.xml
auto-editor talk.mp4 --export resolve -o output/talk-resolve            # writes talk-resolve.fcpxml
auto-editor talk.mp4 --export final-cut-pro -o output/talk-fcp          # writes talk-fcp.fcpxml
```

Other modes: `shotcut`, `kdenlive`, `resolve-fcp7` (XML for Resolve), and `v3` (auto-editor's own JSON). The timeline points at your original media file, so don't move or rename it before you import.

## Check before committing to the cut

Watch the result with headphones. Silence can carry a reaction, a breath, or an intentional pause; a loud room can fool an audio threshold. Adjust the margin and threshold on a short excerpt first. Keep every export in `output/` with a distinct filename.

Ask Claude: "Preview the silence cuts in this interview, explain the threshold and margin, then export an editable timeline to output/. Keep the originals and tell me what I need to review in the editor."

## Learn more

- [Official site](https://auto-editor.com/)
- [Options reference](https://auto-editor.com/ref/options)
- [Editing guide](https://auto-editor.com/ref/edit)
- [Homebrew formula](https://formulae.brew.sh/formula/auto-editor)
