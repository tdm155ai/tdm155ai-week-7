---
title: Video
description: The four video editors you can use on a Mac, the words they all share, and how Claude fits into an edit.
author: claude
order: 20
checked: 2026-10-20
---

Every video editor does the same job: you bring in clips, pick the parts worth keeping, put them in an order, and export one file. The apps differ in price, in how much they hide from you, and in which AI tools they include. The decisions are yours in all of them: what stays, what goes, what comes first.

## The four editors compared

| | [iMovie](imovie.md) | [Final Cut Pro](final-cut-pro.md) | [DaVinci Resolve](davinci-resolve.md) | [Premiere](premiere-pro.md) |
| --- | --- | --- | --- | --- |
| Maker | Apple | Apple | Blackmagic Design | Adobe |
| Price | Free | $299.99 once, or Apple Creator Studio ($2.99/month or $29.99/year for students) | Free; Studio is a one-time $295 | Free to Harvard students through HUIT's Adobe Creative Cloud license |
| Platforms | Mac, iPhone, iPad | Mac, iPad | Mac, Windows, Linux (plus iPad) | Mac, Windows |
| Version (Oct 2026) | 10.4.5 | 12.4 | 21.1 | 26.5 |
| Learning curve | An afternoon | A week to feel at home | Steep; the Cut page is the easy way in | Steep-ish; very well documented |
| AI features | Few: auto enhance, background noise reduction | Many, all on-device: Magnetic Mask, Transcript Search, Visual Search, captions, Beat Detection, Smooth Slo-Mo | Many, almost all Studio-only; Studio 21.1 also lets Claude control Resolve over MCP | Many: Text-Based Editing, Enhance Speech, Media Intelligence (on-device); Generative Extend (cloud, uses credits) |
| Best for | A first cut tonight | Fast editing on a Mac | Color, audio cleanup, and a free pro tool | Transcript-driven editing and the rest of Adobe's apps |

## Which to pick when

- **You have never edited and the project is due soon:** iMovie. You will outgrow it, and when you do, File > Send Movie To Final Cut Pro carries the edit across.
- **You edit on a Mac and want speed:** Final Cut Pro. Its magnetic timeline keeps clips from overlapping or leaving gaps, so cutting goes fast. Apple Creator Studio starts with a free month.
- **You want one free app that does editing, color, effects, and sound:** DaVinci Resolve. The free version is a full professional editor. Pay for Studio only when you need its AI tools, scripting, or the Claude connection.
- **You want to cut an interview by editing its transcript, or you already use Photoshop and After Effects:** Premiere. Harvard pays for it.
- **You want to edit by editing text and nothing else:** Descript (see [AI video tools](ai-tools.md)).

Any of these will carry your first project through the October 28 interview. Pick one and learn its shortcuts rather than switching between them.

## Words every editor shares

| Word | What it means |
| --- | --- |
| **Bin / browser / media pool / project panel** | Where your imported clips live before they go into the edit. iMovie and Final Cut Pro say *browser*, Resolve says *Media Pool*, Premiere says *Project panel*, and everyone says *bin* for a folder of clips. |
| **Timeline** | The horizontal track where you arrange clips in time. Final Cut Pro calls an edit a *project*; Premiere calls it a *sequence*; Resolve calls it a *timeline*. |
| **Clip** | One piece of media: a shot, a sound file, a still. A clip in the timeline points back to the file on disk; deleting it from the timeline doesn't delete the file. |
| **In and out points** | The start and end of the part of a clip you want. The keys are **I** and **O** in Final Cut Pro, Resolve, and Premiere; in iMovie you drag across the clip (or hold R and drag). |
| **J, K, L** | Play backward, stop, play forward. Tap L twice to go faster. Works in Final Cut Pro, Resolve, and Premiere. |
| **Playhead** | The vertical line that marks the current frame. |
| **Cut / split / blade / razor** | Splitting a clip in two at the playhead. Final Cut Pro says *Blade*, Premiere says *Razor* or *Add Edit*, Resolve says *Razor*, iMovie says *Split Clip*. |
| **Ripple** | An edit that moves everything after it. A ripple delete removes a clip and closes the gap. A plain delete leaves a gap. |
| **J cut and L cut** | A split edit, where sound and picture change at different moments. In a J cut you hear the next shot before you see it (the audio leads). In an L cut the picture changes and the audio from the previous shot carries on underneath. Interviews are cut with these all the time. |
| **A-roll and B-roll** | A-roll is the main material, usually someone talking. B-roll is the footage you lay over it: hands, the place, the thing being described. B-roll also hides the jump where you cut out a sentence. |
| **Rough cut / fine cut** | The rough cut is the whole story in order, too long, with ugly joins. The fine cut tightens every edit, fixes timing to the frame, and adds B-roll. Get the rough cut done before you polish anything. |
| **Paper cut** | Choosing your sections from a transcript, in writing, before you touch the timeline. Claude is good at helping with this (see below). |
| **Color correction vs. color grading** | Correction makes shots look right and match each other: white balance, exposure, contrast. Grading gives the whole piece a look. Correct first, grade second. |
| **Proxy** | A smaller, easier-to-play copy of a large file. You edit with proxies and export from the originals. |
| **Codec and container** | The container is the file type (.mov, .mp4). The codec is how the picture inside is compressed (H.264, HEVC, ProRes). ProRes is large and easy to edit; H.264 is small and good for delivery. |
| **Export / share / deliver / render** | Making the finished file. iMovie and Final Cut Pro say *Share*, Resolve has a *Deliver* page, Premiere has an *Export* mode. |

## A safe default for export

For anything going to the web, a class site, or Slack: **H.264 in an .mp4, the same frame size and frame rate as your footage (usually 1920x1080 or 3840x2160, at 24, 30, or 60 fps), with AAC audio.** Each sheet says where that setting lives. Keep a ProRes master as well if you might re-edit or grade later.

## Working with Claude on an edit

Only Resolve Studio 21.1 has a built-in way for Claude to operate the app directly (see its sheet). What Claude can do for all four is read and write the files around the edit: transcripts, caption files, and timeline files that the editor imports.

### Paper cut from a transcript

1. Get a transcript with timestamps. Premiere, Resolve Studio, and Final Cut Pro can all make one, or use Whisper (see the [audio AI tools](../audio/ai-tools.md)). An SRT file works well.
2. Ask Claude to pick the sections. Be specific about length and about what the piece is for.
3. Ask for the result as a file the editor imports, or as a rough cut ffmpeg can render.
4. Import it, watch it, and then do the real editing yourself.

Example prompt:

```text
Here is interview.srt, from interview.mov (1920x1080, 30 fps; check with ffprobe).
Pick the four answers that best explain why she started building looms, about
90 seconds total, in an order that builds. List them as in/out timecodes with the
first few words of each. Then write papercut.fcpxml (FCPXML 1.11) that puts them
in a project called "Paper cut v1".
```

Before Claude writes timing, get the real frame rate and size:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate,width,height,duration -of default=noprint_wrappers=1 interview.mov
```

Which file to ask for:

| File | Opens in | Notes |
| --- | --- | --- |
| **FCPXML** (.fcpxml) | Final Cut Pro, Resolve | Apple's format. Times are in seconds as fractions (`3s`, `1001/30000s`). Spec: [FCPXML Reference](https://developer.apple.com/documentation/professional-video-applications/fcpxml-reference). |
| **FCP 7 XML** (.xml, `<xmeml>`) | Premiere, Resolve | The older Final Cut Pro 7 format. Premiere imports it with File > Import. |
| **EDL** (CMX 3600, .edl) | Premiere, Resolve | A plain-text list, one event per line: event number, reel, track, transition, source in, source out, record in, record out. Cuts only, no effects. Final Cut Pro doesn't import EDLs. |
| **OTIO** (.otio) | Premiere 26 and later, Resolve | OpenTimelineIO, an open JSON format from the Academy Software Foundation. Its Python library converts to EDL and FCP 7 XML. [Docs](https://opentimelineio.readthedocs.io/). |
| **ffmpeg concat list** (.txt) | ffmpeg | Renders a rough cut straight to a video file, no editor needed. |
| **SRT** (.srt) | All four, as captions | Numbered cues with `00:00:05,000 --> 00:00:08,000` times. |

A minimal FCPXML paper cut, two sections from one file, the second section placed first. This validates against the FCPXML 1.11 DTD that ships inside Final Cut Pro 12.4:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.11">
  <resources>
    <format id="r1" name="FFVideoFormat1080p30" frameDuration="1/30s" width="1920" height="1080"/>
    <asset id="r2" name="talk" start="0s" duration="20s" hasVideo="1" hasAudio="1" format="r1" audioSources="1" audioChannels="1">
      <media-rep kind="original-media" src="file:///Users/you/project/talk.mp4"/>
    </asset>
  </resources>
  <library>
    <event name="Paper cut">
      <project name="Paper cut v1">
        <sequence format="r1">
          <spine>
            <asset-clip name="the answer" ref="r2" offset="0s" start="10s" duration="3s"/>
            <asset-clip name="the setup" ref="r2" offset="3s" start="0s" duration="3s"/>
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
```

In each `asset-clip`, `start` is where the section begins in the source file, `duration` is how long it runs, and `offset` is where it lands in the timeline. The `src` must be an absolute `file://` path to the real file.

The same paper cut as an ffmpeg concat list, rendered to a file. The list is frame-accurate when the source is an all-intra codec like ProRes; with camera H.264, make a ProRes copy first (`-c:v prores_ks -profile:v 0`) or the cuts can start up to a few seconds early.

```text
ffconcat version 1.0
file 'talk_prores.mov'
inpoint 10.0
outpoint 13.0
file 'talk_prores.mov'
inpoint 0.0
outpoint 3.0
```

```bash
ffmpeg -f concat -safe 0 -i papercut.txt -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac papercut.mp4
```

To get an EDL, an FCP 7 XML, and an OTIO file from the same list of sections, ask Claude to use OpenTimelineIO. It runs without installing anything permanent through `uv`:

```bash
uv run --no-project --with opentimelineio --with otio-cmx3600-adapter --with otio-fcp-adapter python papercut_otio.py
```

where `papercut_otio.py` builds a `Timeline` with one `Track`, appends a `Clip` for each section (an `ExternalReference` to the file and a `source_range`), and calls `otio.adapters.write_to_file(timeline, "papercut.edl")`, then the same with `.xml` and `.otio`. Ask Claude to write the script for your sections and frame rate.

### Other things Claude can do around an edit

- Make proxies, convert phone footage, pull audio out, or burn in captions with [ffmpeg](../cli/ffmpeg.md).
- Cut the silences out of a talking-head recording with `auto-editor`, which writes a timeline for Final Cut Pro, Resolve, or Premiere (see [AI video tools](ai-tools.md)).
- Turn a transcript into a shot list of B-roll you still need.
- Clean up an SRT: fix names, split long lines, shift all times by an offset.

## The sheets

- [iMovie](imovie.md): free, simple, on every Mac.
- [Final Cut Pro](final-cut-pro.md): Apple's professional editor.
- [DaVinci Resolve](davinci-resolve.md): free professional editor, colorist's tool, and the one Claude can drive.
- [Premiere](premiere-pro.md): Adobe's editor, free to Harvard students.
- [AI video tools](ai-tools.md): Descript, CapCut, Runway, Adobe Firefly, and `auto-editor`.
- On the command line: [ffmpeg](../cli/ffmpeg.md).

## A habit worth keeping

Keep your camera originals in one folder that you never edit or rename, and keep the project file and exports in another. Every editor here links to files where they sit on disk. Move or rename the originals and the edit loses them.
