// The background remover's server side.
// GET /api/remove-bg: what's available here (rembg, ImageMagick, an OpenRouter key), the models, and the photos.
// POST /api/remove-bg { photo, method, ... }: makes a new PNG in _media/photos/ and returns it, with whether it really
// has transparency. Methods:
//   "rembg"  { rembgModel }          local and free: rembg cuts the subject out
//   "nano"   { model, backdrop }     Nano Banana on OpenRouter puts the subject on a flat color (costs money)
//   "flat"   { fuzz }                ImageMagick cuts a flat, one-color background out (finishes a Nano Banana result)
// The new background is added in the browser, and the result saved through PUT /api/photo.
//
// To change first: how results are named (outputName).
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { listMedia, realMedia, safeName, tempPathFor, writeMedia } from "../../../lib/media.mjs";
import { backdrops, cutoutPrompt, hasOpenRouterKey, nanoBananaModels, nearestRatio, runNanoBanana } from "../../../lib/openrouter.mjs";
import { alphaInfo, findRembg, flatCutout, hasMagick, magickInstall, rembg, rembgInstall, rembgModels, upright } from "./cutout.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// cat.jpg cut out with rembg -> cat-rembg.png (then cat-rembg-2.png …). A flat cut-out of cat-nano-banana.png -> cat-nano-banana-cutout.png.
function outputName(photo, method) {
  return `${safeName(path.parse(photo).name, "photo")}-${{ rembg: "rembg", nano: "nano-banana", flat: "cutout" }[method]}`;
}

async function saveNew(stem, bytes) {
  for (let n = 1; n < 1000; n += 1) {
    const name = n === 1 ? `${stem}.png` : `${stem}-${n}.png`;
    try { return { name, ...(await writeMedia(["photos", name], bytes)) }; }
    catch (error) { if (!/already exists/.test(error.message)) throw error; }
  }
  throw new Error("Too many files with that name.");
}

export async function GET() {
  const [rembgPath, magick, key, photos] = await Promise.all([findRembg(), hasMagick(), hasOpenRouterKey(), listMedia(["photos"], { kind: "image" })]);
  return Response.json({
    rembg: { available: Boolean(rembgPath), install: rembgInstall, models: rembgModels },
    magick: { available: magick, install: magickInstall },
    openrouter: { key, models: nanoBananaModels, backdrops: Object.keys(backdrops) },
    photos,
  });
}

export async function POST(request) {
  // This route can spend money (Nano Banana), so only this app's own pages may call it.
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") return Response.json({ error: "Use the background remover on this app." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Send JSON." }, { status: 415 });
  const { photo = "", method = "", rembgModel = rembgModels[0], model = nanoBananaModels[0].id, backdrop = "green", fuzz = 12 } = await request.json().catch(() => ({}));
  const input = await realMedia(["photos", String(photo)]);
  if (!input) return Response.json({ error: "There's no such photo in _media/photos/." }, { status: 404 });
  if (!(await hasMagick())) return Response.json({ error: `The background remover needs ImageMagick. Install it: ${magickInstall}` }, { status: 501 });

  const work = await tempPathFor(["photos", "work.png"]);
  const result = await tempPathFor(["photos", "result.png"]);
  try {
    let command = "";
    let cost = null;
    let note = "";
    if (method === "rembg") {
      const program = await findRembg();
      if (!program) return Response.json({ error: `rembg isn't installed. Install it once from a terminal: ${rembgInstall}`, install: rembgInstall }, { status: 501 });
      if (!rembgModels.includes(rembgModel)) return Response.json({ error: "Choose one of the listed rembg models." }, { status: 400 });
      await upright(input, work);
      await rembg(program, work, result, rembgModel);
      command = `rembg i -m ${rembgModel} _media/photos/${photo} _media/photos/<name>`;
    } else if (method === "nano") {
      if (!(await hasOpenRouterKey())) return Response.json({ error: "Add OPENROUTER_API_KEY to the .env file at the repo root (copy .env.example), then try again." }, { status: 501 });
      if (!backdrops[backdrop]) return Response.json({ error: "Choose a listed backdrop color." }, { status: 400 });
      const small = await tempPathFor(["photos", "send.jpg"]);
      try {
        await upright(input, small, 2048); // an upright JPEG, at most 2048 px, so the upload stays small
        const { width, height } = await alphaInfo(small);
        const made = await runNanoBanana({ model, prompt: cutoutPrompt(backdrop), image: small, aspect: nearestRatio(width, height), signal: request.signal });
        await upright(made.file, result);
        ({ command, cost } = made);
        note = made.text;
      } finally {
        await rm(small, { force: true });
      }
    } else if (method === "flat") {
      const amount = Number(fuzz);
      if (!(amount >= 0 && amount <= 60)) return Response.json({ error: "fuzz is a percentage from 0 to 60." }, { status: 400 });
      await flatCutout(input, result, amount);
      command = `magick _media/photos/${photo} -alpha set -fuzz ${amount}% -fill none -draw "color 0,0 floodfill" … (each corner) -channel A -blur 0x0.7 +channel _media/photos/<name>`;
    } else {
      return Response.json({ error: "method is rembg, nano, or flat." }, { status: 400 });
    }
    const info = await alphaInfo(result);
    const saved = await saveNew(outputName(photo, method), await readFile(result));
    return Response.json({ ...saved, ...info, method, command: command.replace("<name>", saved.name), cost, note });
  } catch (error) {
    return Response.json({ error: error.message, command: error.command }, { status: 502 });
  } finally {
    await rm(work, { force: true });
    await rm(result, { force: true });
  }
}
