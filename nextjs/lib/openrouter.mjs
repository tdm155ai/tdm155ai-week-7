// Nano Banana (Google's Gemini image models) on OpenRouter, for the photo tools. The app doesn't call OpenRouter
// itself: it runs utils/generate-image.mjs, the same script you can run from the repo root, as a child process, and
// shows you the command. The script reads OPENROUTER_API_KEY from the repo's root .env; the key never reaches the
// browser, and nothing here ever returns it.
//
// To change first: the model list (prices go stale; check https://openrouter.ai/api/v1/images/models), and
// cutoutPrompt() / editPrompt(), the words sent with your photo.
import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const repoRoot = path.resolve(/* turbopackIgnore: true */ process.cwd(), "..");
const script = path.join(repoRoot, "utils", "generate-image.mjs");

// The Nano Banana models, cheapest first. IDs and prices from OpenRouter's catalog on 2026-10-21
// (https://openrouter.ai/api/v1/models and /api/v1/images/models/<id>/endpoints). Prices are dollars per million
// image-output tokens; what one image costs depends on its size, so the page shows the real cost after each call.
export const nanoBananaModels = [
  { id: "google/gemini-3.1-flash-lite-image", name: "Nano Banana 2 Lite", perMillion: 30 },
  { id: "google/gemini-nano-banana-2.1", name: "Nano Banana 2.1", perMillion: 30 },
  { id: "google/gemini-2.5-flash-image", name: "Nano Banana (the original)", perMillion: 30 },
  { id: "google/gemini-3.1-flash-image", name: "Nano Banana 2", perMillion: 60 },
  { id: "google/gemini-3-pro-image", name: "Nano Banana Pro", perMillion: 120 },
];

// Aspect ratios every model above accepts. The photo's own shape is matched to the nearest one.
const ratios = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"];
export function nearestRatio(width, height) {
  const target = Math.log(width / height);
  return ratios.reduce((best, ratio) => {
    const [a, b] = ratio.split(":").map(Number);
    return Math.abs(Math.log(a / b) - target) < Math.abs(Math.log(best.split(":")[0] / best.split(":")[1]) - target) ? ratio : best;
  });
}

// The flat backdrop Nano Banana is asked to put the subject on. Its output has no transparency (none of these
// endpoints takes `background: transparent`), so the page cuts the flat color out afterwards with ImageMagick.
export const backdrops = { green: "pure green (#00FF00)", magenta: "pure magenta (#FF00FF)", white: "pure white (#FFFFFF)", black: "pure black (#000000)" };

export function cutoutPrompt(backdrop = "green") {
  return `Remove the background from this photo. Keep the main subject exactly as it is: the same pose, size, position, framing, colors, and detail, with clean edges. Replace everything else with a solid, perfectly flat ${backdrops[backdrop] || backdrops.green} background: no shadows, no gradient, no texture, no checkerboard.`;
}

export function editPrompt(request) {
  return `Edit this photo: ${request.trim()}. Keep everything else about the photo the same.`;
}

// Is there an OpenRouter key, in the environment or the root .env? (Yes or no only.)
export async function hasOpenRouterKey() {
  if (process.env.OPENROUTER_API_KEY?.trim()) return true;
  try {
    const env = await readFile(/* turbopackIgnore: true */ path.join(repoRoot, ".env"), "utf8");
    return /^\s*(?:export\s+)?OPENROUTER_API_KEY\s*=\s*['"]?[^\s'"#]+/m.test(env);
  } catch {
    return false;
  }
}

// How a command reads in a terminal at the repo root: node utils/generate-image.mjs openrouter … with quotes where needed.
function shellLine(args) {
  return ["node", ...args].map((arg) => (/^[\w@%+=:,./-]+$/.test(arg) ? arg : `'${arg.replaceAll("'", "'\\''")}'`)).join(" ");
}

// Send one photo and a prompt to a Nano Banana model through utils/generate-image.mjs. `image` is an absolute path
// (from realMedia or a temporary file). Resolves to { command, file, cost, text, outDir }: `file` is the image it
// made, in the run folder under output/photo-tools/, and `cost` is what OpenRouter charged in dollars (or null).
export function runNanoBanana({ model, prompt, image, aspect, signal }) {
  if (!nanoBananaModels.some((item) => item.id === model)) return Promise.reject(new Error("Choose one of the listed Nano Banana models."));
  const outDir = path.join(repoRoot, "output", "photo-tools", `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`);
  const args = [path.relative(repoRoot, script), "openrouter", "--model", model, "--ref", path.relative(repoRoot, image), ...(aspect ? ["--aspect", aspect] : []), "--out", path.relative(repoRoot, outDir), "--", prompt];
  const command = shellLine(args);
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env }, signal });
    let output = "";
    child.stdout.on("data", (chunk) => { output = (output + chunk).slice(-4000); });
    child.stderr.on("data", (chunk) => { output = (output + chunk).slice(-4000); });
    child.on("error", reject);
    child.on("close", async (code) => {
      if (code !== 0) {
        const error = new Error(output.trim().split("\n").slice(-6).join("\n") || `generate-image exited with code ${code}.`);
        error.command = command;
        reject(error);
        return;
      }
      try {
        const files = await readdir(/* turbopackIgnore: true */ outDir);
        const image = files.find((name) => /^image-01\.(png|jpe?g|webp)$/.test(name));
        if (!image) throw new Error("The model answered without an image. See response.json in " + path.relative(repoRoot, outDir));
        let cost = null;
        let text = "";
        try { cost = JSON.parse(await readFile(/* turbopackIgnore: true */ path.join(outDir, "response.json"), "utf8")).usage?.cost ?? null; } catch {}
        try { text = (await readFile(/* turbopackIgnore: true */ path.join(outDir, "text.md"), "utf8")).trim(); } catch {}
        resolve({ command, file: path.join(outDir, image), cost, text, outDir: path.relative(repoRoot, outDir) });
      } catch (error) {
        error.command = command;
        reject(error);
      }
    });
  });
}
