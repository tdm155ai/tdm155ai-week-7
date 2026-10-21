---
task: D
title: A CapCut sheet, and CapCut in the video comparison table
author: claude
status: Ready
owns: nextjs/content/resources/video/capcut.md (new), nextjs/content/resources/video/README.md, nextjs/content/resources/video/ai-tools.md (the CapCut section only)
depends_on: none
report: reports/D-capcut.md
---

## Marlon's words

October 21: "i want to have pages on some key video editing tools, including imovie, capcut, then the big 3 pro ones = fcpx, premiere, resolve. Maybe a table explaining the differences with links could be good."

## What exists

`nextjs/content/resources/video/` already has sheets for iMovie, Final Cut Pro, DaVinci Resolve, and Premiere (`imovie.md`, `final-cut-pro.md`, `davinci-resolve.md`, `premiere-pro.md`), written by Claude on October 20 and not yet reviewed by Marlon. Its `README.md` has a comparison table, "The four editors compared", with a column per editor and links to each sheet. CapCut appears only as a section in `ai-tools.md`. The site renders each file at the same path (`/resources/video/capcut`).

## The task

1. **Write `capcut.md`**, matching the other sheets: read `imovie.md` and `premiere-pro.md` first and follow their frontmatter (`title`, `description`, `author: claude`, `order`, `checked: <today>`), section order, and voice. Put CapCut's `order` between iMovie and Final Cut Pro. Cover: who makes it (ByteDance), platforms (desktop, web, phone), price and what the free tier leaves out, the AI features (auto captions, background removal, and the rest), exporting (watermarks, resolution limits on free), what students should know about its terms (licensing of uploaded content, data, any availability issue in the US as of today), and when to choose it over iMovie. Keep the sheet's claims checkable: verify current version, price, and terms on CapCut's own pages and reputable recent sources; write `(verify)` against anything you couldn't confirm. Link the sources.
2. **Add a CapCut column** to the README's table (rename the heading to "The five editors compared"), keeping the table's rows. Order the columns iMovie, CapCut, then the three pro editors. Add CapCut to "Which to pick when", to "The sheets", and where the README says "four" editors. Leave the rest of the README alone.
3. **In `ai-tools.md`**, shorten the CapCut section to a few lines that point to the new sheet.
4. Don't change the four existing sheets. If you find an error in them, list it in your report.

Check that the page renders if you can (don't start a background dev server; see rule 5), otherwise say you didn't.

## When you finish

Commit by path (rule 7) and write `_context/orchestration/reports/D-capcut.md` (rule 8), listing every fact you verified with its source and every `(verify)` left.
