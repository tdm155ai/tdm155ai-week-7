---
task: E
title: The command-line section — which tools, and a sheet for each one worth it
author: claude
status: Ready
owns: nextjs/content/resources/cli/README.md, nextjs/content/resources/cli/more-tools.md, nextjs/content/resources/cli/sox.md, new sheets in nextjs/content/resources/cli/ (except rembg.md)
depends_on: none; folds in C1's and C2's link lines when they report
report: reports/E-cli-tools.md
---

## Marlon's words

October 21: "i also want resources pages on the command line tools = imagemagick, ffmpeg and any others you recommend for photo video and audio editing."

## What exists

`nextjs/content/resources/cli/` has `README.md` (why these tools fit Claude, how to ask, install, safety habits, the sheets), `ffmpeg.md`, `imagemagick.md`, `sox.md`, and `more-tools.md` (ExifTool, whisper.cpp, openai-whisper, auto-editor, Demucs, ffmpeg-normalize, MediaInfo, yt-dlp). Claude wrote them on October 20; Marlon hasn't reviewed them. Tasks C1 and C2 are adding demos to `ffmpeg.md` and `imagemagick.md` and a new `rembg.md` at the same time as you; don't edit those three files.

## The task

1. **Recommend.** For photo, video, and audio editing on a Mac with Claude Code, decide which tools deserve their own sheet, which stay as a section in `more-tools.md`, and what's missing. Candidates to weigh (check each one's current state before recommending): HandBrakeCLI, gifski, libvips, Real-ESRGAN / Upscayl's CLI, whisper.cpp (promote to its own sheet?), auto-editor, Demucs, ExifTool, mpv for preview, `sips` and `afconvert` (built into macOS), OpenTimelineIO, MLT's `melt`. Fewer, better sheets beat a catalog. Write your recommendation into the report first, with a reason for each.
2. **Write the sheets** you recommend, in the format of `sox.md` (frontmatter per `AGENTS.md`, "At a glance", the shape of a command, the common jobs, "Learn more" with the official docs). Every command checked against the installed version or the tool's current docs; Homebrew install lines checked with `brew info`. Where a tool isn't installed and you can't check, mark it `(verify)`.
3. **The README**: reorganize "The sheets" by what students want to do (photo, video, audio, transcripts, inspecting files), and add a short "Demos" list linking to C1's and C2's demo sections once they report (until then, leave a placeholder line the orchestrator will fill).
4. If a sheet in `more-tools.md` becomes its own page, leave a one-line pointer behind.

## When you finish

Commit by path (rule 7) and write `_context/orchestration/reports/E-cli-tools.md` (rule 8), opening with the recommendation.
