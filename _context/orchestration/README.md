---
title: Week 7 orchestration — task board
description: Briefs and reports for the editing workshop tools.
author: codex
updated: 2026-10-21
status: Planning; implementation has not started
thread_id: 01a15e27-4b1c-7261-be6f-4945b70223ad
started_in: /Users/mk/Development/mk-27/apps/the-notebook
---

# Week 7 orchestration

Fresh version of the board → task brief → completion report pattern in `apps/mk-chatbot-experiments/_context/orchestration/` in The Notebook. Its task statuses, agents, and implementation decisions do not carry over here.

## Current state

The week 7 repo has a Markdown-based Next app and printable resource sheets for audio, video, image, and command-line editing. No `utils/` toolkit or multicamera editor exists yet. The course planning home is The Notebook's `_context/projects/50-in-focus/tdm155ai-dev/plan/weeks/07-20261019-editing/`.

## Tasks

| Task | Brief | Status | Report |
|---|---|---|---|
| A | [Audio-based multicamera sync and camera switcher](tasks/A-multicam.md) | Brief drafted; not implemented | `reports/A-multicam.md` when work is done |

Marlon also wants a `utils/` folder with the usual generation scripts and new video/audio editing tools, including FFmpeg and ImageMagick. Which existing scripts to carry over remains to be inventoried; task A is the first concrete tool brief.

## Working conventions

Read the repo's `AGENTS.md`, this board, and the task brief before implementation. Read nested instructions before changing the Next app. Keep Marlon's requests distinct from agent proposals. Update the board when work changes state; retain the original brief as a record of what was asked.

Put a completion or stopping report in `reports/` with files/routes, how to try it, checks performed, limitations, dependencies for other work, and open decisions. Include agent, thread ID, starting directory, and resume command. Do not start a dev server without Marlon's request. Keep originals untouched and generated media in gitignored output folders. No deployment or publishing is part of these briefs. This board does not itself launch or authorize parallel agents.

## Handoff

Created by Codex in thread `01a15e27-4b1c-7261-be6f-4945b70223ad`, started in `/Users/mk/Development/mk-27/apps/the-notebook`. Resume from that directory with `codex resume 01a15e27-4b1c-7261-be6f-4945b70223ad`.
