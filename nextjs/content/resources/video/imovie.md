---
title: iMovie
description: Apple's free, simple video editor, already on most Macs; the fastest way to a first cut.
author: claude
order: 10
checked: 2026-10-20
---

## At a glance

| | |
| --- | --- |
| Maker | Apple |
| Platforms | Mac, iPhone, iPad |
| Price | Free on the Mac App Store |
| Current version | 10.4.5 (September 29, 2026); the App Store lists macOS 26.6 or later |
| Project format | An iMovie library (`iMovie Library.imovielibrary`, in your Movies folder by default) that holds events, clips, and projects |
| Moves up to | Final Cut Pro, with File > Send Movie To Final Cut Pro |

## What it's for

iMovie is for getting a story cut together without learning a professional tool first. It has one video track plus overlays, simple titles and transitions, music, voiceover, and basic color and audio fixes. Pick it when the deadline is close and the edit is mostly choosing and ordering clips. Move to Final Cut Pro, Resolve, or Premiere when you need captions, multiple layered tracks, real color work, or precise audio mixing.

## The tour

The main window has two views: **Media** (the library of clips) and **Projects** (your movies). Press **1** for Media and **2** for Projects.

| Part | What it does |
| --- | --- |
| **Libraries list** | The sidebar on the left. Each library holds events (folders of clips). Show or hide it with Shift-Command-1. |
| **Browser** | The clips in the selected event. Skim across a clip to preview it; drag to select a range. Along the top: My Media, Audio & Video, Titles, Backgrounds, Transitions. |
| **Viewer** | The preview at the top right. The row of buttons above it is the adjustments bar: color balance, color correction, crop, stabilization, volume, noise reduction and equalizer, speed, filters, and video overlay settings. |
| **Timeline** | The movie you are building, along the bottom. Video in the middle, background music below, overlays and titles above. |
| **Toolbar** | Import Media (the down-arrow button), the Enhance button (magic wand), and Share (top right). |

## The basic edit

1. **New project:** in Projects view, click Create New > Movie.
2. **Import:** click Import Media (Command-I) and choose files or a connected iPhone or camera. Clips land in an event.
3. **Choose ranges:** in the browser, skim a clip and drag across it to select the part you want (or hold R and drag).
4. **Build the sequence:** press **E** to add the selection to the end of the movie, **W** to insert it at the playhead, **Q** to connect it above the timeline as an overlay or B-roll.
5. **Trim:** drag the ends of clips in the timeline. Command-B splits a clip at the playhead. Command-Backslash opens the clip trimmer for frame-by-frame adjustment.
6. **Sound:** drag music from Audio & Video into the background music area. Press **V** to record a voiceover. Option-Command-B detaches a clip's audio so you can extend it under the next shot (an L cut).
7. **Titles and transitions:** drag them in from Titles and Transitions. Use few.
8. **Fix:** select a clip and use the adjustments bar above the viewer, or Shift-Command-E to enhance video and audio automatically.
9. **Export:** File > Share > File (or the Share button > File). Choose Resolution and Quality, click Next, save.

## Shortcuts to learn first

| Action | Keys |
| --- | --- |
| Play / pause | Space |
| Play the selection | / (slash) |
| One frame back / forward | Left Arrow / Right Arrow |
| Select a whole clip | X |
| Select part of a clip | Hold R and drag |
| Add selection to the end of the movie | E |
| Insert at the playhead | W |
| Connect above the timeline (overlay, B-roll) | Q |
| Split clip at the playhead | Command-B |
| Detach audio | Option-Command-B |
| Open or close the clip trimmer | Command-\ (backslash) |
| Record voiceover | V |
| Auto-enhance video and audio | Shift-Command-E |
| Mark as favorite / reject | F / Delete |
| Import media | Command-I |
| Loop playback | Command-L |
| Play full screen | Shift-Command-F |

Apple's full list: [Keyboard shortcuts in iMovie on Mac](https://support.apple.com/guide/imovie/keyboard-shortcuts-movd9d8f91e8/mac).

## AI in the app

iMovie has little AI in the current sense. What it has runs on your Mac and costs nothing.

| Feature | What it does |
| --- | --- |
| **Enhance** (magic wand, Shift-Command-E) | Automatically adjusts color and audio of the selected clips. |
| **Reduce background noise** | In the noise reduction and equalizer controls; a slider that takes down steady noise like hum or air conditioning. |
| **Stabilize Shaky Video** | In the stabilization controls; smooths handheld footage. |
| **Cinematic Editor** (Option-Command-F) | Changes focus points and depth of field in Cinematic mode video from an iPhone. 10.4.5 adds the same for video shot in Final Cut Camera, on macOS 27. |
| **Green/Blue Screen** | An overlay mode that keys out a green or blue background. |

iMovie for iPhone and iPad has templates (Magic Movie, Storyboards) that the Mac version does not.

## Working with Claude

iMovie has no scripting interface and doesn't import timeline files (FCPXML, EDL) or caption files. Claude helps before and after.

**Before:** convert footage iMovie won't open, or that plays badly, into H.264 or ProRes with [ffmpeg](../cli/ffmpeg.md). Ask Claude to read a transcript and give you a list of in/out times; you then make those selections by hand. The [paper cut section](README.md#paper-cut-from-a-transcript) in the video overview shows the prompt.

**After:** add captions to the exported file. This puts an SRT into an .mp4 as a subtitle track that viewers can turn on and off (tested with ffmpeg 9.0.2):

```bash
ffmpeg -i movie.mp4 -i captions.srt -map 0 -map 1 -c copy -c:s mov_text -metadata:s:s:0 language=eng movie_subs.mp4
```

Burned-in captions (always visible) need ffmpeg's `subtitles` filter, which the standard Homebrew `ffmpeg` no longer includes; see [ffmpeg](../cli/ffmpeg.md).

**When you outgrow it:** File > Send Movie To Final Cut Pro opens the project in Final Cut Pro as a new library, edits intact. From there, FCPXML opens the door to Resolve and everything else.

Example prompt:

```text
I exported my iMovie edit as movie.mp4 and have a transcript in movie.srt.
Fix the spelling of names (Nakamura, Oyelaran), keep every caption under
42 characters per line, and add it to the mp4 as a subtitle track.
```

## Export settings that work

File > Share > File, then:

| Setting | Choose |
| --- | --- |
| Format | Video and Audio |
| Resolution | The same as your footage: 1080p, or 4K if you shot 4K |
| Quality | High for web and sharing; Best (ProRes) for a master you may re-edit |

iMovie writes a .mov. If somewhere needs an .mp4, either use the Share button > Social Platforms, which writes a file meant for upload, or rewrap the .mov with ffmpeg (`ffmpeg -i movie.mov -c copy movie.mp4`, which works when the video is H.264 or HEVC with AAC audio).

## Learn more

- [iMovie User Guide for Mac](https://support.apple.com/guide/imovie/welcome/mac)
- [Keyboard shortcuts in iMovie on Mac](https://support.apple.com/guide/imovie/keyboard-shortcuts-movd9d8f91e8/mac)
- [Export a movie as a file](https://support.apple.com/guide/imovie/export-a-movie-trailer-or-clip-as-a-file-move6e0cb2ad/mac)
- [Send projects to Final Cut Pro](https://support.apple.com/guide/imovie/send-projects-to-final-cut-pro-movcbf7e2a3f/mac)
