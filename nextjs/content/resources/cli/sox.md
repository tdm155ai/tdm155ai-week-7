---
title: SoX
description: The classic command-line audio tool. Inspect, trim, fade, normalize, join, mix, remove silence, reduce noise, and draw spectrograms.
author: claude
order: 30
checked: 2026-10-20
---

## At a glance

| | |
|---|---|
| What | SoX ("Sound eXchange") reads audio, runs it through a chain of effects, and writes it out. `soxi` reports what's in a file. `play` and `rec` play and record. |
| Install | `brew install sox` |
| Tested with | SoX 14.4.2 (Homebrew `sox 14.4.2_6`, Apple Silicon), 2026-10-20. `sox --version` on this build prints `SoX v` with no number; `brew list --versions sox` shows it. |
| Reads | WAV, AIFF, FLAC, MP3, Ogg Vorbis, Opus, CAF and more. **Not M4A/AAC** (see below). |
| Docs | `man sox` in Terminal, or the [SoX manual online](https://manpages.debian.org/stable/sox/sox.1.en.html) |

## SoX or ffmpeg?

SoX is the classic audio command-line tool. ffmpeg can do most of the same jobs (trim, convert, fade, normalize, mix; see [Audio with ffmpeg](ffmpeg.md#audio-with-ffmpeg)), so if you already have ffmpeg you may not need SoX. Use SoX when you want:

- **its effects chain:** effects written one after another, in plain words, in the order they run;
- **noise reduction** from a sample of room noise (`noiseprof` / `noisered`);
- **spectrograms** as PNG images, which you and Claude can look at to find hum, hiss, clipping or silence.

The SoX that Homebrew installs is version 14.4.2, which dates from 2015. It still works well. A maintained fork, `sox_ng` (14.8.1 in Homebrew), installs the same commands; the two conflict, so you can have only one. We tested only `sox`.

## The shape of a command

```sh
sox [input options] input.wav [output options] output.wav [effect args] [effect args] ...
```

Effects run left to right:

```sh
sox voice.wav output/voice-clean.wav highpass 80 norm -1 fade t 0.2 -0 0.2
```

reads `voice.wav`, cuts rumble below 80 Hz, normalizes to -1 dBFS, then fades in and out over 0.2 s. Use `-n` as the output to analyze without writing a file.

## Formats: check what your build reads

```sh
sox -h | grep "AUDIO FILE FORMATS"
```

On the tested build, the list includes `mp3`, `flac`, `ogg`, `opus`, `wav`, `aiff` and `caf`, and does **not** include `m4a`. In practice `sox in.mp3 out.wav` worked, and `sox in.m4a out.wav` failed with `no handler for file extension 'm4a'`. Phone voice memos and many video soundtracks are M4A/AAC, so convert with ffmpeg first:

```sh
ffmpeg -i memo.m4a -c:a pcm_s16le output/memo.wav
```

## Inspect with soxi

```sh
soxi voice.wav           # channels, sample rate, bit depth, duration, encoding
soxi -D voice.wav        # duration in seconds only: 8.000000
soxi -r voice.wav        # sample rate only: 48000
sox voice.wav -n stats   # levels: peak, RMS, DC offset, clipping
```

`soxi -D` is handy in scripts and for Claude to check a result.

## Trim

```sh
sox voice.wav output/trim.wav trim 1 2.5      # start at 1 s, keep 2.5 s
sox voice.wav output/trim2.wav trim 1 '=4'    # start at 1 s, end at 4 s
```

Quote `'=4'`: in zsh (the Mac's default shell) a bare `=4` is read as a command lookup and fails with `4 not found`.

**Trim silence off both ends:**

```sh
sox padded.wav output/ends-trimmed.wav silence 1 0.1 1% reverse silence 1 0.1 1% reverse
```

This removes leading silence, flips the audio, removes leading silence again (the old ending), and flips it back. On the test file, 11.7 s became 7.9 s.

## Fade

```sh
sox voice.wav output/fade.wav fade t 0.5 -0 0.5
```

Half-second linear (`t`) fade in, and a half-second fade out ending at the end of the file (`-0`). The default curve (no letter) is logarithmic; `q` and `h` are sine curves.

## Normalize and gain

```sh
sox voice.wav output/norm.wav norm -1     # peak at -1 dBFS
sox voice.wav output/gain.wav gain -3     # turn down 3 dB
sox voice.wav output/vol.wav vol 0.5      # half the amplitude
```

`norm` sets the **peak** level. For loudness that matches between files (LUFS, what streaming platforms measure), use ffmpeg's `loudnorm` or [ffmpeg-normalize](more-tools.md#ffmpeg-normalize).

## Sample rate and channels

```sh
sox voice.wav -r 44100 -c 1 output/voice-44k-mono.wav   # output options go before the output file
sox stereo.wav output/mono.wav remix -                    # mix all channels down to mono
```

## Join (concatenate)

List the inputs one after another:

```sh
sox voice.wav music48.wav output/joined.wav
```

**The files must have the same sample rate and channel count.** In testing, joining a 48 kHz file to a 44.1 kHz one failed with `Input files must have the same sample-rate`. Convert first:

```sh
sox music.wav -r 48000 music48.wav
```

## Mix

```sh
sox -m voice.wav music48.wav output/mixed.wav                  # mix (each input turned down to avoid clipping)
sox -m -v 1 voice.wav -v 0.3 music48.wav output/mixed2.wav     # voice at full, music at 30%
sox -M left.wav right.wav output/stereo.wav                    # merge two mono files into one stereo file
```

`-v` goes right before the file it applies to. Same rule as joining: matching sample rates.

## Remove silence in the middle

Shorten every pause longer than half a second down to half a second:

```sh
sox voice.wav output/tight.wav silence -l 1 0.1 1% -1 0.5 1%
```

Reading the numbers: `1 0.1 1%` trims silence at the start (anything below 1% of full level, until there's 0.1 s of sound); `-1 0.5 1%` handles every later pause longer than 0.5 s; `-l` leaves 0.5 s of each pause in place instead of cutting it to nothing. On the test file, a 2 s gap became 0.5 s. Raise `1%` if the room is noisy.

## Noise reduction

Two steps. First, profile a stretch that should be silent but has room noise (hiss, hum, air conditioning). Then reduce that noise across the whole file.

```sh
sox noisy-voice.wav -n trim 3 1.5 noiseprof output/room.prof      # profile 1.5 s of "silence" starting at 3 s
sox noisy-voice.wav output/cleaned.wav noisered output/room.prof 0.21
```

The last number (0–1, default 0.5) is how hard to reduce. Start around 0.2–0.3 and listen on headphones: too high and voices go watery. The SoX manual recommends trying several amounts before replacing anything.

To make a test file: `ffmpeg -f lavfi -i "anoisesrc=color=pink:amplitude=0.05:duration=10:sample_rate=48000" noise.wav`, then `sox -m voice.wav noise.wav noisy-voice.wav trim 0 8`. In our test the noise floor in the pause dropped from an RMS delta of 0.0029 to 0.00005 (`sox file.wav -n trim 3.2 1 stat`).

Always record 5–10 seconds of room tone at a shoot. This is what it's for.

## Speed, tempo and pitch

```sh
sox voice.wav output/tempo.wav tempo 1.25     # 25% faster, same pitch
sox voice.wav output/speed.wav speed 1.25     # 25% faster and higher, like a tape sped up
sox voice.wav output/pitch.wav pitch 300      # up 300 cents (3 semitones), same length
```

`pitch` is in cents: 100 cents = one semitone, 1200 = an octave. Negative numbers go down.

## Spectrograms

```sh
sox noisy-voice.wav -n spectrogram -x 1200 -y 400 -t "noisy-voice.wav" -o output/spectrogram.png
```

Time runs left to right, frequency bottom to top, loudness as color. A steady horizontal line low down is hum (60 Hz and its multiples in the US); a wash across the top is hiss; a gap is silence. Make one before and one after noise reduction and compare.

Claude can read the PNG. Try: "Make a spectrogram of `room-tone.wav`, look at it, and tell me whether there's a hum and at what frequency."

## Make test audio

```sh
sox -n -r 48000 -c 1 output/tone.wav synth 3 sine 440
```

Three seconds of 440 Hz at 48 kHz mono. The Mac's `say` command makes test speech: `say -o speech.aiff "Testing one two three"`.

## Batch a folder

```sh
mkdir -p output/normalized
for f in *.wav; do sox "$f" "output/normalized/${f%.*}-norm.wav" norm -1; done
```

## Learn more

- `man sox`, `man soxi` in Terminal: the full manual for the version you have, with every effect
- [SoX manual (Debian copy)](https://manpages.debian.org/stable/sox/sox.1.en.html): the same manual online
- [SoX on SourceForge](https://sourceforge.net/projects/sox/): the original project
- [sox_ng](https://codeberg.org/sox_ng/sox_ng): the maintained fork
- [Homebrew: sox](https://formulae.brew.sh/formula/sox)
