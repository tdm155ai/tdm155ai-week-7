---
title: ffmpeg and ffprobe
description: The command-line video and audio tool. Inspect, trim, join, convert, caption, measure, and batch, with recipes tested on a Mac.
author: claude
order: 10
checked: 2026-10-20
---

## At a glance

| | |
|---|---|
| What | `ffmpeg` converts and edits video and audio. `ffprobe` reports what's inside a file. |
| Install | `brew install ffmpeg` (or `brew install ffmpeg-full` for subtitle burn-in and on-screen text; see [Subtitles](#subtitles)) |
| Tested with | ffmpeg 9.0.2 from Homebrew on Apple Silicon, 2026-10-20. Subtitle burn-in tested with ffmpeg 7.1.1 built with libass. |
| Reads | Nearly everything: MOV, MP4, MKV, ProRes, H.264, HEVC, WAV, AIFF, MP3, AAC/M4A, FLAC, image sequences, SRT |
| Docs | [ffmpeg.org/documentation](https://ffmpeg.org/documentation.html) |

All examples use small test files: `interview.mp4` (10 s, 1280x720, H.264, keyframes every 2 s), `clip1.mov` and `clip2.mov` (5 s ProRes 422 each), `edit.mov` (the two clips cut together), `voice.wav` (a tone, a 2 s pause, another tone) and `music.wav`. Put your results in `output/`: run `mkdir -p output` first.

## The shape of a command

```sh
ffmpeg [input options] -i input.mov [filters] [codec options] output.mp4
```

- **Inputs** come after `-i`. You can have more than one (`-i video.mp4 -i music.wav`). Options placed *before* an `-i` apply to that input (like `-ss` to seek).
- **Filters** change the picture or sound: `-vf` for video, `-af` for audio, `-filter_complex` when you need several inputs or outputs. Filters chain with commas: `-vf "scale=-2:720,fps=30"`.
- **Codecs** say how to encode the output: `-c:v libx264` (video), `-c:a aac` (audio). `-c copy` means don't re-encode; copy the data as it is.
- **Mapping** picks which streams go to the output: `-map 0:v -map 1:a` means video from the first input, audio from the second.
- **The output** file name comes last. The extension sets the container.

ffmpeg asks before overwriting an existing file. `-y` overwrites without asking; `-n` never overwrites. Leave both off while you're learning.

## Inspect with ffprobe

The full picture, as JSON (good for Claude to read):

```sh
ffprobe -v error -print_format json -show_format -show_streams interview.mp4
```

Just the facts you usually need:

```sh
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels -of json interview.mp4
```

Where the keyframes are (this matters for trimming):

```sh
ffprobe -v error -select_streams v:0 -skip_frame nokey -show_entries frame=pts_time -of csv=p=0 interview.mp4
```

On the test file that prints 0, 2, 4, 6, 8: a keyframe every two seconds.

## Trim

**Fast, no re-encode (stream copy):**

```sh
ffmpeg -ss 00:00:03 -to 00:00:07 -i interview.mp4 -c copy output/cut-copy.mp4
```

**Frame-accurate (re-encode):**

```sh
ffmpeg -ss 00:00:03 -to 00:00:07 -i interview.mp4 -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac output/cut-exact.mp4
```

Why two versions: compressed video stores a full picture only at **keyframes**. The frames in between are stored as changes from earlier frames. A stream copy can't create a new keyframe, so the cut has to start at one. On the test file, asking for 3–7 s with `-c copy` gave a 4.1 s file: ffmpeg kept the frames back to the keyframe at 2 s and marked the extra second as hidden. Players that respect that mark start at 3 s; some players and editors show the extra frames or a stutter. The re-encoded version came out at exactly 4.0 s.

Use stream copy for rough pulls and long selects. Re-encode when the in-point has to land on a specific frame. `-ss` before `-i` seeks quickly; with re-encoding it is still frame-accurate.

## Join clips

**Same codec, size, frame rate and audio format** (clips from one camera): use the concat demuxer with a list file.

```sh
printf "file 'clip1.mov'\nfile 'clip2.mov'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy output/joined.mov
```

**Different sizes or formats:** use the `concat` filter, which re-encodes. Scale everything to one size and frame rate first.

```sh
ffmpeg -i interview.mp4 -i clip1.mov -filter_complex "[0:v]scale=1920:1080,setsar=1,fps=30[v0];[1:v]scale=1920:1080,setsar=1,fps=30[v1];[0:a]aresample=48000[a0];[1:a]aresample=48000[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac output/joined-mixed.mp4
```

**Crossfade** between two clips (1 s dissolve starting at 4 s into the first clip):

```sh
ffmpeg -i clip1.mov -i clip2.mov -filter_complex "[0:v][1:v]xfade=transition=fade:duration=1:offset=4[v];[0:a][1:a]acrossfade=d=1[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac output/xfade.mp4
```

## Convert and compress

A safe default for sharing: H.264 video, AAC audio, plays everywhere.

```sh
ffmpeg -i clip1.mov -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart output/clip1-h264.mp4
```

| Flag | What it does |
|---|---|
| `-crf 23` | Quality target. Lower is better and bigger. 18 is close to visually lossless; 28 is small. |
| `-preset medium` | Speed vs. file size. `veryfast` encodes faster and makes bigger files; `slow` the reverse. |
| `-pix_fmt yuv420p` | The pixel format every player supports. Without it, a ProRes or 10-bit source can come out as "High 4:2:2" H.264, which QuickTime and browsers often won't play (we got exactly that from the ProRes test clip). |
| `-movflags +faststart` | Moves the index to the front so web video starts playing before it finishes downloading. |
| `-b:a 192k` | Audio bitrate. |

On the test clip, 28.7 MB of ProRes became 3.2 MB of H.264.

Faster on a Mac, using the hardware encoder (quality set by bitrate instead of CRF):

```sh
ffmpeg -i clip1.mov -c:v h264_videotoolbox -b:v 8M -pix_fmt yuv420p -c:a aac output/clip1-vt.mp4
```

## Resize and make proxies

```sh
ffmpeg -i clip1.mov -vf "scale=-2:720" -c:v libx264 -crf 23 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 128k output/clip1-proxy.mp4
```

`scale=-2:720` means 720 pixels tall, width to match the aspect ratio, rounded to an even number (H.264 needs even dimensions).

A proxy for every .mov in the folder:

```sh
mkdir -p output/proxies
for f in *.mov; do
  ffmpeg -i "$f" -vf "scale=-2:720" -c:v libx264 -crf 23 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 128k "output/proxies/${f%.*}-proxy.mp4"
done
```

## Extract or replace audio

```sh
ffmpeg -i interview.mp4 -vn -c:a copy output/interview-audio.m4a          # copy the AAC as is
ffmpeg -i interview.mp4 -vn -c:a pcm_s16le -ar 48000 output/interview.wav  # WAV for editing
ffmpeg -i interview.mp4 -vn -c:a libmp3lame -q:a 2 output/interview.mp3    # MP3
```

Replace the soundtrack, keeping the picture untouched:

```sh
ffmpeg -i interview.mp4 -i music.wav -map 0:v -map 1:a -c:v copy -c:a aac -shortest output/interview-newaudio.mp4
```

## Subtitles

**Check first.** Burning subtitles into the picture needs ffmpeg built with libass:

```sh
ffmpeg -hide_banner -filters | grep subtitles
```

If that prints nothing, your ffmpeg can't burn in subtitles. As of October 2026 the standard Homebrew `ffmpeg` (9.0.2) is built without libass, so `subtitles` and `drawtext` are missing. Homebrew's `ffmpeg-full` has them. It installs alongside the regular one without replacing it, so you call it by its full path:

```sh
brew install ffmpeg-full
/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg -hide_banner -filters | grep subtitles
```

**Burn in** (needs libass; tested with ffmpeg 7.1.1):

```sh
ffmpeg -i interview.mp4 -vf "subtitles=captions.srt:force_style='FontName=Helvetica,FontSize=20,Outline=2'" -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a copy output/interview-burned.mp4
```

**Soft subtitles** (works with any build, tested with 9.0.2): the captions ride along as a track the viewer can turn on or off in QuickTime, VLC or a phone. No re-encode.

```sh
ffmpeg -i interview.mp4 -i captions.srt -map 0 -map 1 -c copy -c:s mov_text -metadata:s:s:0 language=eng output/interview-softsubs.mp4
```

For an SRT file to start from, see [whisper.cpp](more-tools.md#whispercpp). Social platforms usually want either burned-in captions or a separate SRT upload.

## Thumbnails and contact sheets

One frame per second as JPEGs:

```sh
ffmpeg -i interview.mp4 -vf "fps=1" output/thumb-%03d.jpg
```

A single contact sheet: one frame every 2 seconds, 320 px wide, five across. Good for showing Claude a whole clip in one image.

```sh
ffmpeg -i interview.mp4 -vf "fps=1/2,scale=320:-2,tile=5x1" -frames:v 1 output/contact-sheet.jpg
```

For longer clips, change `fps=1/2` to `fps=1/10` (one every 10 s) and `tile=5x1` to `tile=6x4`.

## GIF

Two-pass palette, so the colors don't band:

```sh
ffmpeg -ss 2 -t 3 -i interview.mp4 -vf "fps=12,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" -loop 0 output/clip.gif
```

## Speed change

Twice as fast (video and audio):

```sh
ffmpeg -i interview.mp4 -vf "setpts=PTS/2" -af "atempo=2.0" -c:v libx264 -crf 20 -pix_fmt yuv420p output/interview-2x.mp4
```

Half speed: `-vf "setpts=PTS*2" -af "atempo=0.5"`. `atempo` changes speed without changing pitch.

## Crop to vertical 9:16

Center crop of a 16:9 frame, scaled to 1080x1920:

```sh
ffmpeg -i interview.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a copy output/interview-vertical.mp4
```

The crop is centered by default. To move it, add x: `crop=ih*9/16:ih:200:0` starts 200 px from the left.

## Fade in and out

One-second fades at both ends of a 10-second clip (the fade-out starts at 9 s):

```sh
ffmpeg -i interview.mp4 -vf "fade=t=in:st=0:d=1,fade=t=out:st=9:d=1" -af "afade=t=in:st=0:d=1,afade=t=out:st=9:d=1" -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac output/interview-fades.mp4
```

Get the duration first with `ffprobe` so you know where the fade-out starts.

## Loudness

Measure (EBU R128, the broadcast and streaming standard):

```sh
ffmpeg -i voice.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=summary -f null -
```

Normalize to -16 LUFS (a common target for online video and podcasts):

```sh
ffmpeg -i voice.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 output/voice-normalized.wav
```

The `-ar 48000` matters: `loudnorm` works internally at 192 kHz and would otherwise write a 192 kHz file. This one-pass version is good enough for most work. For exact two-pass normalization over a folder, use [ffmpeg-normalize](more-tools.md#ffmpeg-normalize).

## Silence detection: the basis for rough cuts

```sh
ffmpeg -i voice.wav -af silencedetect=noise=-30dB:d=0.5 -f null -
```

It prints lines like `silence_start: 2.999875` and `silence_end: 5.000083`. Everything between a `silence_end` and the next `silence_start` is someone talking. This is where Claude is useful: ask it to run `silencedetect`, turn the output into a list of talking sections, and then either cut them out with ffmpeg or write them up as a list you can check against the footage. Adjust `noise` (how quiet counts as silence; try -35dB for a quiet room) and `d` (minimum length in seconds).

To remove silences from an audio file directly:

```sh
ffmpeg -i voice.wav -af "silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-30dB" output/voice-tight.wav
```

On the test file, a 2 s pause shrank to 0.5 s (8.0 s became 6.5 s). For video, [auto-editor](more-tools.md#auto-editor) does the same job and can hand the result to Premiere, Resolve or Final Cut as a timeline.

## Scene detection

Print the time of every hard cut:

```sh
ffmpeg -i edit.mov -vf "select='gt(scene,0.4)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*"
```

Save a still of each new shot:

```sh
ffmpeg -i edit.mov -vf "select='gt(scene,0.4)',scale=640:-2" -fps_mode vfr output/scene-%03d.jpg
```

`0.4` is the sensitivity (0 to 1). Lower finds more cuts, including false ones from camera moves; higher finds fewer. Handy for logging found footage or someone else's edit.

## Audio with ffmpeg

ffmpeg covers most audio editing on its own, so for most work it is enough. SoX is the audio-specific companion (see [SoX](sox.md)): use it when you want its effects chain, its noise reduction, or a spectrogram image.

| Job | ffmpeg |
|---|---|
| Trim | `ffmpeg -ss 1 -to 4 -i voice.wav output/voice-trim.wav` |
| Convert | `ffmpeg -i voice.wav -c:a aac -b:a 192k output/voice.m4a` |
| Mono, 16 kHz (for speech-to-text) | `ffmpeg -i voice.wav -ac 1 -ar 16000 output/voice-16k.wav` |
| Fade | `-af "afade=t=in:d=0.5,afade=t=out:st=2.5:d=0.5"` |
| Filter out rumble | `-af "highpass=f=80"` |
| Normalize | `-af loudnorm=I=-16:TP=-1.5:LRA=11` (see [Loudness](#loudness)) |
| Mix voice over music at 30% | see below |

```sh
ffmpeg -i voice.wav -i music.wav -filter_complex "[1:a]volume=0.3[bg];[0:a][bg]amix=inputs=2:duration=first:normalize=0" output/voice-with-music.wav
```

`duration=first` stops when the voice ends. `normalize=0` keeps the voice at full level; without it, `amix` turns every input down.

## Learn more

- [ffmpeg documentation](https://ffmpeg.org/documentation.html): the manual for `ffmpeg`, `ffprobe`, and every option
- [ffmpeg filters reference](https://ffmpeg.org/ffmpeg-filters.html): every filter used on this page, with all its options
- [FFmpeg wiki: H.264 encoding guide](https://trac.ffmpeg.org/wiki/Encode/H.264): CRF, presets, and compatibility
- [Homebrew: ffmpeg](https://formulae.brew.sh/formula/ffmpeg) and [ffmpeg-full](https://formulae.brew.sh/formula/ffmpeg-full): what each build includes
