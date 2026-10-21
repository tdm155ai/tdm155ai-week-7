---
title: Logic Pro
description: Apple's professional audio app for the Mac, for when you need real cleanup, loudness, mastering, stems, or sound to picture.
author: claude
order: 20
checked: 2026-10-20
---

## At a glance

| | |
| --- | --- |
| Maker | Apple |
| Platforms | Mac (a separate Logic Pro for iPad also exists) |
| Price | $199.99 one-time on the Mac App Store, or included in **Apple Creator Studio** ($12.99/month or $129/year; students and educators $2.99/month or $29.99/year; one month free). Creator Studio also includes Final Cut Pro and Pixelmator Pro |
| Current version | 12.4 (September 29, 2026), needs macOS 15.6 or later. Stem Splitter and ChromaGlow need an M1 or later Mac |
| Project format | `.logicx` project. Bounces go to `~/Music/Logic/Bounces` by default |
| Opens | GarageBand projects (Mac, iPad, iPhone), audio files, MIDI files, Final Cut Pro XML, AAF, movies |

The old one-time Pro Apps Bundle for Education was pulled from standalone sale when Creator Studio launched in January 2026; reports say it is still offered when you buy a new Mac from Apple's education store.

## What it's for

Logic Pro is GarageBand's big sibling: the same look and many of the same shortcuts, with a full mixer, many more plug-ins, precise editing, loudness meters, and Apple's AI tools. Pick it over GarageBand when the audio has problems to fix, when you need to hit a loudness target, when you want to pull a voice or instrument out of a mixed recording, or when you are cutting sound against a video. Pick it over a video editor's audio tools when the sound needs more care than the picture.

**GarageBand projects open in Logic.** In Logic, choose File > Open (Command-O) and pick the `.band` project; there's nothing to convert. Logic builds matching tracks with the same tempo and key. Once you save it in Logic it becomes a Logic project, and it won't open in GarageBand on the Mac again.

## The tour

| Area | What it is | Show/hide |
| --- | --- | --- |
| **Control bar** | Transport (play, record, cycle), the LCD, and buttons that open the other areas | |
| **Tracks area** | The timeline: track headers, the ruler, and regions | |
| **Inspector** | Settings for the selected region and track, and the selected track's channel strip next to the Stereo Out | button in the control bar |
| **Library** | Patches and presets for the selected track | Y |
| **Smart Controls** | Simplified knobs for the selected track's sound | B |
| **Mixer** | Every channel strip side by side: volume, pan, plug-in slots, sends | X |
| **Editors** | The Audio Track Editor, Piano Roll, Step Sequencer, and others for the selected region | E |
| **List Editors** | Event, marker, tempo, and signature lists | D |
| **Loop Browser** | Apple Loops | O |
| **Browsers** | Project audio, media, and all files on disk | F |
| **Automation** | Volume, pan, and plug-in changes over time | A |

## The basic edit (an interview with a music bed)

1. **New project.** Press Shift-Command-N (New Empty Project), choose an audio track, click Create.
2. **Import.** Drag your recording into the Tracks area, or use Import Audio File (Shift-Command-I). Turn Snap to Grid off (Command-G) for speech.
3. **Cut.** Space to play, Return to go to the beginning. Put the playhead on a cut and press Command-T to split. Delete what you don't want. Zoom into a single track with Option-Command-Down Arrow to find the gaps between words.
4. **Clean.** In the track's channel strip (Inspector or Mixer), click an empty Audio FX slot and add, in this order: **Channel EQ** (roll off the low rumble below about 80 Hz), **Noise Gate** if there's hiss between phrases, **DeEsser 2** for harsh "s" sounds, and **Compressor** to even out loud and quiet words. Start with the presets and adjust by ear.
5. **Music bed.** Put the music on its own track. Press A for automation, choose Volume, and draw the music down under the voice and up in the gaps.
6. **Loudness.** On the Stereo Out channel strip add **Mastering Assistant**, which analyzes the mix and sets loudness, EQ, and width (details below). Or, for speech, add the **Loudness Meter** plug-in and watch the Integrated (I) number while the whole piece plays; aim for about -16 LUFS.
7. **Bounce.** File > Bounce > Project or Section (Command-B). Pick one or more destinations (PCM for WAV/AIFF, MP3, M4A), set Start and End, turn on Include Audio Tail if reverb rings past the end (leave it off with mastering plug-ins), and click Bounce.

## Shortcuts to learn first

From Apple's [Global Commands](https://support.apple.com/guide/logicpro/global-commands-lgcp02bf31b6/mac) and [Main Window Tracks](https://support.apple.com/guide/logicpro/main-window-tracks-and-various-editors-lgcpe8314fe2/mac) key command tables.

| Action | Keys |
| --- | --- |
| Play / stop | Space |
| Go to beginning | Return |
| Rewind / forward | , / . |
| Record | R |
| Split regions at playhead | Command-T |
| Join regions | Command-J |
| Snap to Grid on/off | Command-G |
| Cycle on/off | C |
| Mute / solo | M / S |
| Show automation | A |
| Show Mixer / Editor / Library / Smart Controls | X / E / Y / B |
| Show Loop Browser / Browsers | O / F |
| Zoom one track in / out | Option-Command-Down Arrow / Option-Command-Up Arrow |
| Normalize region gain | Control-Option-G |
| Bounce project | Command-B |
| Bounce region in place | Control-B |
| Export all tracks as audio files | Shift-Command-E |
| Open a movie | Option-Command-O |
| Key Commands window (search any command) | Option-K |

Logic has hundreds of commands. Option-K opens the Key Commands window, where you can search for any of them and assign your own keys.

## AI in the app

All of these run on your Mac. None uses cloud credits. None is in GarageBand.

| Feature | What it does | Since |
| --- | --- | --- |
| **Session Players** | Virtual players that perform parts that follow your song's chords: Drummer, Bass Player, and Keyboard Player. Logic 12 added **Synth Player** styles for keyboard (Modulated Pad, Rhythmic Chords) and bass (Pump Bass, 808 Bass, Sequenced Bass) | 11.0; Synth Player 12.0 |
| **Chord ID** | Drag an audio or MIDI region onto the Chord track and Logic works out its chords, which Session Players then follow. Improved in 12.3 | 12.0 |
| **Stem Splitter** | Splits a mixed recording into vocals, drums, bass, guitar, piano, and other. Control-click the audio region, choose Processing > Stem Splitter, pick stems, click Apply. The stems land in a summing stack under the original, which is muted. M1 or later | 11.0 (guitar and piano added later) |
| **Mastering Assistant** | A plug-in on the Stereo Out that analyzes the whole mix (or the cycle area) and sets EQ, dynamics, loudness, and width. Four characters: Clean, Valve, Punch, Transparent. Has a Loudness knob, a LUFS meter, and a True Peak meter | 10.8 |
| **ChromaGlow** | Saturation that models analog gear for warmth. Models: Retro Tube, Modern Tube, Magnetic, Squeeze, Analog Preamp. M1 or later | 11.0 |
| **Pitch Correction, Flex Pitch, Smart Tempo** | Older machine-listening tools: tune a vocal, edit the pitch of single notes, and match audio to the project tempo (or the project to a free-tempo recording) | earlier |

Stem Splitter is useful for editing too: it can pull a voice away from music or room noise in a recording you didn't make. Expect some artifacts, and listen to each stem soloed.

## Working with Claude

**Final Cut Pro XML and AAF.** Logic reads and writes Final Cut Pro XML (File > Export > Project to Final Cut Pro XML) and AAF, the formats for passing an edit between video and audio apps. Volume and pan automation carry over in FCPXML; software instrument tracks are bounced to audio, and MIDI tracks are dropped. Claude can read an exported `.fcpxml` (it is plain XML) and tell you what's in the timeline, or check timings against a transcript.

**Scripter.** Logic's Scripter MIDI plug-in runs JavaScript that processes or generates MIDI in real time. Claude can write Scripter scripts: an arpeggiator, a random humanizer, a rule that keeps notes inside a scale.

> Write a Logic Pro Scripter script that takes incoming MIDI notes and snaps each one to the nearest note in D minor pentatonic. Explain where to paste it.

**MIDI files.** Claude can write a short Python script that produces a `.mid` file (a drum pattern, a progression). Drag it into the Tracks area.

**Stems out, batch work after.** Export All Tracks as Audio Files (Shift-Command-E) gives you one file per track. Claude can then batch-rename, convert, or check them with [SoX](../cli/sox.md) or [ffmpeg](../cli/ffmpeg.md).

**Check a bounce.** Have Claude measure the loudness and true peak of your bounce (tested with ffmpeg 7.1.1):

```sh
ffmpeg -nostats -i bounce.wav -af ebur128=peak=true -f null -
```

The summary at the end shows Integrated loudness (I, in LUFS) and True peak. For a spoken piece, about -16 LUFS with the peak below -1 dBTP is a safe place to land.

**Paper edit first.** For a long interview, have Claude transcribe it with whisper.cpp and pick the passages with timestamps before you open Logic (see [AI audio tools](ai-tools.md)).

## Export settings that work

| Use | Bounce destination | Settings |
| --- | --- | --- |
| Master copy, or audio for a video edit | PCM | WAVE, 48 kHz, 24-bit, Normalize: Overload Protection Only |
| Podcast or shared listening copy | MP3 | 128–192 kbps stereo, after checking loudness is about -16 LUFS |
| Music for streaming or sharing | PCM, then the service's own upload | 44.1 kHz or 48 kHz, 24-bit; Mastering Assistant's Loudness knob sits near -14 LUFS at its center |

Use 48 kHz when the audio is going into a video project; video apps work at 48 kHz.

## Learn more

- [Logic Pro User Guide for Mac](https://support.apple.com/guide/logicpro/welcome/mac)
- [What's new in Logic Pro for Mac](https://support.apple.com/guide/logicpro/whats-new-in-logic-pro-lgcp4a62a494/mac)
- [Stem Splitter](https://support.apple.com/guide/logicpro/extract-vocal-instrumental-stems-stem-lgcp61bae908/mac) and [Mastering Assistant](https://support.apple.com/guide/logicpro/mastering-assistant-overview-lgcp7f94da0b/mac)
- [GarageBand projects in Logic Pro](https://support.apple.com/guide/logicpro/garageband-projects-lgcpa8854ca7/mac)
- [Logic Pro release notes](https://support.apple.com/en-us/109503)
