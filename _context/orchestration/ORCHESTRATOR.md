---
title: The orchestrator — how to direct the agents, and who has held the role
description: How one orchestrating agent directs the week 7 task agents, and the log of each orchestrator's handoff.
author: claude
updated: 2026-10-21
---

The pattern is copied from The Notebook's `apps/mk-chatbot-experiments/_context/orchestration/ORCHESTRATOR.md` (October 19–20), cut down for this repo. Its tasks and decisions don't carry over.

Marlon directs the week 7 work through one orchestrating agent at a time. The orchestrator does little of the building itself. It keeps the board, writes the briefs and the prompts that start other agents, reads their reports, checks their work, and tells Marlon where things stand and what he needs to decide. When Marlon retires one orchestrator, the next one starts from this file.

## Taking over

1. **Record yourself.** Run `echo $CLAUDE_CODE_SESSION_ID` (Claude Code) or `echo $CODEX_THREAD_ID` (Codex) and add an entry to the log below: thread ID, agent, starting directory, date. Update `orchestrator:` in the board's frontmatter.
2. **Read your predecessor's handoff**, the last entry in the log.
3. **Read the board** ([README.md](README.md)), then any reports in [reports/](reports/) newer than the board, and `git log --oneline -20`.
4. **Ask Marlon which agent threads are still open** before assuming a task without a report has stopped.
5. **Tell Marlon where things stand** in a few lines: what's done, what's waiting on him, the next batch.

## The work

- **Briefs.** One file per task in [tasks/](tasks/), with frontmatter `task`, `title`, `status`, `owns` (the files it may change), `depends_on`, `report`, then the brief, then "When you finish". Write it so an agent with no other context can do the task. Quote Marlon when the task comes from him; mark proposals as proposals. Add a row to the board. Don't let two concurrent tasks own the same files.
- **Prompts.** Marlon starts each agent himself by pasting a prompt the orchestrator writes, a batch at a time, each with the task and a suggested effort level. The prompt points; the brief explains.
- **Reports.** Read each report, check the claims that matter against the repo (the commits exist, the tests pass, the command runs), then update the board and commit it by path.
- **Marlon's to-dos.** Keep his decisions and actions in the board's to-do list, and raise the ones that block work.
- **Fixes.** Small fixes yourself, committed by path; anything bigger becomes a task.

## Handing over

Before Marlon shuts you down, add your handoff to the log: what came back, agents still running (thread IDs and prompts), promises to Marlon, decisions not yet on the board, what you'd do next. Commit it by path.

## Log

### 0. Codex `01a15e27-4b1c-7261-be6f-4945b70223ad` (2026-10-21, morning)

- **Started in:** `/Users/mk/Development/mk-27/apps/the-notebook`. Resume with `codex resume 01a15e27-4b1c-7261-be6f-4945b70223ad`.
- Not an orchestrator: it drafted the board and the task A brief from Marlon's October 21 voice-planning conversation. Committed by the next thread as `dc3d7c3`.

### 1. Claude Code `9e4d166c-bd03-460f-8da0-8994b99c882a` (2026-10-21)

- **Started in:** `/Users/mk/Development/mk-27/apps/the-notebook`. Resume with `claude --resume 9e4d166c-bd03-460f-8da0-8994b99c882a` from that directory.
- **Took over** at 10:45 ET on class day (Marlon: "can you work as the orchestrator fot he tdm155ai week 7 repo?"). Found: the app and resource sheets (`4c941be`, `5d6295d`), Codex's board and task A brief (`dc3d7c3`), no `utils/`, no agents running that the repo shows.
- **Did:** wrote this file and the board's rules, split A into A1 (sync utility) and A2 (switcher), added B (carry `utils/` forward from week 6) and C (editing utilities, a proposal for Marlon to cut down).
