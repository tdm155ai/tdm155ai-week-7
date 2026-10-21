---
title: Audio
description: Editing sound for your projects, and which app or tool to reach for.
author: claude
order: 10
checked: 2026-10-20
---

Editing audio, for this course, mostly means four jobs:

- **Cutting dialogue.** Removing the false starts, the long pauses, the "so, um," the question you asked twice. Choosing which take of a line stays. This is where most of the judgment lives.
- **Cleaning noise.** Taking down room hum, air conditioning, traffic, echo, and the hiss of a laptop mic, without making the voice sound underwater.
- **Levels and loudness.** Making every voice sit at the same level, making sure nothing clips, and finishing at a loudness that matches where it will play (-16 LUFS is the usual target for a podcast or spoken piece; -14 LUFS is a common target for music on streaming services).
- **Music beds.** Laying music under a voice, ducking it when someone talks, and fading it in and out cleanly.

## Which one to pick

| You want to | Reach for |
| --- | --- |
| Cut an interview, add a music bed, export an MP3, for free | [GarageBand](garageband.md) |
| All of that, plus serious cleanup, loudness metering, mastering, stem separation, or scoring to picture | [Logic Pro](logic-pro.md) |
| Fix a bad recording fast (noise, echo, laptop mic) | Adobe Podcast Enhance Speech, Descript Studio Sound, or ElevenLabs Voice Isolator ([AI audio tools](ai-tools.md)) |
| Edit a conversation by editing its transcript | Descript ([AI audio tools](ai-tools.md)) |
| Pull a voice or a drum part out of a mixed recording | Stem Splitter in Logic Pro, or Demucs on the command line |
| Get a transcript or captions on your own machine | whisper.cpp ([AI audio tools](ai-tools.md), [more tools](../cli/more-tools.md)) |
| Batch-convert, trim, fade, or loudness-normalize many files | [SoX](../cli/sox.md) and [ffmpeg](../cli/ffmpeg.md), with Claude writing the commands |

GarageBand projects open in Logic Pro, so starting in GarageBand costs you nothing if you move up later.

## The sheets

- [GarageBand](garageband.md): Apple's free music and audio app on every Mac.
- [Logic Pro](logic-pro.md): Apple's professional version of the same app, with the AI tools (Session Players, Stem Splitter, Mastering Assistant, Chord ID).
- [AI audio tools](ai-tools.md): Adobe Podcast, Descript, ElevenLabs, iZotope RX, and the open-source tools Claude can run for you (Whisper, Demucs).
- On the command line: [SoX](../cli/sox.md) and [ffmpeg](../cli/ffmpeg.md).

## A habit worth keeping

Keep the raw recording untouched in its own folder, and do every edit on a copy. Cleanup tools, AI or not, can remove things you wanted (breaths, room tone, a laugh in the background). Listen on headphones and on laptop speakers before you call it done.
