---
task: A2
title: The camera switcher webview, and rendering a cut list
author: claude
status: Waiting on A1
owns: nextjs/app/multicam/, utils/multicam/render*.mjs, utils/test/multicam-render*.test.mjs
depends_on: A1 (the manifest format and a working sync), F (the media layer: lib/media.mjs and the /media route, which answer the media-serving question below)
report: reports/A2-switcher.md
---

The orchestrator fills this in once A1 reports. The spec is the "Camera-switcher webview" section and build-sequence steps 3 and 4 of [A-multicam.md](A-multicam.md). Open questions to settle with Marlon before it starts: how the local app serves media without exposing arbitrary paths, proxy settings, and what a gap in camera coverage does.
