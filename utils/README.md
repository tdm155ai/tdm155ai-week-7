# Generation scripts

The text, image, and video scripts: one command line for OpenRouter, fal, and Harvard's HUIT gateways (OpenAI, Gemini, and Claude through Bedrock; video on OpenRouter and fal only). Run them from the repo root, outside `nextjs/`. They need Node 22.12 or newer; the generation scripts and listers use no npm packages, and only the image compressor needs one (Sharp), installed with `pnpm install` at the repo root. The Next app has its own dependencies and commands in `nextjs/`.

## Set up your keys

If you do not already have a `.env` in this repo, copy the empty template:

```sh
cp .env.example .env
```

Open `.env` and fill in `OPENROUTER_API_KEY` and `FAL_API_KEY` (and `HUIT_API_KEY` if you have one) with the keys provided in class. If `.env` already exists, update it rather than replacing it. Keep keys out of prompts, pages, screenshots, and Slack. `.env` and `output/` are ignored by Git; `.env.example` contains no keys.

## Try it

Preview a request without sending it or using credits:

```sh
node utils/generate-text.mjs openrouter "Reply with the single word HELLO." --model openai/gpt-5-mini --dry-run
```

Remove `--dry-run` to send it. Each run saves its output and its request and response records in a new folder under `output/text/` or `output/image/`.

An image:

```sh
node utils/generate-image.mjs fal "a small red apple on a white background" --model fal-ai/flux/dev
```

A reference image goes in with `--ref FILE` (PNG, JPEG, or WebP; repeatable). On fal, pick an editing endpoint; it receives references as `image_urls`, or add `--ref-field image_url` for an endpoint that takes one. `--help` on any script lists its options.

A video (added 2026-10-14):

```sh
node utils/generate-video.mjs openrouter "a paper boat drifts across a puddle, close up, morning light" --model google/veo-3.1-lite --duration 4 --resolution 720p --aspect 16:9
node utils/generate-video.mjs fal "a paper boat drifts across a puddle, close up, morning light" --model fal-ai/ltx-2.3/text-to-video/fast --duration 6
```

Video is asynchronous on both providers: the script submits a job, saves a receipt in the run folder (`openrouter-request.json` or `fal-request.json`), polls until the clip is ready (half a minute to several minutes), downloads it as `video-01.mp4`, and prints the path. If the wait is interrupted, `--resume RECEIPT` picks the same job up again without paying twice. Image-to-video: give a first frame with `--ref frame.png` (sent as a data URL) or `--ref-url https://...`; on OpenRouter `--ref-field last_frame` or `reference` changes what the image is for, and on fal pick an `image-to-video` endpoint (`--ref-field image_urls` or `end_image_url` for endpoints that take those). `--duration`, `--resolution`, `--aspect`, `--audio true|false`, and `--seed` pass through; each model accepts its own set, which the listers show. Anything else goes in `--params-file` in the model's native schema.

[`examples.md`](examples.md) has a working command for every provider and model route, with the models that worked.

## Find a model

```sh
node utils/list-text-models.mjs
node utils/list-image-models.mjs
node utils/list-fal-models.mjs --category image-to-image
node utils/list-openrouter-models.mjs --type video
node utils/list-fal-models.mjs --category text-to-video
node utils/list-fal-models.mjs --category image-to-video
```

The video listing on OpenRouter shows each model's durations, resolutions, and aspect ratios, and `--json` shows its prices.

Model availability and accepted parameters change; the offline tests don't establish that a particular live model is available today.

## All the scripts

| Script | Purpose |
| --- | --- |
| `generate-text.mjs` | Text from `openrouter`, `fal`, `huit-openai`, `huit-gemini`, or `huit-bedrock`. |
| `generate-image.mjs` | Images from `openrouter`, `fal`, `huit-openai`, or `huit-gemini`, with optional reference images. |
| `generate-video.mjs` | Video from `openrouter` (the `/videos` jobs API) or `fal` (a video endpoint), from text or a first-frame or reference image; polls, downloads, resumable. |
| `batch-text.mjs` | Compare text responses across models. |
| `batch-images.mjs` | Compare one text prompt across models and build a local HTML gallery. |
| `list-openrouter-models.mjs`, `list-text-models.mjs`, `list-image-models.mjs`, `list-fal-models.mjs` | Browse model catalogues. |
| `stills.mjs` | Extract video frames; requires ffmpeg and ffprobe. |
| `compress-image.mjs` | Shrink a photo to a bounded JPEG (default 1536 px, 512 KB) for use as a reference image; never overwrites. Needs Sharp. |

Package shortcuts mirror the direct commands: `pnpm text` runs `node utils/generate-text.mjs`, `pnpm image` runs `node utils/generate-image.mjs`, `pnpm video` runs `node utils/generate-video.mjs`, `pnpm models` runs `node utils/list-image-models.mjs`, `pnpm stills` runs `node utils/stills.mjs`, and `pnpm compress-image` runs `node utils/compress-image.mjs`. Run the offline tests with `pnpm test` (or `node --test utils/test/*.test.mjs`).

## Provenance

Copied on 2026-10-07 from `tdm155ai-week-4/utils/`, without that week's gallery sync. Week 4 copied them unchanged from `tdm155ai-week-2/utils/`; the generation adapters originally came from the Learning Lab's `ai-lab-context-pack/utils/`, and the model listers, batches, and stills tool were developed for week 2. Week 2's transcription, transcript player, comic, image compression, and local server scripts were left out. This is a local copy, not a sync. No credentials or generated media were copied.

Copied again on 2026-10-14 into `tdm155ai-week-6`, unchanged, from The Notebook's `interface/utils/` (itself a copy of `tdm155ai-week-5/utils/` by way of `ai-lab-week-5`). Later that day `generate-video.mjs` was added for the week's AI video rotation: a `video` kind in the same providers/runtime/CLI library (OpenRouter's asynchronous `/videos` jobs with polling and authenticated download; fal's queue with the existing receipt and resume), `--type video` on the OpenRouter lister, and offline tests in `test/video.test.mjs`.

Copied again on 2026-10-21 into `tdm155ai-week-7` from `tdm155ai-week-6` at `1740c7a`, for the editing week: the generation scripts, listers, batches, stills tool, `lib/`, the offline tests, this README, and `examples.md`, unchanged. Left behind as week 6's own: the origin-story comic tools (`comic.mjs`, `lib/comic.mjs`, `lib/comic-viewer.mjs`, their test, and the `examples/` plan and script), which import from week 6's `.agents/skills/origin-story/` skill. `compress-image.mjs` and `lib/compress.mjs` came along as a general image tool, with a new offline test (`test/compress.test.mjs`) in place of the comic test that used to cover them. Week 7's editing tools are being built beside these in `utils/multicam/` and `utils/edit/`.
