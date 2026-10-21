---
title: GarageBand
description: Apple's free music and audio app for the Mac, good for cutting interviews, laying in music, and exporting a finished mix.
author: claude
order: 10
checked: 2026-10-20
---

## At a glance

| | |
| --- | --- |
| Maker | Apple |
| Platforms | Mac (also iPad and iPhone, as separate apps) |
| Price | Free on the Mac App Store; usually already installed |
| Current version | 10.4.15 per Apple's release notes (the Mac App Store listing still showed 10.4.14 on 2026-10-20); needs macOS 15.6 or later |
| Project format | `.band` project, saved by default to `~/Music/GarageBand` |
| Exports | AAC, MP3, AIFF, WAVE |

## What it's for

GarageBand is a multitrack recorder and editor. It was built for making music, but it works well for spoken audio too: drop in an interview, cut it into pieces, move the pieces around, add a music bed, set levels, and export. Pick it when you want something free and simple. Move to [Logic Pro](logic-pro.md) when you need loudness metering, serious cleanup, stem separation, or video in the timeline; your GarageBand project opens there directly.

## The tour

| Area | What it is | Show/hide |
| --- | --- | --- |
| **Control bar** | Across the top: play, record, cycle, the LCD (time and tempo), the metronome, and buttons that open the other areas | |
| **Tracks area** | The timeline. Track headers on the left (name, mute, solo, volume), the ruler on top, and regions (the blocks of audio or MIDI) in the lanes | |
| **Library** | Instrument and patch sounds for the selected track | Y |
| **Smart Controls** | Knobs for the selected track's sound and effects (EQ, compression, and so on) | B |
| **Editors** | A close-up of the selected region: the Audio Editor for recordings, the Piano Roll for MIDI | E |
| **Loop Browser** | Apple Loops: short music and drum pieces you can drag in as a bed | O |
| **Master track** | The track for the whole mix, where you draw the final fade-out | Shift-Command-M |
| **Automation** | Lines on a track for volume and pan that change over time (how you duck music under a voice) | A |

## The basic edit

1. **New project.** File > New (Command-N), choose Empty Project, pick the audio track type (the microphone), click Create.
2. **Bring the audio in.** Drag your recording from Finder into the empty space below the tracks. GarageBand takes AIFF, CAF, WAV, AAC/M4A, Apple Lossless, and MP3. Each file becomes a region on an audio track. If your project tempo doesn't matter (it usually doesn't for speech), ignore the bars and beats in the ruler.
3. **Listen through once.** Space bar to play and stop. Return jumps back to the start. Comma and Period move back and forward a bar.
4. **Cut.** Put the playhead where a cut should go and press Command-T to split the region there. Select the piece you don't want and press Delete. Drag the remaining pieces together.
5. **Trim.** Drag the left or right edge of a region to shorten it. Zoom in with Command-Right Arrow to find the gap between words.
6. **Music bed.** Drag a music file, or an Apple Loop from the Loop Browser (O), onto a new track below the voice. Press A to show automation, choose Volume, and click on the line to add points: lower the music while someone talks, bring it up in the gaps.
7. **Balance.** Use each track's volume slider in the track header so the voice is clear over the music. Mute (M) and solo (S) a track to check it on its own.
8. **Fade out the end.** Show the master track (Shift-Command-M) and draw a volume fade at the end.
9. **Export.** Share > Export Song to Disk. Choose the format and quality and click Export. The export runs from the start of the project to the end of the last region.

## Shortcuts to learn first

From Apple's [GarageBand main window shortcuts](https://support.apple.com/guide/garageband/gbnd58362a62/mac).

| Action | Keys |
| --- | --- |
| Play / stop | Space |
| Go to beginning | Return |
| Back / forward one bar | , / . |
| Record | R |
| Split regions at playhead | Command-T |
| Join regions | Command-J |
| Undo / redo | Command-Z / Shift-Command-Z |
| Zoom in / out (horizontal) | Command-Right Arrow / Command-Left Arrow |
| Snap to Grid on/off | Command-G |
| Cycle on/off | C |
| Mute / solo track | M / S |
| Show automation | A |
| New audio track | Option-Command-A |
| Show Editors / Library / Smart Controls / Loop Browser | E / Y / B / O |
| Show master track | Shift-Command-M |
| Metronome on/off | K |

Turn Snap to Grid off (Command-G) when cutting speech. The grid follows musical beats, and words don't land on them.

## AI in the app

GarageBand has very little. Two older "smart" features, both running on your Mac:

- **Drummer**: a virtual session drummer. You pick a drummer and a style, and it plays a part you shape in the Drummer Editor.
- **Pitch Correction**: a slider in the Audio Editor (with the Track button selected) that pulls a sung part toward the nearest note; Limit to Key keeps it to notes in the project key.

The newer AI tools in Apple's audio apps (Session Players, Stem Splitter, Mastering Assistant, ChromaGlow, Chord ID) are in [Logic Pro](logic-pro.md), not GarageBand. Apple's GarageBand pages and release notes list none of them as of 10.4.15. For AI cleanup of a bad recording, clean the file first with one of the [AI audio tools](ai-tools.md) and then bring the cleaned file into GarageBand.

## Working with Claude

GarageBand has no scripting interface and its project file isn't meant to be edited by hand, so Claude works on the files that go in and come out.

**Before: a paper edit.** Have Claude transcribe the interview on your Mac with whisper.cpp, then use the transcript to decide what stays. You get timestamps you can find in GarageBand's ruler.

> Transcribe `interview.m4a` with whisper-cli and save an SRT. Then list the three strongest answers about how she got started, with start and end times, so I can cut them in GarageBand.

**Before: get files into a friendly format.** Phone recordings and video files can be converted to WAV first (tested with ffmpeg 7.1.1):

```sh
ffmpeg -i interview.m4a -ar 48000 -c:a pcm_s24le interview.wav
```

**Before: MIDI.** Claude can write a short Python script that produces a `.mid` file (a drum pattern, a bass line, a chord progression). Drag the `.mid` file into the Tracks area and GarageBand makes a software instrument track from it.

**After: finishing.** GarageBand has no loudness meter. Export a WAV, then let ffmpeg measure and set the loudness (see Export settings below). For batch work across many files, see the [SoX](../cli/sox.md) and [ffmpeg](../cli/ffmpeg.md) sheets.

## Export settings that work

- **For your own archive or for further editing:** Share > Export Song to Disk, WAVE, the highest quality offered.
- **For listening or sharing:** export WAVE, then make the MP3 with loudness set to -16 LUFS, a common target for spoken audio. This one command does both (tested with ffmpeg 7.1.1; it measured -16.2 LUFS afterward):

```sh
ffmpeg -i mix.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 44100 -c:a libmp3lame -b:a 128k episode.mp3
```

- If you skip ffmpeg, GarageBand's own MP3 or AAC export is fine for a quick share.

## Learn more

- [GarageBand User Guide for Mac](https://support.apple.com/guide/garageband/welcome/mac)
- [Main window keyboard shortcuts](https://support.apple.com/guide/garageband/gbnd58362a62/mac)
- [Export songs to disk](https://support.apple.com/guide/garageband/gbnd7cbf5ed9/mac)
- [GarageBand for macOS release notes](https://support.apple.com/en-us/109515)
