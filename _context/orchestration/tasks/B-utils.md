---
task: B
title: Carry utils/ forward from week 6
author: claude
status: Ready
owns: utils/ (except utils/multicam/ and utils/edit/), root package.json, pnpm-lock.yaml, .env.example, the root README's utils section
depends_on: none
report: reports/B-utils.md
---

## Why

Codex's board, from Marlon's October 21 voice planning (paraphrased): Marlon wants a `utils/` folder in week 7 "with the usual generation scripts", plus new video and audio editing tools (those are tasks A1 and C, in `utils/multicam/` and `utils/edit/`).

## The task

1. Read week 6's `apps/tdm155ai/tdm155ai-week-6/` (in The Notebook): its `AGENTS.md`, `package.json`, `.env.example` if present, `utils/README.md`, `utils/examples.md`, and `utils/`.
2. Copy into week 7 at the same paths: `utils/` (scripts, `lib/`, `test/`, README, examples), the root `package.json` (rename it `tdm155ai-week-7-tools`), and `.env.example` (names only, never values). Don't copy `.env`, `output/`, `_media/`, `node_modules/`, `streaming-server/`, or `examples/` unless they're needed for the utils to run; say what you left out.
3. Remove anything specific to week 6 (comic examples tied to its assignment, for instance) only if it's clearly week-specific; otherwise keep it. Say what you removed.
4. Make sure the root `.gitignore` covers `output/`, `.env`, and `node_modules/` (it does now; don't loosen it).
5. `pnpm install` at the root, then `pnpm test`. Tests that need a live key should skip cleanly without one; report which ran.
6. Add a short "Utilities" section to the root `README.md` pointing at `utils/README.md`, and tell the week 7 `AGENTS.md` reader where the utils are in one or two lines (that is the only change to `AGENTS.md`).

Leave `utils/multicam/` and `utils/edit/` alone: tasks A1 and C are building there, possibly at the same time as you. Reserve script names `multicam` and `edit` in `package.json`; the orchestrator adds those lines.

## When you finish

Commit by path (rule 7) and write `_context/orchestration/reports/B-utils.md` (rule 8): what you copied, from which week 6 commit (`git -C ../tdm155ai-week-6 rev-parse --short HEAD`), what you left out, and the test results.
