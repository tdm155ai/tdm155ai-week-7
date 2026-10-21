#!/usr/bin/env node
// Video from a text prompt, or from a first-frame or reference image, through OpenRouter's video jobs API or a fal
// video endpoint. Generation is asynchronous on both: the script submits, saves a receipt, polls until the job is
// done, and downloads the clip into a new run folder under output/video/. Resume an interrupted run from its
// receipt with --resume; nothing is ever resubmitted automatically.
import {run} from './lib/cli.mjs';
run('video').catch(error => { console.error(error.message); process.exitCode = 1; });
