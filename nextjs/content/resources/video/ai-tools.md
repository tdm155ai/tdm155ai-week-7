---
title: AI video tools
description: Editors built around AI (Descript, CapCut, Runway, Adobe Firefly) and auto-editor, the open-source silence cutter Claude can run for you.
author: claude
order: 50
checked: 2026-10-20
---

The four editors in this section all have AI features built in. The tools on this page go further: they are organized around AI from the start, or they do one AI-assisted job and hand the result back to your editor. Prices and features here change often; check the vendor's page before you pay.

## At a glance

| Tool | What it does for an edit | Price (Oct 2026) | Runs where | Hands off to your editor? |
| --- | --- | --- | --- | --- |
| [Descript](#descript) | Edit video by editing its transcript; voice cleanup | Free tier; paid from $16/month (annual) | Mac app and web, cloud processing | Yes: FCPXML, Premiere XML, Resolve XML, AAF |
| [CapCut](#capcut) | Quick social edits with templates, auto captions | Free tier; paid from $9.99/month | Mac app, web, phone | No timeline export |
| [Runway](#runway) | Prompt-based changes to existing footage (Edit Studio) | 125 free credits once; paid from $12/month (annual) | Web, cloud | You download clips |
| [Adobe Firefly](#adobe-firefly-video) | Browser video editor plus generated clips and prompt edits | Included in Harvard's Adobe license (1,000 credits/month) | Web (Chrome), cloud | You download clips |
| [auto-editor](#auto-editor) | Cuts silences out of a recording | Free, open source | Your Mac, offline | Yes: FCPXML, Premiere XML, Resolve, Shotcut, Kdenlive |

A rule for all of them: keep your originals. Generative edits change pixels that were in your footage, and for documentary or interview work you need to know (and often say) which shots were altered.

## Descript

Descript transcribes your recording and shows it as a document. Delete a sentence in the text and it's gone from the video; drag a paragraph and the clip moves. It is the most direct way to do a paper cut and a rough cut in one step.

| | |
| --- | --- |
| Plans | Free: 60 media minutes a month, 100 AI credits once, 720p export with a watermark. Hobbyist: $16/month billed yearly ($24 monthly), 10 hours, 1080p. Creator: $24/month yearly ($35 monthly), 30 hours, 4K. Business: $50/month yearly. |
| Education | Descript has an education discount form linked from its [pricing page](https://www.descript.com/pricing). |
| AI features | **Underlord** (an AI co-editor you give instructions to), **Studio Sound** (voice cleanup), **Remove filler words**, **Eye Contact**, **Green Screen**, AI voices and voice cloning. |
| Exports | A finished video, or a **timeline export**: Final Cut Pro (FCPXML), Premiere (XML), DaVinci Resolve (XML), Audition, Pro Tools/Logic (AAF), Reaper (EDL). Clips, trims, and markers carry over; titles and speed changes don't. See [Timeline exports](https://help.descript.com/export-and-share/timeline-exports). |

A good use: cut the interview in Descript by reading it, export the timeline to Final Cut Pro or Resolve, and do the fine cut, B-roll, and color there.

Be careful with voice cloning and AI voices on interview material. Changing what a real person says, even to fix a stumble, is a decision to make on purpose and to disclose.

## CapCut

CapCut, from ByteDance (TikTok's parent company), is a free editor aimed at short social video: templates, effects, auto captions, keyframes, chroma key, and a multi-layer timeline, on the Mac, the web, and phones.

| | |
| --- | --- |
| Plans | Free tier with limits (exports cap at 1080p). Paid tiers as of mid-October 2026, from a third-party check of CapCut's pages: Standard $9.99/month, Pro $19.99/month or $179.99/year, Ultra $79/month. Prices vary by country and are higher through app stores. |
| AI features | Auto captions, background removal, and generative tools that use AI credits on paid plans. |
| Good for | Vertical video with captions, fast. |
| Not good for | Handing a timeline to another editor: it doesn't export FCPXML, EDL, or OTIO. |

Many CapCut features process your footage on its servers. Read its terms before uploading interviews or anything you don't have permission to share.

## Runway

Runway is known for generating video, but its **Edit Studio** (powered by its Aleph 2.0 model) edits footage you already have: remove an object, replace a background, change a product or a character, add an effect, all by typing a prompt.

| | |
| --- | --- |
| Plans | Free: 125 credits once. Standard $12/month, Pro $28/month, Max $76/month (billed yearly; monthly billing costs more). |
| Edit Studio limits | Clips from 2 to 30 seconds, up to 1080p input. Aleph 2.0 costs 28 credits per second, minimum 56. A 10-second edit is 280 credits. ProRes or PNG-sequence output costs more and needs Max or above. |
| Also | Video generation with Gen-4.5 and other models in the same workspace. |
| Exports | Rendered clips you download and drop into your editor. |

Use it for one shot that needs a fix you couldn't get on set, not for a whole piece.

## Adobe Firefly video

Firefly is Adobe's generative AI, and your Harvard Creative Cloud account includes it (1,000 generative credits a month, shared across Adobe apps).

| | |
| --- | --- |
| **Firefly video editor** | A browser editor at [firefly.adobe.com](https://firefly.adobe.com) with a multi-track timeline. Combine generated clips, music, and your own footage; edit by timeline or by text. Desktop Chrome only for now. |
| **Generate Video** | Text-to-video and image-to-video with Adobe's Firefly Video Model and partner models (Runway Gen-4.5, Kling 3.0, and others). |
| **Prompt edits** | Change a single clip by describing the change; Runway's Aleph 2.0 is offered for this inside Firefly. |
| Credits | Generation and partner models use credits, often many per second of video. Check the [generative credits FAQ](https://helpx.adobe.com/creative-cloud/apps/generative-ai/generative-credits-faq.html) before a big batch. |
| In Premiere | Generative Extend and the Generative Media Tool bring Firefly into the timeline; see [Premiere](premiere-pro.md). |

## auto-editor

`auto-editor` is a free, open-source command-line tool that finds the quiet parts of a recording and cuts them out. It can render a new video, or (more useful) write a timeline file so you can open the cut in your editor and adjust every cut it made. It runs on your Mac, offline, so Claude can run it for you in the terminal.

Install (tested with auto-editor 31.7.2):

```bash
brew install auto-editor
```

Installing it with Homebrew also installs or upgrades Homebrew's `ffmpeg` if needed.

See what it would cut, without writing anything:

```bash
auto-editor interview.mov --preview
```

Render a new file with the silences removed (writes `interview_ALTERED.mov` next to the original):

```bash
auto-editor interview.mov
```

Leave more breathing room around speech (the default margin is 0.2 seconds):

```bash
auto-editor interview.mov --margin 0.3s
```

Write a timeline for your editor instead of a video:

```bash
auto-editor interview.mov --margin 0.3s --export final-cut-pro -o interview_cut.fcpxml
auto-editor interview.mov --margin 0.3s --export resolve -o interview_resolve.fcpxml
auto-editor interview.mov --margin 0.3s --export premiere -o interview_cut.xml
```

The Final Cut Pro output was checked against the FCPXML 1.11 DTD that ships with Final Cut Pro 12.4. `shotcut` and `kdenlive` are also valid `--export` targets.

Adjust what counts as silence (loudness from 0 to 1; 0.04 is the default), or remove a section by hand:

```bash
auto-editor interview.mov --edit audio:threshold=0.04 --margin 0.3s --preview
auto-editor interview.mov --margin 0.3s --cut-out 0,2sec --preview
```

Silence cutting is a starting point. It will remove pauses that mattered (a breath before a hard answer, a laugh). Open the timeline version and put those back.

Example prompt for Claude Code:

```text
Run auto-editor on interviews/*.mov with a 0.3 second margin and export a
Final Cut Pro timeline for each. Show me the --preview stats first so I can see
how much each one loses before you write anything.
```

## Learn more

- [Descript help center](https://help.descript.com/)
- [Runway: Creating with Edit Studio](https://help.runwayml.com/hc/en-us/articles/51683104370451-Creating-with-Edit-Studio)
- [Adobe Firefly AI video editor](https://www.adobe.com/products/firefly/features/ai-video-editor.html)
- [auto-editor on GitHub](https://github.com/WyattBlue/auto-editor) and [auto-editor.com](https://auto-editor.com/)
