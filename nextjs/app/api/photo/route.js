// The photo tools' files. GET /api/photo lists the images in _media/photos/, newest first. PUT /api/photo?name=<file>
// with the image as the body saves it there as a new file (a name that's taken gets -2, -3 …), so nothing is ever
// overwritten: the editor saves its results this way, and both tools upload with it. iPhone HEIC/HEIF photos, which
// most browsers can't show, are converted to JPEG with macOS's sips.
//
// To change first: the allowed types (imageTypes) and the size limit.
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { listMedia, safeName, tempPathFor, writeMedia } from "../../../lib/media.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const imageTypes = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
const heicTypes = [".heic", ".heif"];
const MAX_BYTES = 60 * 1024 * 1024;

export async function GET() {
  return Response.json({ photos: await listMedia(["photos"], { kind: "image" }) });
}

// Write to _media/photos/<stem><ext>, or <stem>-2<ext>, -3 … if taken. `write(address)` does the writing.
async function saveUnique(stem, extension, write) {
  for (let n = 1; n < 1000; n += 1) {
    const name = n === 1 ? `${stem}${extension}` : `${stem}-${n}${extension}`;
    try {
      return { name, ...(await write(["photos", name])) };
    } catch (error) {
      if (!/already exists/.test(error.message)) throw error;
    }
  }
  throw new Error("Too many files with that name.");
}

function sips(input, output) {
  return new Promise((resolve, reject) => {
    const child = spawn("sips", ["-s", "format", "jpeg", input, "--out", output], { stdio: ["ignore", "ignore", "pipe"] });
    let errors = "";
    child.stderr.on("data", (chunk) => { errors += chunk; });
    child.on("error", () => reject(new Error("HEIC photos need macOS's sips to convert them. Export the photo as JPEG first.")));
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(errors.trim() || "sips couldn't convert that photo."))));
  });
}

export async function PUT(request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return Response.json({ error: "Upload from this app's own pages." }, { status: 403 });
  const original = new URL(request.url).searchParams.get("name") || "";
  const extension = path.extname(original).toLowerCase();
  const stem = safeName(path.parse(original).name, "photo");
  if (!request.body) return Response.json({ error: "The file was empty." }, { status: 400 });
  try {
    if (imageTypes.includes(extension)) {
      return Response.json(await saveUnique(stem, extension === ".jpeg" ? ".jpg" : extension, (address) => writeMedia(address, request.body, { maxBytes: MAX_BYTES })));
    }
    if (heicTypes.includes(extension)) {
      // Save the HEIC to a hidden temporary file, convert it to a temporary JPEG, save that, delete both temporaries.
      const heic = await tempPathFor(["photos", `${stem}${extension}`]);
      const jpeg = await tempPathFor(["photos", `${stem}.jpg`]);
      try {
        await pipeline(Readable.fromWeb(request.body), createWriteStream(heic));
        await sips(heic, jpeg);
        const bytes = await readFile(jpeg);
        const saved = await saveUnique(stem, ".jpg", (address) => writeMedia(address, bytes));
        return Response.json({ ...saved, converted: `${original} was converted to JPEG with sips.` });
      } finally {
        await rm(heic, { force: true });
        await rm(jpeg, { force: true });
      }
    }
    return Response.json({ error: `The photo tools take ${[...imageTypes, ...heicTypes].join(", ")} files.` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
