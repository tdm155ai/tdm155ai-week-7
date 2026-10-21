---
title: DaVinci Resolve
description: Blackmagic Design's editor, color, effects, and audio app in one; the free version is a full professional tool, and Studio adds the AI and a Claude connection.
author: claude
order: 30
checked: 2026-10-20
---

## At a glance

| | |
| --- | --- |
| Maker | Blackmagic Design |
| Platforms | Mac, Windows, Linux; also iPad |
| Price | **DaVinci Resolve** is free. **DaVinci Resolve Studio** is a one-time $295 license (Blackmagic's store showed $236 on sale when this was checked), with free upgrades so far. |
| Current version | 21.1 (September 8, 2026); 21.1.1 is a later bug-fix release. Version 21 came out in June 2026. |
| Project format | Projects live in a **project library** (a database) managed by Resolve, not as loose files. Use File > Export Project to get a `.drp` file you can move or back up. A project opened in 21 can't be opened again in 20. |
| Interchange | Imports and exports FCPXML, FCP 7 XML, EDL, AAF, and OTIO |

**Free vs. Studio, in short:** the free version edits, colors, mixes, and delivers at up to Ultra HD (3840x2160) on one GPU. Studio adds the DaVinci Neural Engine AI tools, noise reduction, higher resolutions and frame rates, more effects, Python scripting, and (since 21.1) the AI assistant connection for Claude.

## What it's for

Resolve started as the color-grading system used on films, then grew an editor (Cut and Edit pages), a compositor (Fusion), and a full audio post room (Fairlight). Pick it if you want one free app that covers everything, if color matters to your piece, or if you want Claude to work inside the editor (Studio). It is a large app: learn the Cut or Edit page first and ignore the rest until you need it.

## The tour

Resolve is organized into **pages**, chosen with the buttons along the bottom of the window. Each page is a different workspace on the same project.

| Page | What it's for |
| --- | --- |
| **Media** | Browse your drives and import clips into the **Media Pool**. Sync audio, organize bins. |
| **Photo** | New in 21: stills editing with RAW support. Not needed for video. |
| **Cut** | A fast, simplified editor for getting a cut together quickly. Good for beginners and deadlines. |
| **Edit** | The full timeline editor: tracks, trimming, titles, transitions, keyframes. Most people live here. |
| **Fusion** | Node-based compositing and motion graphics. |
| **Color** | Correction and grading with nodes, scopes, and qualifiers. Resolve's strongest page. |
| **Fairlight** | Audio mixing, cleanup, and effects. |
| **Deliver** | Render settings and the render queue. This is where you export. |

On the Edit page: the **Media Pool** (top left), the **Source viewer** and **Timeline viewer** (top center), the **Inspector** and **Effects** library (toggle with the buttons at the top right and left), and the **timeline** across the bottom.

## The basic edit

1. **New project:** the Project Manager opens at launch; click New Project.
2. **Import:** on the Media page, find your folder and drag clips into the Media Pool, or on any page use File > Import > Media (Command-I).
3. **Timeline:** go to the Edit page. Drag the first clip into the empty timeline area, or right-click in the Media Pool > Create New Timeline.
4. **Mark and place:** double-click a clip to open it in the Source viewer, press **I** and **O** to mark the range, then **F9** to insert at the playhead or **F10** to overwrite. **F12** places it on top (B-roll on the next track).
5. **Cut and trim:** Command-B cuts at the playhead. Shift-Delete ripple deletes (removes and closes the gap). Press **T** for Trim Edit mode, **A** to go back to Selection mode.
6. **J and L cuts:** turn off linked selection (the chain-link button above the track headers) or hold Option while dragging an audio edge.
7. **Color:** go to the Color page. Correct the first shot (white balance, exposure) with the primaries, then grade.
8. **Sound:** adjust clip levels in the Inspector or on the Fairlight page; Normalize Audio Levels is in the clip's right-click menu.
9. **Export:** go to the Deliver page, pick a preset, set a filename and location, click **Add to Render Queue**, then **Render All**.

On a MacBook, the F keys need the fn key held down unless you set them as standard function keys in System Settings > Keyboard.

## Shortcuts to learn first

| Action | Keys |
| --- | --- |
| Play backward / stop / play forward | J / K / L |
| Play / pause | Space |
| Mark in / out | I / O |
| Insert edit | F9 |
| Overwrite edit | F10 |
| Place on top | F12 |
| Cut (razor) at playhead | Command-B |
| Ripple delete | Shift-Delete |
| Selection mode / Trim Edit mode / Blade Edit mode | A / T / B |
| Snapping on or off | N |
| Zoom timeline to fit | Shift-Z |
| Import media | Command-I |
| Undo / redo | Command-Z / Shift-Command-Z |

Resolve's shortcuts can be viewed and changed in DaVinci Resolve > Keyboard Customization, and you can switch to a Premiere or Final Cut Pro keyboard layout there.

## AI in the app

Almost all of Resolve's AI tools are **Studio-only**. They run on your Mac (some need a one-time model download through the Extras Download Manager) and don't use credits. Blackmagic's product page lists the DaVinci Neural Engine, text-based editing, Magic Mask, and AI noise reduction as Studio features, and the 21.1 Reference Manual marks each new Resolve 21 AI tool as Studio-only.

| Feature | What it does |
| --- | --- |
| **Text-based editing / transcription** | Transcribes clips; you select and delete text to edit, and search by what was said. |
| **Magic Mask** | Isolates and tracks a person or object for color or effects. 21 can render it out as a separate matte. |
| **Voice Isolation, Dialogue Separator, Music Remixer** | Fairlight tools that separate a voice from noise, or split a mix into parts. |
| **Smart Reframe** | Reframes a horizontal shot for vertical or square delivery by following the subject. |
| **SpeedWarp, SuperScale, UltraNR** | Smoother slow motion, AI upscaling, and AI noise reduction. |
| **Face recognition, scene cut detection, object removal** | Sorting clips by who appears, splitting a pre-edited file at its cuts, removing an object from a shot. |
| **IntelliScript** | Builds a timeline from a script (21 accepts Final Draft or plain text). |
| **IntelliSearch** (21) | Search clips for people, objects, and content after they're analyzed. |
| **Speech Generator** (21) | Turns typed text into a spoken audio clip. |
| **CineFocus** (21) | Builds synthetic depth to change focus and add bokeh. |
| **Face Reshaper, Face Age Transformer, Blemish Removal** (21) | Face retouching tools. |
| **SlateID, UltraSharpen, Motion DeBlur** (21) | Reads slates into metadata, sharpens, removes motion blur. |

If you are on the free version, check the Reference Manual's license notes before planning around any of these. The free version still has the editing, color, Fusion, and Fairlight basics.

## Working with Claude

### The AI assistant connection (Studio 21.1)

Resolve Studio 21.1 has a built-in **MCP server**, which lets Claude Code, Claude, or ChatGPT Codex call functions inside Resolve: analyze a project, organize media, adjust settings, make edits like highlight reels from long recordings, and batch render. Blackmagic names Claude and Claude Code as supported. Set it up from **File > Setup AI Assistants** in Resolve, choose your assistant, and restart the assistant. The free version doesn't include it.

Example prompts once it's connected:

```text
Look at the clips in the "Interviews" bin. Make a timeline called "Selects" with
every answer longer than 20 seconds, in the order they were recorded, and put a
blue marker at the start of each with the first sentence as its name.
```

```text
Render the "Final v4" timeline twice: H.264 1080p for the web, and ProRes 422 HQ
as a master, into ~/Movies/exports/.
```

Treat what it does like any other edit: watch the result before you trust it, and keep a copy of the project (File > Export Project) before you let it change things.

### The scripting API

Resolve has a Python and Lua scripting API. The documentation ships with the app: **Help > Documentation > Developer** opens the folder, and the reference is the `README.txt` at:

```text
/Library/Application Support/Blackmagic Design/DaVinci Resolve/Developer/Scripting/README.txt
```

with an `Examples` folder (Python and Lua) and the `Modules` folder Python needs. The API can create projects and timelines, import media, build a timeline from a list of clips with in and out frames (`CreateTimelineFromClips`, `AppendToTimeline`), import a timeline file (`ImportTimelineFromFile` takes AAF, EDL, XML, FCPXML, DRT, ADL, and OTIO), add markers, transcribe audio, create subtitles from audio, export timelines (including FCPXML, EDL, and OTIO), and set up and start renders. Resolve can also run with no window using the `-nogui` option.

Who can use it: **since 21.1, Python scripting requires Studio**, and Python 2 is gone. Lua scripts still run in the free version from Workspace > Scripts. Running scripts from outside Resolve (your terminal, Claude Code) has been a Studio feature for a long time, and is allowed in Preferences, where you choose local or network access.

The setup, from the README (Mac):

```bash
export RESOLVE_SCRIPT_API="/Library/Application Support/Blackmagic Design/DaVinci Resolve/Developer/Scripting"
export RESOLVE_SCRIPT_LIB="/Applications/DaVinci Resolve/DaVinci Resolve.app/Contents/Libraries/Fusion/fusionscript.so"
export PYTHONPATH="$PYTHONPATH:$RESOLVE_SCRIPT_API/Modules/"
```

```python
import DaVinciResolveScript as dvr_script
resolve = dvr_script.scriptapp("Resolve")
project = resolve.GetProjectManager().GetCurrentProject()
print(project.GetName())
```

These lines are from Blackmagic's README; they were not run for this sheet (they need Studio and Resolve open). Ask Claude to read the README on your machine before it writes a script, since the API changes between versions.

### Without Studio

Every version imports timeline files, so Claude can still do the paper cut: it writes an FCPXML, EDL, or OTIO file and you bring it in with **File > Import > Timeline**. See [the paper cut section](README.md#paper-cut-from-a-transcript) in the overview, and [`auto-editor`](ai-tools.md) for silence cutting (`--export resolve` writes an FCPXML for Resolve).

## Export settings that work

On the Deliver page:

| Setting | Choose |
| --- | --- |
| Preset | **H.264 Master** for a high-quality file, or **YouTube** for upload |
| Format / Codec | MP4 / H.264 for sharing; QuickTime / Apple ProRes 422 HQ for a master |
| Resolution and frame rate | Same as the timeline |
| Audio | AAC for MP4; Linear PCM for ProRes |

Then Add to Render Queue and Render All.

## Learn more

- [DaVinci Resolve product page and download](https://www.blackmagicdesign.com/products/davinciresolve)
- [What's new in Resolve 21](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew)
- [DaVinci Resolve training](https://www.blackmagicdesign.com/products/davinciresolve/training): free official books and videos, including *The Beginner's Guide to DaVinci Resolve*
- [DaVinci Resolve Reference Manual (PDF)](https://documents.blackmagicdesign.com/UserManuals/DaVinciResolveReferenceManual.pdf)
