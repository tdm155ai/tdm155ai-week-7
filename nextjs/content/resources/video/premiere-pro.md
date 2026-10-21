---
title: Premiere
description: Adobe's video editor (long called Premiere Pro), free to most Harvard students, with transcript-based editing and Firefly generative tools.
author: claude
order: 40
checked: 2026-10-20
---

## At a glance

| | |
| --- | --- |
| Maker | Adobe |
| Name | Adobe's help pages now call the desktop app **Adobe Premiere**. The installed app is still named *Adobe Premiere Pro 2026*, and most people still say Premiere Pro. |
| Platforms | Mac, Windows |
| Price for you | **Free through Harvard.** HUIT licenses Adobe Creative Cloud (20+ apps, including Premiere, Photoshop, After Effects, Audition, and Firefly) for students in the College, FAS, GSAS, SEAS, and most other schools. DCE students are excluded. It includes 1,000 generative AI credits a month and installs on up to two devices at once. Start at [HUIT: Adobe Creative Cloud](https://huit.harvard.edu/adobe-creative-cloud) and follow its *Get started* link. |
| Current version | 26.5 (September 2026); 26.5.2 is the latest bug-fix release |
| Project format | `.prproj` project files; Productions for shared multi-project work |
| Interchange | Imports and exports FCP 7 XML, EDL, AAF, and OTIO (OTIO since 26.0) |

## What it's for

Premiere is the industry's most common editor outside of feature films, and it connects to the rest of Adobe's apps: Photoshop, After Effects, Audition, and Firefly. Pick it if you want to cut an interview by editing its transcript, if you already use Adobe apps, or if you want generative tools (extending a shot, generating a sound effect) inside the editor. Harvard pays for it, so price doesn't decide it. Pick Final Cut Pro instead for speed on a Mac, or Resolve for color.

## The tour

Across the top are four **modes**: **Import** (Option-1), **Edit** (Option-2), **Color** (Option-3), and **Export** (Option-4). Most of the work happens in Edit, which is made of panels:

| Panel | What it does |
| --- | --- |
| **Project panel** | Your imported clips, sequences, and bins. |
| **Source Monitor** | Plays a clip from the Project panel so you can mark in and out. |
| **Program Monitor** | Plays the sequence you are building. |
| **Timeline** | The sequence: video tracks (V1, V2...) above, audio tracks (A1, A2...) below. |
| **Properties** and **Effect Controls** | Settings for the selected clip: position, scale, opacity, effects, keyframes. |
| **Essential Sound** | Tag a clip as dialogue, music, or effects and get the matching tools, including Enhance Speech. |
| **Text** | Transcript, Captions, and Graphics tabs. Where text-based editing and captions happen. |
| **Search** | Searches your media by what is in it (Media Intelligence). |

The Window menu reopens any panel you close. Window > Workspaces > Reset to Saved Layout fixes a messy screen.

## The basic edit

1. **New project:** File > New > Project, or start from the Import mode, which can make a sequence from the clips you pick.
2. **Import:** Command-I, or drag files into the Project panel.
3. **Mark:** double-click a clip to open it in the Source Monitor. Press **I** and **O**.
4. **Build:** press **,** (comma) to insert at the playhead or **.** (period) to overwrite. Or drag from the Source Monitor to the timeline.
5. **Cut and trim:** Command-K adds an edit at the playhead. **C** is the Razor tool, **V** the Selection tool. **Q** and **W** ripple-trim the clip under the playhead back to it from the start or end. Option-Delete ripple deletes.
6. **J and L cuts:** Option-drag the audio edge of a linked clip to move it without the video, or unlink with Command-L.
7. **Text-based editing:** in the Text panel's Transcript tab, transcribe the clip, then select sentences and insert them into the sequence, or delete text to delete the media.
8. **Sound:** select dialogue, tag it as Dialogue in Essential Sound, and try Enhance Speech. Adjust gain with **G**.
9. **Color:** switch to Color mode (Option-3), or use Lumetri Color in Edit.
10. **Export:** Export mode (Option-4) or File > Export > Media (Command-M).

## Shortcuts to learn first

| Action | Keys |
| --- | --- |
| Play backward / stop / play forward | J / K / L |
| Play / stop | Space |
| Mark in / out | I / O |
| Insert / overwrite | , / . |
| Add edit at playhead | Command-K |
| Add edit to all tracks | Shift-Command-K |
| Selection tool / Razor tool / Ripple Edit tool | V / C / B |
| Ripple trim previous / next edit to playhead | Q / W |
| Ripple delete | Option-Delete |
| Lift / extract (in-to-out range) | ; / ' |
| Snap in timeline | S |
| Zoom to sequence | \ (backslash) |
| Zoom timeline in / out | = / - |
| Match frame | F |
| Audio gain | G |
| Speed/duration | Command-R |
| Export media | Command-M |
| Modes: Import / Edit / Color / Export | Option-1 / 2 / 3 / 4 |

These are the default Premiere shortcuts on a Mac, checked against the shortcut file that ships with 26.5. Full list: [Premiere keyboard shortcuts](https://helpx.adobe.com/premiere/desktop/get-started/keyboard-shortcuts/default-keyboard-shortcuts.html). Premiere Pro > Keyboard Shortcuts lets you change them or load a Final Cut Pro or Avid layout.

## AI in the app

| Feature | What it does | Where it runs |
| --- | --- | --- |
| **Speech to Text** | Transcribes clips and sequences in many languages. | On your Mac (download the language pack) |
| **Text-Based Editing** | Edit by selecting and deleting transcript text; find and remove pauses and filler words. | On your Mac |
| **Paper Edit** (26.5) | Select lines in the transcript and Premiere assembles a sequence from them. | On your Mac |
| **Captions** | Create captions from the transcript and style them; 26.3 adds single-word animated captions. | On your Mac |
| **Media Intelligence** | Analyzes your media so the Search panel finds shots by description, spoken words, or metadata. Adobe says its models are installed locally and work offline. | On your Mac |
| **Enhance Speech** | In Essential Sound; makes a noisy or roomy voice sound like a studio recording. Adobe says it runs offline and uses no credits. | On your Mac |
| **Auto Reframe** | Reframes a sequence for vertical or square by following the action. | On your Mac |
| **Scene Edit Detection** | Finds the cuts in a pre-edited file and adds edits or markers. | On your Mac |
| **Object Mask** (26.0) | AI masking that tracks an object for color or effects; 26.2 added Sharp and Smooth edge modes. | Check Adobe's page |
| **Generative Extend** | Uses Firefly to add frames to the start or end of a clip so a shot holds a little longer. | **Cloud, uses credits** |
| **Generative Media Tool** (26.5) | Generates video clips and sound effects from a text prompt, right in the timeline. | **Cloud**; check credits |

**About credits:** Generative Extend is a premium feature. Adobe's table charges 100 credits per second of extension at 1080p 24 fps (125 at 1080p 30, 150 at 4K 24, 175 at 4K 30). Harvard's 1,000 monthly credits buy about ten seconds at 1080p. Everything marked "on your Mac" costs nothing.

## Working with Claude

**Timeline files.** File > Import brings in an EDL, an FCP 7 XML, an AAF, or an OTIO file as a sequence; File > Export writes them out. Claude can write any of these from a paper cut (see the [overview](README.md#paper-cut-from-a-transcript)), and OpenTimelineIO's Python library writes OTIO, EDL, and FCP 7 XML from the same list of sections. Premiere does not open Final Cut Pro's FCPXML; for that, go through Resolve or ask for FCP 7 XML instead.

**Captions.** Import an SRT with File > Import to get a caption track. In the Text panel's Captions tab, the menu exports captions as an SRT. Claude can fix names, line lengths, and timing in between.

**Transcripts.** Export the transcript from the Text panel and Claude can read it, pick sections, and give you timecodes or a timeline file.

**Silence cutting.** `auto-editor interview.mov --export premiere -o interview_cut.xml` writes an FCP 7 XML that Premiere imports (see [AI video tools](ai-tools.md)).

**Scripting.** Premiere's scripting and plugin system is **UXP** (JavaScript), documented at [developer.adobe.com/premiere-pro/uxp](https://developer.adobe.com/premiere-pro/uxp/). Adobe is moving off the older ExtendScript (`.jsx`) system, so new scripts should target UXP. Loading a UXP script or plugin needs Adobe's UXP Developer Tool. Claude can write UXP code against the API reference, but test it on a copy of your project.

**Proxies.** Premiere makes its own (right-click clips > Proxy > Create Proxies). If you make them with ffmpeg instead, keep the same aspect ratio and audio channels as the original so Premiere can attach them (tested with ffmpeg 9.0.2):

```bash
ffmpeg -i clip.mp4 -vf scale=-2:540 -c:v prores_ks -profile:v 0 -c:a pcm_s16le clip_proxy.mov
```

Example prompt:

```text
Here is interview_transcript.txt exported from Premiere, with timecodes.
Pick three moments where she describes her first loom, each under 20 seconds.
Write papercut.xml as FCP 7 XML (xmeml) referencing /Users/me/footage/interview.mov
at 29.97 fps, using OpenTimelineIO, and tell me how to import it.
```

## Export settings that work

In Export mode:

| Setting | Choose |
| --- | --- |
| Preset | **Match Source - Adaptive High Bitrate** for web and sharing |
| Format | H.264 (an .mp4) for sharing; QuickTime with Apple ProRes 422 for a master |
| Captions | Burn captions into video, or export a sidecar SRT |
| Range | Entire Source, or Source In/Out for just the marked part |

## Learn more

- [What's new in Adobe Premiere](https://helpx.adobe.com/premiere/desktop/whats-new/whats-new.html)
- [Premiere release notes](https://helpx.adobe.com/premiere/desktop/whats-new/release-notes.html)
- [Default keyboard shortcuts](https://helpx.adobe.com/premiere/desktop/get-started/keyboard-shortcuts/default-keyboard-shortcuts.html)
- [Generative credits FAQ](https://helpx.adobe.com/creative-cloud/apps/generative-ai/generative-credits-faq.html)
- [HUIT: Adobe Creative Cloud for Harvard](https://huit.harvard.edu/adobe-creative-cloud)
