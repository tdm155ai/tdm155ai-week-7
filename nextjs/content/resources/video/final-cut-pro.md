---
title: Final Cut Pro
description: Apple's professional video editor for the Mac, fast to cut in, with AI tools that run on your own machine.
author: claude
order: 20
checked: 2026-10-20
---

## At a glance

| | |
| --- | --- |
| Maker | Apple |
| Platforms | Mac (Final Cut Pro for iPad is a separate app) |
| Price | $299.99 one-time on the Mac App Store, or as part of **Apple Creator Studio**: $12.99/month or $129/year, and **$2.99/month or $29.99/year for college students**, with a free first month. Creator Studio also includes Logic Pro, Pixelmator Pro, Motion, Compressor, and MainStage. |
| Education bundle | Apple stopped selling the Pro Apps Bundle for Education on its own in January 2026; it is still offered with a new Mac from the Apple Education Store. For most students, the Creator Studio student price is the route now. |
| Current version | 12.4 (September 29, 2026); needs macOS 26.6 or later. Many AI features need a Mac with Apple silicon. |
| Project format | A library (`.fcpbundle`) holding events, clips, and projects. Interchange: FCPXML. |

## What it's for

Final Cut Pro is a full professional editor built around speed. Its **magnetic timeline** keeps clips packed together: delete one and the rest close up, drag one and the others move out of the way. Pick it if you edit on a Mac and want to cut fast, if you are moving up from iMovie, or if you want strong AI search and masking tools that run offline. Pick Resolve instead for deep color and audio work for free, or Premiere if your class or team works in Adobe.

## The tour

| Part | What it does |
| --- | --- |
| **Libraries sidebar** | Top left. Libraries contain **events** (folders of clips) and **projects** (edits). Command-1 shows or hides it. |
| **Browser** | Next to the sidebar. Clips in the selected event, as filmstrips or a list. Skim with the pointer; press I and O to mark a range. |
| **Viewer** | Top center. Plays the browser clip or the timeline. Video scopes open here (Command-7). |
| **Inspector** | Top right (Command-4). Settings for whatever is selected: video, audio, color, captions, titles. |
| **Timeline** | Bottom. The **primary storyline** is the main row of clips; **connected clips** sit above (B-roll, titles) or below (music). |
| **Effects and Transitions browsers** | Bottom right of the timeline (Command-5 and Control-Command-5). |
| **Toolbar** | Import, keywords, background tasks, and the Share button. |

## The basic edit

1. **New library and project:** File > New > Library, then File > New > Project. Let it set the project's format from the first clip.
2. **Import:** Command-I. Choose files or a camera card. Turn on *Create proxy media* here if your Mac struggles with the footage.
3. **Mark ranges:** skim a clip in the browser, press **I** at the start and **O** at the end. Press **F** to mark the range as a favorite.
4. **Build:** **E** appends to the end of the primary storyline, **W** inserts at the playhead, **D** overwrites, **Q** connects above (for B-roll or a cutaway).
5. **Cut and trim:** Command-B blades at the playhead. Drag clip edges to trim; the rest of the edit ripples. Press **T** for the Trim tool to roll or slip.
6. **J and L cuts:** Control-S expands audio from video on a clip, then drag the audio edge past the video edge.
7. **Sound:** connect music below the storyline. Adjust levels in the Audio inspector; Command-8 opens Audio Enhancements (Voice Isolation, Loudness, Noise Removal, Hum Removal).
8. **Color:** Command-6 opens the Color inspector. Start with Enhance Light and Color, then adjust.
9. **Captions:** Transcribe to Captions or Generate Captions (below), or import an SRT with File > Import > Captions.
10. **Export:** File > Share > Export File, or Command-E for the default destination.

## Shortcuts to learn first

| Action | Keys |
| --- | --- |
| Play backward / stop / play forward | J / K / L |
| Play / pause | Space |
| Mark range start / end | I / O |
| Append to storyline | E |
| Insert at playhead | W |
| Overwrite | D |
| Connect to primary storyline | Q |
| Blade at playhead | Command-B |
| Select tool / Blade tool / Trim tool | A / B / T |
| Snapping on or off | N |
| Zoom timeline to fit | Shift-Z |
| Expand audio from video | Control-S |
| Detect Edits (split at scene changes) | Shift-E |
| Enable Beat Detection | Option-B |
| Add Magnetic Mask | Control-Command-M |
| Enhance Light and Color | Control-Option-Command-O |
| Match Color | Option-Command-M |
| Inspector / Color inspector / Scopes | Command-4 / Command-6 / Command-7 |
| Share to default destination | Command-E |
| Keyboard shortcut editor | Option-Command-K |

Apple's full list: [Keyboard shortcuts in Final Cut Pro for Mac](https://support.apple.com/guide/final-cut-pro/keyboard-shortcuts-ver90ba5929/mac).

## AI in the app

All of these run on your Mac. None of them uses cloud credits, and they are in the one-time purchase as well as Creator Studio.

| Feature | Since | What it does |
| --- | --- | --- |
| **Transcript Search** | 12.0 | Search spoken words across your clips, by exact phrase or related words. Apple silicon. |
| **Visual Search** | 12.0 | Type what you're looking for ("dog on a beach") and it finds the moments. Apple silicon. |
| **Beat Detection** | 12.0 | Analyzes music and shows bars and beats as a grid, so cuts can land on the beat. |
| **Transcribe to Captions** | 11.0 | Makes captions from speech. Apple silicon and macOS Sequoia or later. |
| **Generate Captions** | 12.3 | Newer captioning. Apple silicon, U.S. English only for now. |
| **Magnetic Mask** | 11.0 | Isolates a person or object from the background without a green screen. Apple silicon recommended. |
| **Auto Mask** | 12.3 | Adds a mask automatically to the selection. |
| **Match Color** | 12.3 | Matches one clip's color to another's. |
| **Detect Edits** | 12.3 | Finds the cuts in a clip that was already edited (an old film, a downloaded reel) and splits it at each one. |
| **Enhance Light and Color** | 10.8 | One-step automatic correction of color balance, contrast, and brightness. |
| **Smooth Slo-Mo** | 10.8 | Generates in-between frames for smoother slow motion. |
| **Object Tracker** | 10.6 | Tracks a face or object so titles and effects follow it. |
| **Image Playground** | 11.1 | Apple Intelligence image generation inside FCP. Needs an M1 or later Mac and macOS 15.2 or later. |

The audio tools in Audio Enhancements (Voice Isolation, Noise Removal) are also machine-learning based and local.

## Working with Claude

**FCPXML is the way in and out.** File > Import > XML brings in a timeline as a project; File > Export XML writes one out. Claude can read an exported FCPXML (to list every clip and its timing, or check which sources an edit uses) and can write one from a paper cut. The [video overview](README.md#paper-cut-from-a-transcript) has a minimal FCPXML paper cut that validates against the DTD Final Cut Pro ships with. Final Cut Pro 12 writes FCPXML 1.14 and reads earlier versions. The spec is the [FCPXML Reference](https://developer.apple.com/documentation/professional-video-applications/fcpxml-reference).

Final Cut Pro does not import EDLs or OTIO files directly. Run them through Resolve, or ask Claude to rewrite the timing as FCPXML.

**Captions:** File > Import > Captions takes SRT, iTT, and SCC files, so Claude can fix a caption file (names, line length, timing offsets) and you bring it back in.

**Silence cutting:** `auto-editor` cuts the pauses out of a talking-head clip and writes an FCPXML you import, so you can still adjust every cut (tested with auto-editor 31.7.2):

```bash
auto-editor interview.mov --margin 0.3s --export final-cut-pro -o interview_cut.fcpxml
```

See [AI video tools](ai-tools.md) for more.

**Proxies from the command line**, if you want them outside the app (Final Cut Pro can also make its own, including HEVC proxies since 12.3). This makes a half-size ProRes Proxy file (tested with ffmpeg 9.0.2):

```bash
ffmpeg -i clip.mp4 -vf scale=-2:540 -c:v prores_ks -profile:v 0 -c:a pcm_s16le clip_proxy.mov
```

Example prompt:

```text
Here is interview_v3.fcpxml exported from Final Cut Pro. List every clip in the
primary storyline in order with its source file, source in/out, and duration,
then tell me which answers from interview.srt I cut out entirely.
```

## Export settings that work

File > Share > Export File, then in Settings:

| Setting | Choose |
| --- | --- |
| Format | Video and Audio |
| Video codec | H.264 (Faster Encode or Better Quality) for sharing; Apple ProRes 422 for a master |
| Resolution | Same as the project |
| Captions | Choose a caption role to include, or burn in |

## Learn more

- [Final Cut Pro User Guide for Mac](https://support.apple.com/guide/final-cut-pro/welcome/mac)
- [Keyboard shortcuts](https://support.apple.com/guide/final-cut-pro/keyboard-shortcuts-ver90ba5929/mac)
- [Final Cut Pro release notes](https://support.apple.com/102825)
- [FCPXML Reference](https://developer.apple.com/documentation/professional-video-applications/fcpxml-reference)
- [Apple Creator Studio for students](https://creatorstudio.apple.com/info/student)
