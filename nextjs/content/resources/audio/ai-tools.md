---
title: AI audio tools
description: The AI-first tools for cleaning, cutting, separating, and transcribing audio, beyond GarageBand and Logic.
author: claude
order: 30
checked: 2026-10-20
---

These tools do one or two jobs very well: rescue a bad recording, let you edit speech as text, split a voice from music, or give you a transcript. Most people use one of them alongside GarageBand or Logic: clean or cut here, then mix and finish there.

## At a glance

Prices are from each vendor's own page on 2026-10-20 and change often.

| Tool | Best for | Runs | Cost |
| --- | --- | --- | --- |
| **Adobe Podcast** (Enhance Speech) | Making a rough voice recording sound like a studio one, in one step | Web (Adobe's servers) | Free: files up to 30 min and 500 MB, 1 hour a day. Paid tier comes with Adobe's Firefly Pro plan: 4 hours a day, files up to 2 hours and 1 GB |
| **Descript** | Editing speech by editing the transcript; Studio Sound cleanup | Mac app and web; AI features need internet | Free: 1 media hour a month, 100 AI credits one-time, Studio Sound and Underlord limited. Hobbyist $24/month ($16/month yearly). Creator $35/month ($24 yearly). Education rates by request |
| **ElevenLabs** | Voice Isolator, text to speech, dubbing into other languages | Web and API (ElevenLabs' servers) | Free: 10,000 credits a month, no commercial license. Starter $6/month, Creator $22/month |
| **iZotope RX 12** | Detailed repair: dialogue isolation, de-noise, de-reverb, de-click, spectral editing | Mac app and plug-ins (works inside Logic), on your Mac | Elements $99, Standard $399, Advanced $1,399. Dialogue Isolate is in Standard and Advanced |
| **whisper.cpp** (OpenAI Whisper) | Transcripts and captions (TXT, SRT, VTT) | On your Mac, command line | Free, open source |
| **Demucs** | Splitting a song into vocals, drums, bass, other | On your Mac, command line | Free, open source |

Already have Logic Pro? Its **Stem Splitter** does what Demucs does, inside the app. See [Logic Pro](logic-pro.md).

## Adobe Podcast: Enhance Speech

Upload a voice recording at [podcast.adobe.com/enhance](https://podcast.adobe.com/enhance) and download a cleaned version. It removes room echo and background noise and evens out the tone, so a phone or laptop recording sounds close-miked. Adobe's page also lists controls for how much speech, music, and ambience to keep; check which ones your plan includes. Push it too far and voices can sound processed, so compare against the original. Harvard students get Adobe Creative Cloud through [HUIT](https://huit.harvard.edu/adobe-creative-cloud); Adobe's page doesn't say whether that account covers the paid Podcast tier, so sign in with it and check. Enhance Speech is also built into Premiere Pro.

## Descript

Descript transcribes your recording and shows it as a document. Delete a sentence in the text and it's cut from the audio. It can find and remove filler words ("um," "uh") and long pauses, and **Studio Sound** (Properties > Audio Effects, with an Intensity slider) cleans up noise and echo. **Underlord** is its AI assistant for edit tasks. Descript needs an internet connection for Studio Sound. When the rough cut is done, Descript exports the timeline to other apps: Pro Tools/Logic (AAF), Final Cut Pro (FCPXML), Premiere (XML), DaVinci Resolve (XML), Audition (SESX), and Reaper (EDL). That makes it a good place to do a talky rough cut before you finish in Logic or a video editor.

## ElevenLabs

Three tools matter for editing. **Voice Isolator** strips background noise and music from speech (files up to 500 MB and an hour; 10 free minutes on the free plan, then credits). **Text to speech** generates narration from a script. **Dubbing** translates a recording into another language in a synthetic version of the original voice. Everything runs on ElevenLabs' servers, and there is an API, so Claude can script it if you give it a key. Only clone or dub a person's voice with their permission, and say in your credits when a voice is synthetic.

## iZotope RX 12

RX is the repair tool film and podcast editors use. It shows audio as a spectrogram, so you can see a cough or a phone buzz and paint it out. **Repair Assistant** (all editions) listens and suggests a chain of fixes. **Dialogue Isolate** (Standard and Advanced) separates speech from background noise. **Voice De-noise** is in every edition. RX runs on your Mac as its own app and as plug-ins you can use inside Logic. Elements, at $99, is the sensible place to start.

## Whisper (whisper.cpp)

OpenAI's Whisper model turns speech into text with timestamps, and whisper.cpp runs it fast on Apple silicon without Python. Install it with Homebrew and download a model once:

```sh
brew install whisper.cpp
curl -L -o ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
```

`base.en` is English-only and about 150 MB; `small`, `medium`, and `large-v3` models are more accurate and slower, and the ones without `.en` handle other languages. whisper-cli reads WAV, MP3, FLAC, and OGG; give it 16 kHz mono WAV to be safe. Tested with whisper.cpp 1.9.5 and ffmpeg 7.1.1:

```sh
ffmpeg -i interview.m4a -ar 16000 -ac 1 -c:a pcm_s16le interview-16k.wav
whisper-cli -m ggml-base.en.bin -f interview-16k.wav -osrt -of interview
```

That writes `interview.srt`, captions with start and end times. Use `-otxt` for plain text or `-ovtt` for web captions.

## Demucs

Demucs is Meta's open-source source-separation model. It splits a mix into vocals, drums, bass, and other, or just vocals and everything else. The original `facebookresearch/demucs` repository is archived; the package on PyPI (4.1.0) is maintained by its author at `adefossez/demucs`. With [uv](https://docs.astral.sh/uv/) installed (`brew install uv`), you can run it without setting anything up. Tested on this Mac with Demucs 4.1.0 under Python 3.11; the first run downloads PyTorch and the model, which takes a few minutes. Demucs 4.1.0 leaves numpy out of its dependencies, so add it:

```sh
uvx --python 3.11 --with numpy demucs --two-stems=vocals -o stems song.wav
```

That writes `stems/htdemucs/song/vocals.wav` and `no_vocals.wav`. Leave off `--two-stems=vocals` to get all four stems.

## Working with Claude

Claude is good at the plumbing around these tools: converting files before upload, transcribing, splitting stems, renaming, and checking loudness after. Whisper and Demucs run on your Mac, so Claude can run them for you in the terminal. Some prompts:

> Transcribe every `.m4a` in `raw/` with whisper-cli using the base.en model. Save an SRT and a TXT for each next to the original.

> Read `interview.srt` and give me a paper edit: the five best moments for a two-minute piece, in order, with start and end times.

> Split `song.wav` with Demucs into vocals and no_vocals, then make a version of the music bed 12 dB quieter for under narration.

For SoX and ffmpeg commands (trimming, fades, format conversion, loudness), see [SoX](../cli/sox.md) and [ffmpeg](../cli/ffmpeg.md); for more command-line tools, including auto-editor for cutting silences, see [more tools](../cli/more-tools.md).

## Learn more

- [Adobe Podcast Enhance Speech](https://podcast.adobe.com/enhance) and [plans](https://podcast.adobe.com/en/plans)
- [Descript help: Studio Sound](https://help.descript.com/effects-animations-transitions/studio-sound) and [timeline exports](https://help.descript.com/export-and-share/timeline-exports)
- [ElevenLabs Voice Isolator](https://elevenlabs.io/voice-isolator) and [pricing](https://elevenlabs.io/pricing)
- [iZotope RX](https://www.izotope.com/collections/rx)
- [whisper.cpp](https://github.com/ggml-org/whisper.cpp) and [Demucs](https://github.com/adefossez/demucs)
