---
task: C
title: Editing recipes — the family brief for C1 and C2
author: claude
status: Split into C1 (video and audio) and C2 (stills)
owns: nothing directly; see C1 and C2
depends_on: none
report: none (C1 and C2 report)
---

## Marlon's words

October 21: "in the usual ll-utilities folder I want some video editing scripts this time around. or at least editing skills. some things = normalize audio. compress footage. remove background of still. greenscreen key to put one video layer on top of another. these can be step by step demos that exist on the resource pages of the command line toool pages, and we can have copy-pastable claude prompts there."

"The usual ll-utilities folder" is this repo's `utils/` (as in weeks 5 and 6), which task B is bringing over from week 6.

## Every recipe has three forms

1. **A step-by-step demo on the tool's resource page** (`nextjs/content/resources/cli/<tool>.md`), as a new section near the top called "Demo: <what it does>": what you need, then each step as a command with one line on what it does and what to look for, then the check (how you know it worked), then **"Ask Claude"**: a copy-pastable prompt in a `text` code block that a student pastes into Claude Code with their own file names. Write the prompt so it makes Claude inspect the file first, work on a copy, write to `output/`, and show the command it ran. A small before/after still beside the doc (JPEG, under 200 KB) is welcome.
2. **A script** in `utils/edit/<name>.mjs`: plain Node ES module that shells out to ffmpeg / magick / rembg. Usage line and `--help`; inspects the input first; never overwrites the input; writes to `output/edit/`; prints the exact command it ran so a student can learn from it; exits with a clear message when a tool is missing (with the install line). If task B has landed `utils/lib/`, reuse its CLI helpers; otherwise keep the script self-contained and say so.
3. **A Claude skill** in `.agents/skills/<name>/SKILL.md`, linked from `.claude/skills/<name>` (relative symlink `../../.agents/skills/<name>`, as week 6 does for `origin-story`). Frontmatter `name` and a `description` that says when to use it in the words a student would use ("make this smaller", "the audio is too quiet", "cut out the background", "put me on a different background"). The body: inspect first, the decisions to ask about (target size, platform, color of the screen), run the script or the commands, check the result, report what was done. Point to the resource page's demo rather than repeating it.

Test with media the tests generate (ffmpeg `lavfi`: `testsrc2`, `color=green`, `sine`, `anoisesrc`; ImageMagick drawing for stills). Tests go in `utils/test/edit-<name>.test.mjs`, run with `node --test`. Don't commit test media.

Shared files no one in C edits: root `package.json` (list the script lines you want in your report), `utils/README.md` and `nextjs/content/resources/cli/README.md` (task E owns the CLI README; give it the link lines in your report), `AGENTS.md` (give the orchestrator the line you'd add).
