---
task: A
title: Audio-based multicamera sync and camera switcher
description: Handoff for finding sync within user-named audio windows and cutting between synchronized cameras.
author: codex
date: 2026-10-21
status: Brief drafted; not implemented
owns: Proposed utils/multicam/ and nextjs/app/multicam/; confirm integration files before implementation
depends_on: Local FFmpeg and ffprobe; analysis dependency to be chosen
report: ../reports/A-multicam.md
thread_id: 01a15e27-4b1c-7261-be6f-4945b70223ad
started_in: /Users/mk/Development/mk-27/apps/the-notebook
resume: codex resume 01a15e27-4b1c-7261-be6f-4945b70223ad
---

# A. Multicamera sync and switching

## Marlon's request

Recorded from the October 21 voice-planning conversation; this paragraph paraphrases his request. Students may have multiple camera recordings without matching timecode. They should be able to tell Claude where to look for a clap in each recording—for example, between two and three minutes in one file and five and seven minutes in another—and have Claude find the precise synchronization points and provide synchronized footage. He wants this workflow available through Claude. He proposed a webview camera switcher to make choosing camera cuts easy. His latest request is to capture this as a handoff, using yesterday's chatbot-experiments orchestration pattern.

## Proposed implementation (Codex; not yet built or adopted as a fixed design)

### Claude-operated sync utility

- Inspect the source files with ffprobe. Accept one search window per camera, expressed in source-file time, plus a reference camera or audio recording.
- Extract only the requested audio windows for initial analysis, using a common sample rate and mono analysis copies. Account for each window's starting position and the source stream timestamps when mapping results back to source media.
- Detect candidate transients and compare surrounding audio to establish that they represent the same event. A loudest-peak match alone is insufficient. Cross-correlation is a candidate method, with dependency and algorithm choices left to implementation.
- Report exact source-event positions, relative offsets, and evidence of match quality. When ambiguous, show candidates or request narrower windows rather than silently choosing one.
- Save a readable sync manifest. Define one offset convention explicitly, for example `timelineTime = sourceTime + offsetSeconds`, and test both positive and negative offsets. Preserve the original audio/video relationship within each source.
- Produce a short synchronized preview around the shared event for human checking. Save full aligned derivatives only when requested; the manifest and preview can be the initial delivery.
- For long takes, check an additional shared event near the end before claiming whole-take sync. Report drift separately; automatic drift correction can follow the first MVP. Missing common audio should produce a clear limitation and a manual sync option.

### Camera-switcher webview

- Load a saved session/manifest with browser-compatible preview proxies; keep originals for rendering. Decide the local media-serving mechanism before implementation. Do not expose arbitrary filesystem paths through a web endpoint.
- Show all synchronized camera views on one shared timeline, with unavailable camera ranges visible. Use one selected master audio track continuously.
- Let students click a camera or use number keys to record camera selections at timeline times. Provide playback, seeking, and editing/removal of existing cuts.
- Save a cut list independently from the media. Reloading the session must restore sync, master audio, and cuts.
- Browser preview synchronization requires active coordination of seeks, buffering, playback, and drift; starting several video elements together is not sufficient. Final timing comes from the manifest and cut list, not browser event timing alone.
- Render the cut list locally through FFmpeg against the originals. Define behavior for gaps and camera ranges before rendering. Arbitrary frame-accurate cuts generally need decoding/re-encoding; do not promise stream-copy precision at non-keyframes.

### Delivery contract to define first

A session contains source IDs and local media references, source timing metadata, sync offsets and evidence, proxy references, a master audio selection, and ordered camera cuts on the shared timeline. Specify units, offset signs, time origin, valid ranges, and schema version. Keep analysis, preview, editing decisions, and final rendering independently runnable so Claude can inspect and explain each step.

## Suggested build sequence

1. Define the manifest and cut-list format; implement file inspection and bounded-window analysis.
2. Demonstrate sync and a short check preview on two files, with a report explaining the measured offset.
3. Add the webview and editable camera cuts using that same manifest.
4. Render from originals and compare the result with the intended cuts and master audio.

These are proposed implementation steps, not a record of completed workshop activities. A developer should review the current FFmpeg documentation and installed capabilities when implementing; no command recipes or algorithm have been validated in this handoff.

## Acceptance checks

- A known-offset two-camera fixture is recovered from different user-specified windows, including nonzero source timestamps and either offset sign.
- Ambiguous or absent claps do not produce an unqualified success; check actual overlapping sound as well as synthetic fixtures.
- A short rendered preview is visibly and audibly synchronized, and long-take drift is either checked or explicitly unverified.
- Switching preserves continuous master audio, survives seeking and session reload, and handles unavailable camera ranges deliberately.
- Final render follows the saved cuts to the chosen output-frame precision; originals remain unchanged. Report actual browser and media checks, separately from unit tests.

## Open choices for implementation

Analysis runtime/dependencies; session storage and media serving; proxy settings; master audio selection; gap behavior; manual offset adjustment; whether eventual interchange with Final Cut or another editor is useful. Start with a local two-camera MVP. None of these choices requires settling the full workshop run of show.

## Handoff provenance

Codex thread `01a15e27-4b1c-7261-be6f-4945b70223ad`, started in `/Users/mk/Development/mk-27/apps/the-notebook`. Resume there with `codex resume 01a15e27-4b1c-7261-be6f-4945b70223ad`. Reference pattern: The Notebook's `apps/mk-chatbot-experiments/_context/orchestration/README.md` and `tasks/AJ-agent-flow.md`. This handoff creates documentation only; no utilities, synchronization code, or switcher have been built.
