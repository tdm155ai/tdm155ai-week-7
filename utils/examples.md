# Verified commands

Every command below was run for real against its provider on 2026-09-16, with the root `.env` filled in (shown here without `--env-file`, since students keep their key file at the repo root). Costs are what the provider's own response reported; a blank cost means the provider did not report one, not that the call was free.

Copied from week 2 on 2026-10-07 without the transcription and transcript-player sections (those scripts aren't in this repo). The same day, the four text routes (openrouter, fal, huit-openai, huit-bedrock with `us.anthropic.claude-sonnet-5`) were run again from this repo and all answered.

## openrouter

```bash
node utils/generate-text.mjs openrouter "Reply with the single word HELLO." --model openai/gpt-5-mini
```

Worked. Model `openai/gpt-5-mini`. Cost reported: $0.0001775.

```bash
node utils/generate-image.mjs openrouter "a small red apple on a white background" --model black-forest-labs/flux.2-klein-4b
```

Worked. Model `black-forest-labs/flux.2-klein-4b`. Cost reported: $0.014.

```bash
node utils/generate-video.mjs openrouter "A paper boat drifts across a rain puddle on a city sidewalk, close up, soft morning light, gentle ripples" --model google/veo-3.1-lite --duration 4 --resolution 720p --aspect 16:9 --audio false
```

Worked (2026-10-14). Model `google/veo-3.1-lite` through OpenRouter's `/videos` jobs API: submitted, polled about a minute, downloaded a 4-second 1280×720 H.264 clip to `video-01.mp4`. Cost reported: $0.12.

```bash
node utils/generate-video.mjs openrouter "the lighthouse keeper in the yellow raincoat turns and walks away from the camera, slow handheld, soft light" --model google/veo-3.1-lite --duration 4 --resolution 720p --aspect 16:9 --audio false --ref output/image/<run>/image-01.jpg
```

Worked (2026-10-14). Image-to-video from a local still sent as a data URL in `frame_images` (`first_frame`); a 4-second 720p clip, about two minutes. Cost reported: $0.12.

```bash
node utils/list-openrouter-models.mjs --type video
```

Worked (no key). Thirty video models on 2026-10-14, each with its durations, resolutions, and aspect ratios; `--json` adds the prices.

## fal

```bash
node utils/generate-text.mjs fal "Reply with the single word HELLO." --model google/gemini-2.5-flash-lite
```

Worked. `--model` is the language model inside fal's `fal-ai/any-llm` endpoint: `google/gemini-2.5-flash-lite`. Cost: not reported in `response.json`.

```bash
node utils/generate-image.mjs fal "a small red apple on a white background" --model fal-ai/flux/dev
```

Worked. Model (fal endpoint) `fal-ai/flux/dev`. Cost: not reported in `response.json`.

```bash
node utils/generate-video.mjs fal "A paper boat drifts across a rain puddle on a city sidewalk, close up, soft morning light, gentle ripples" --model fal-ai/ltx-2.3/text-to-video/fast --duration 6 --resolution 1080p --aspect 16:9 --audio false
```

Worked (2026-10-14). fal endpoint `fal-ai/ltx-2.3/text-to-video/fast` through the queue: receipt saved, polled under a minute, a 6-second 1920×1080 H.264 clip downloaded to `video-01.mp4`. Cost: not reported in `response.json`.

```bash
node utils/generate-image.mjs fal "character sheet: a young lighthouse keeper in a yellow raincoat, front view, full body, plain white background, soft studio light, illustration style" --model fal-ai/flux/schnell --aspect 16:9
node utils/generate-video.mjs fal "the lighthouse keeper in the yellow raincoat turns and walks away from the camera, slow handheld, soft light" --model fal-ai/ltx-2.3/image-to-video/fast --duration 6 --resolution 1080p --audio false --ref output/image/<run>/image-01.jpg
```

Worked (2026-10-14). Image-to-video from a local still: the JPEG goes up as a data URL in `image_url`, and a 6-second 1920×1080 clip came back. The saved `request.json` omits the image bytes.

```bash
node utils/list-fal-models.mjs --limit 20
```

Worked (no key). The first twenty text-to-image endpoints in fal's catalogue order; `--all` paged through 221 on 2026-09-16.

```bash
node utils/batch-images.mjs "a happy couple" --provider fal --models fal-ai/flux/schnell,fal-ai/nano-banana-2,openai/gpt-image-2,fal-ai/nano-banana-pro,fal-ai/flux/dev,openai/gpt-image-2.5/sunburst/text-to-image,fal-ai/flux-2-pro,openai/gpt-image-2.5/flare/text-to-image,fal-ai/nano-banana,fal-ai/flux-pro/v1.1,bytedance/seedream/v5/pro/text-to-image,fal-ai/flux-pro/v1.1-ultra,google/nano-banana-2-lite,fal-ai/flux-2/klein/9b,fal-ai/z-image/turbo,fal-ai/flux-lora,fal-ai/bytedance/seedream/v4.5/text-to-image,fal-ai/bytedance/seedream/v4/text-to-image,fal-ai/flux-2,xai/grok-imagine-image --n 1 --parallel 4
```

Worked. Twenty endpoints (the first twenty from the lister that day), one image each, all twenty returned, gallery built at `output/batches/<date>-a-happy-couple/index.html`. About two minutes. Cost: not reported by fal.

## huit-openai

```bash
node utils/generate-text.mjs huit-openai "Reply with the single word HELLO." --model gpt-5-mini
```

Worked. Model `gpt-5-mini` (response reports the pinned snapshot `gpt-5-mini-2025-08-07`). Cost: not reported.

```bash
node utils/generate-image.mjs huit-openai "a small red apple on a white background" --model gpt-image-1-mini --size 1024x1024
```

Worked. Model `gpt-image-1-mini`, `--size 1024x1024`. Cost: not reported (usage token counts only).

## huit-gemini

```bash
node utils/generate-text.mjs huit-gemini "Reply with the single word HELLO." --model gemini-2.5-flash
```

Worked. Model `gemini-2.5-flash`. Cost: not reported.

```bash
node utils/generate-image.mjs huit-gemini "a small red apple on a white background" --model gemini-2.5-flash-image
```

Worked. Model `gemini-2.5-flash-image`. Cost: not reported.

## huit-bedrock

Claude through Harvard's Bedrock gateway. The model id is the Bedrock inference-profile id, which `ll-huit bedrock models` (in `apps/ll-utilities`) lists in full. These six were verified on 2026-09-16 with "Reply with the single word HELLO.":

```bash
node utils/generate-text.mjs huit-bedrock "Reply with the single word HELLO." --model us.anthropic.claude-sonnet-5
```
```bash
node utils/generate-text.mjs huit-bedrock "Reply with the single word HELLO." --model us.anthropic.claude-opus-5
```
```bash
node utils/generate-text.mjs huit-bedrock "Reply with the single word HELLO." --model us.anthropic.claude-haiku-4-5-20251001-v1:0
```
```bash
node utils/generate-text.mjs huit-bedrock "Reply with the single word HELLO." --model claude-fable-5
```

Also worked: `global.anthropic.claude-sonnet-5`, `global.anthropic.claude-opus-5`, `us.anthropic.claude-sonnet-4-6`. `claude-fable-5` is a shortcut the script expands to `global.anthropic.claude-fable-5` on the native Invoke route; every other id goes through the Converse route. Cost: not reported by the gateway.

Known not to work: `us.anthropic.claude-haiku-4-5` (HTTP 400) and `us.anthropic.claude-3-5-haiku-20241022-v1:0` (HTTP 404). The gateway wants the exact profile id; older Claude ids carry a date and `-v1:0` suffix, the Claude 5 ids do not. Images are not bundled for this gateway; use huit-openai or huit-gemini.

## Every route, at a glance

| route | kind | worked? | model | cost reported |
| --- | --- | --- | --- | --- |
| openrouter | text | yes | openai/gpt-5-mini | $0.0001775 |
| openrouter | image | yes | black-forest-labs/flux.2-klein-4b | $0.014 |
| fal | text | yes | google/gemini-2.5-flash-lite (via fal-ai/any-llm) | not reported |
| fal | image | yes | fal-ai/flux/dev | not reported |
| huit-openai | text | yes | gpt-5-mini | not reported |
| huit-openai | image | yes | gpt-image-1-mini | not reported |
| huit-gemini | text | yes | gemini-2.5-flash | not reported |
| huit-gemini | image | yes | gemini-2.5-flash-image | not reported |
| huit-bedrock | text | yes | us.anthropic.claude-sonnet-5, us.anthropic.claude-opus-5, us.anthropic.claude-haiku-4-5-20251001-v1:0, claude-fable-5 | not reported |
| huit-bedrock | image | not bundled | n/a | n/a |
