---
task: D
thread_id: b0c287ea-64d8-4a19-83f0-36ab15a48da8
agent: Claude Code (Opus 5.5)
started_in: /Users/mk/Development/mk-27/apps/the-notebook
resume: cd /Users/mk/Development/mk-27/apps/the-notebook && claude --resume b0c287ea-64d8-4a19-83f0-36ab15a48da8
status: done
author: claude
---

## What I built

- `nextjs/content/resources/video/capcut.md` (new, `order: 15`, between iMovie and Final Cut Pro), following the iMovie/Premiere section order: At a glance, What it's for, The tour, The basic edit, Shortcuts, AI in the app, a new **What to know before you upload** (terms, data, US availability, Harvard), Working with Claude, Export settings, Learn more.
- `video/README.md`: heading "The five editors compared", a CapCut column second (after iMovie) in every row, a CapCut line in "Which to pick when" and "The sheets", "four" → "five" in the description and "What Claude can do for all five". Nothing else changed.
- `video/ai-tools.md`: the CapCut section cut to a short paragraph pointing to the sheet; the at-a-glance table now links `capcut.md`.

## How to try it

```bash
curl -s http://localhost:3007/resources/video/capcut
curl -s http://localhost:3007/resources/video
```

All three pages returned 200 on the orchestrator's dev server and the table shows "five editors compared".

## Commits

One commit by path: `capcut.md`, `README.md`, `ai-tools.md`, and this report (see `git log -- nextjs/content/resources/video/capcut.md`).

## Facts verified, with sources

- Terms of Service last updated April 15, 2026; US counterparty is TikTok USDS Joint Venture; the license text quoted on the sheet; age 13+: https://www.capcut.com/clause/terms-of-service (scraped October 21).
- App Store (US): version 19.8.0, released about October 20; seller BYTEDANCE PTE. LTD.; iPhone, iPad, Mac; in-app purchases Standard Monthly $9.99, Pro Monthly $19.99, Yearly $89.99, Monthly $7.99; 13+: https://apps.apple.com/us/app/capcut-photo-video-editor/id1500855883 (live fetch October 21).
- Pro $19.99/month or $179.99/year: https://www.capcut.com/resource/capcut-standard-vs-pro.
- Mac desktop app, auto captions, background removal: https://www.capcut.com/resource/download-capcut-for-mac; Remove BG > Auto removal and AI remove paths: https://www.capcut.com/resource/how-to-remove-background-in-capcut.
- Joint venture closed January 22, 2026 and covers CapCut; offline January 2025, back February 2025; no separate US app: https://www.hooked.so/guides/is-capcut-getting-banned (September 25, 2026, citing TikTok's newsroom announcement) and https://www.socialmediatoday.com/news/tiktok-confirms-joint-venture-to-comply-with-us-law/810318/.
- Watermark comes from Pro-tagged assets, not resolution; free exports 1080p: https://pixflow.net/blog/capcut-pro-price-worth-it/ (third-party, marked verify on the sheet).
- The 16:9 → 9:16 crop command: tested with ffmpeg 9.0.2 on a lavfi test source; output 1080x1920 with audio.

## `(verify)` left on the sheet

Desktop version number; project format/no timeline export; plan names and contents at checkout; desktop UI labels; Command-B split, Command-=/− zoom, Command-E export, and where the shortcut list lives; vocal isolation being Pro; Captions > Import for SRT; which tier gives 4K; the watermark rule; HUIT not having reviewed CapCut.

## What I couldn't do or didn't check

I didn't open CapCut; the tour, basic edit, and shortcuts come from CapCut's help pages and general knowledge, and are flagged. The $7.99 "Monthly Subscription" and $89.99 "Yearly" App Store items don't match CapCut's own $179.99/year Pro price; I listed both and didn't resolve which plan the $89.99 is.

## For other tasks

- `ai-tools.md` line 9 still says "The four editors in this section"; it's outside my CapCut-section scope. Suggest "five" (or reword).
- README's file table says SRT opens in "All four, as captions"; I left it because I couldn't confirm CapCut's SRT import.
- No errors found in the four existing sheets (I read `imovie.md` closely and skimmed `premiere-pro.md`'s headings only).

## Marlon's words

October 21: "i want to have pages on some key video editing tools, including imovie, capcut, then the big 3 pro ones = fcpx, premiere, resolve. Maybe a table explaining the differences with links could be good."

## Decisions and open questions

- I added the "What to know before you upload" section because the brief asked for terms, data, and US availability, and it matters for interview footage before October 28. Marlon may want it shorter.
- The Harvard/HUIT line is a guess flagged (verify); delete it if HUIT has a position.
