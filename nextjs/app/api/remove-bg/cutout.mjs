// The local tools behind the background remover: rembg (a Python CLI with small segmentation models; it runs on your
// machine, free, and downloads a model the first time) and ImageMagick (for cutting out a flat, one-color background).
// Programs are started with spawn() and an argument array, never a shell string.
//
// To change first: rembgModels, and the flat cut-out's fuzz and softening in flatCutout().
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const rembgInstall = "uv tool install --python 3.13 'rembg[cpu,cli]==2.0.85'";
export const magickInstall = "brew install imagemagick";

// Local rembg models, smallest first. u2netp is small and quick; the others are larger downloads and often cleaner.
export const rembgModels = ["u2netp", "isnet-general-use", "birefnet-general-lite", "bria-rmbg"];

// Run a program; resolve with what it printed, or reject with the end of its error output.
export function run(program, args, { signal } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, { stdio: ["ignore", "pipe", "pipe"], signal });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-6000); });
    child.on("error", (error) => reject(error.code === "ENOENT" ? new Error(`${program} isn't installed.`) : error));
    child.on("close", (code) => (code === 0 ? resolve(stdout.trim()) : reject(new Error(stderr.trim().split("\n").slice(-5).join("\n") || `${program} exited with code ${code}.`))));
  });
}

// Where rembg is: $REMBG, then PATH, then ~/.local/bin (where `uv tool install` puts it). null if not installed.
export async function findRembg() {
  const places = [process.env.REMBG, ...(process.env.PATH || "").split(path.delimiter).map((dir) => path.join(dir, "rembg")), path.join(os.homedir(), ".local", "bin", "rembg")];
  for (const place of places.filter(Boolean)) {
    try { await access(/* turbopackIgnore: true */ place); return place; } catch {}
  }
  return null;
}

export async function hasMagick() {
  try { await run("magick", ["-version"]); return true; } catch { return false; }
}

// A copy of the photo turned upright (phones store a rotation flag that some tools ignore), as PNG or JPEG.
// maxSize shrinks it to fit within that many pixels on its longer side.
export function upright(input, output, maxSize) {
  return run("magick", [input, "-auto-orient", ...(maxSize ? ["-resize", `${maxSize}x${maxSize}>`] : []), "-colorspace", "sRGB", output]);
}

export function rembg(program, input, output, model) {
  return run(program, ["i", "-m", model, input, output]);
}

// Cut out a flat background: flood-fill transparency from the four corners, matching colors within `fuzz` percent,
// then soften only the edge of the alpha so it isn't jagged. Works when the background is one even color.
export function flatCutout(input, output, fuzz = 12) {
  return run("magick", [input, "-auto-orient", "-alpha", "set", "-fuzz", `${fuzz}%`, "-fill", "none",
    "-draw", "color 0,0 floodfill", "-draw", "color %[fx:w-1],0 floodfill", "-draw", "color 0,%[fx:h-1] floodfill", "-draw", "color %[fx:w-1],%[fx:h-1] floodfill",
    "-channel", "A", "-blur", "0x0.7", "+channel", output]);
}

// Does an image really have transparency? { width, height, opaque, transparent: the fraction of see-through pixels }.
export async function alphaInfo(file) {
  const [width, height, opaque] = (await run("magick", ["identify", "-format", "%w %h %[opaque]", file + "[0]"])).split(" ");
  const transparent = opaque === "True" ? 0 : Number(await run("magick", [file + "[0]", "-alpha", "extract", "-format", "%[fx:1-mean]", "info:"]));
  return { width: Number(width), height: Number(height), opaque: opaque === "True", transparent: Math.round(transparent * 1000) / 1000 };
}
