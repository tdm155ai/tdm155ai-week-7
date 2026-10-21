// The shared media layer: everything the tools read and write lives in the gitignored _media/ folder at the repo root
// (beside nextjs/), and the browser sees it at /media/... (app/media/[...path]/route.js). Files stay on the machine
// running Next. Adapted from week 6's lib/media.mjs (tdm155ai-week-6 20b7487), itself from the Lab capture kit.
//
// Every address is a list of path parts under _media/, starting with an area: ["sources", "interview.mp4"],
// ["clips", "interview", "01-intro.mp4"], ["photos", "portrait.jpg"]. A part may not be empty or start with "."
// (no "..", no hidden files) or hold a slash or backslash, and nothing may resolve outside _media/, through a symlink
// either. The tools this week use three areas: sources/ (videos to cut), clips/ (what the trimmer exports), photos/.
//
// To change first: add a file type to `types` if a tool needs one; the size limit in writeMedia.
import { createReadStream, createWriteStream } from "node:fs";
import { lstat, mkdir, readdir, readFile, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export const mediaRoot = path.resolve(/* turbopackIgnore: true */ process.cwd(), "..", "_media");

// The file types the media layer lists and serves, by extension.
export const types = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif",
  ".mp4": "video/mp4", ".m4v": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm",
  ".wav": "audio/wav", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".aac": "audio/aac",
  ".json": "application/json",
};

// "image", "video", "audio", or "" for a filename, from its extension.
export function kindOf(name) {
  const mime = types[path.extname(name).toLowerCase()] || "";
  return ["image", "video", "audio"].find((kind) => mime.startsWith(kind + "/")) || "";
}

// Turn any text into a safe filename part: "Intro, take 2!" -> "intro-take-2".
export function safeName(text, fallback = "untitled") {
  const name = String(text).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return name || fallback;
}

// The /media/... address the browser uses for a file under _media/.
export function mediaSrc(segments) {
  return "/media/" + segments.map(encodeURIComponent).join("/");
}

// The absolute path for an address under _media/, or null if the address isn't allowed. Checks the parts only; use
// realMedia() before reading a file that may be a symlink.
export function resolveMedia(segments, root = mediaRoot) {
  if (!Array.isArray(segments) || !segments.length) return null;
  if (segments.some((part) => typeof part !== "string" || !part || part.startsWith(".") || /[\\/\0]/.test(part))) return null;
  const file = path.resolve(root, ...segments);
  return file.startsWith(root + path.sep) ? file : null;
}

// The absolute path of an existing file under _media/, after following symlinks, or null if it's missing, not a file,
// or really lives outside _media/. Give this path (never one built from user input) to ffmpeg and the like.
export async function realMedia(segments, root = mediaRoot) {
  const file = resolveMedia(segments, root);
  if (!file) return null;
  try {
    const canonicalRoot = await realpath(/* turbopackIgnore: true */ root);
    const canonicalFile = await realpath(/* turbopackIgnore: true */ file);
    if (!canonicalFile.startsWith(canonicalRoot + path.sep)) return null;
    return (await stat(/* turbopackIgnore: true */ canonicalFile)).isFile() ? canonicalFile : null;
  } catch {
    return null;
  }
}

// The folder for an address's file, created if needed, checked to be really inside _media/. Returns the absolute
// path the file should be written to.
async function prepareWrite(segments, root) {
  const file = resolveMedia(segments, root);
  if (!file) throw new Error("That isn't an allowed place in _media/.");
  await mkdir(/* turbopackIgnore: true */ path.dirname(file), { recursive: true });
  const canonicalRoot = await realpath(/* turbopackIgnore: true */ root);
  const canonicalDir = await realpath(/* turbopackIgnore: true */ path.dirname(file));
  if (canonicalDir !== canonicalRoot && !canonicalDir.startsWith(canonicalRoot + path.sep)) throw new Error("That folder leads outside _media/.");
  return path.join(canonicalDir, path.basename(file));
}

async function exists(file) {
  try { await lstat(/* turbopackIgnore: true */ file); return true; } catch { return false; }
}

// Write a file, from a Buffer/string or a web ReadableStream (a request body), and return { path, src, size }.
// With overwrite: false (the default) it refuses to replace a file. The bytes go to a temporary file first and are
// renamed into place, so a half-written file never shows, and an existing symlink is replaced rather than followed.
export async function writeMedia(segments, data, { overwrite = false, maxBytes = 4 * 1024 * 1024 * 1024, root = mediaRoot } = {}) {
  const file = await prepareWrite(segments, root);
  if (!overwrite && (await exists(file))) throw new Error(`_media/${segments.join("/")} already exists.`);
  const temp = path.join(path.dirname(file), `.partial-${randomUUID()}`);
  try {
    if (typeof data === "string" || Buffer.isBuffer(data) || data instanceof Uint8Array) {
      if (data.length > maxBytes) throw new Error("That file is too big.");
      await writeFile(/* turbopackIgnore: true */ temp, data, { flag: "wx" });
    } else {
      let size = 0;
      const source = Readable.fromWeb(data);
      source.on("data", (chunk) => { size += chunk.length; if (size > maxBytes) source.destroy(new Error("That file is too big.")); });
      await pipeline(source, createWriteStream(/* turbopackIgnore: true */ temp, { flags: "wx" }));
    }
    if (!overwrite && (await exists(file))) throw new Error(`_media/${segments.join("/")} already exists.`);
    await rename(/* turbopackIgnore: true */ temp, file);
  } catch (error) {
    await rm(/* turbopackIgnore: true */ temp, { force: true });
    throw error;
  }
  const info = await stat(/* turbopackIgnore: true */ file);
  return { path: `_media/${segments.join("/")}`, src: mediaSrc(segments), size: info.size };
}

// A temporary path beside an address, for a tool (ffmpeg) to write to before moveIntoPlace(). Ends in the address's
// own extension so the tool picks the right format.
export async function tempPathFor(segments, root = mediaRoot) {
  const file = await prepareWrite(segments, root);
  return path.join(path.dirname(file), `.partial-${randomUUID()}${path.extname(file)}`);
}

// Move a finished temporary file (from tempPathFor) to its address, replacing what's there.
export async function moveIntoPlace(temp, segments, root = mediaRoot) {
  const file = await prepareWrite(segments, root);
  await rename(/* turbopackIgnore: true */ temp, file);
  const info = await stat(/* turbopackIgnore: true */ file);
  return { path: `_media/${segments.join("/")}`, src: mediaSrc(segments), size: info.size };
}

// Read a file under _media/ as a Buffer (or a string, given an encoding), or null if it isn't there.
export async function readMedia(segments, encoding, root = mediaRoot) {
  const file = await realMedia(segments, root);
  return file ? readFile(/* turbopackIgnore: true */ file, encoding) : null;
}

// Read and write JSON beside the media (the trimmer's segment lists). readJson gives `fallback` if there's none.
export async function readJson(segments, fallback = null, root = mediaRoot) {
  const text = await readMedia(segments, "utf8", root);
  if (text === null) return fallback;
  try { return JSON.parse(text); } catch { return fallback; }
}

export async function writeJson(segments, value, root = mediaRoot) {
  return writeMedia(segments, JSON.stringify(value, null, 2) + "\n", { overwrite: true, root });
}

// The media files in an area (["sources"], or [] for all of _media/), newest first. Each item:
// { name, folder, segments, path, src, kind: "image"|"video"|"audio", size, modified }. With recursive: true it looks
// in the folders inside too. JSON files, hidden files, and files of unknown types are left out.
export async function listMedia(area = [], { recursive = false, kind = "", root = mediaRoot } = {}) {
  const start = Array.isArray(area) ? area : [area];
  const items = [];
  async function visit(segments) {
    const directory = segments.length ? resolveMedia(segments, root) : root;
    if (!directory) return;
    let entries;
    try { entries = await readdir(/* turbopackIgnore: true */ directory, { withFileTypes: true }); }
    catch (error) { if (error.code === "ENOENT" || error.code === "ENOTDIR") return; throw error; }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const parts = [...segments, entry.name];
      if (entry.isDirectory()) { if (recursive) await visit(parts); continue; }
      if (!entry.isFile()) continue;
      const fileKind = kindOf(entry.name);
      if (!fileKind || (kind && fileKind !== kind)) continue;
      const info = await stat(/* turbopackIgnore: true */ path.join(directory, entry.name));
      items.push({ name: entry.name, folder: segments.join("/"), segments: parts, path: `_media/${parts.join("/")}`, src: mediaSrc(parts), kind: fileKind, size: info.size, modified: info.mtimeMs });
    }
  }
  await visit(start.filter(Boolean));
  return items.sort((a, b) => b.modified - a.modified);
}

// The Response for GET /media/..., with HTTP range requests so a <video> can seek.
export async function mediaResponse(request, segments, root = mediaRoot) {
  const file = await realMedia(segments, root);
  const mime = file && types[path.extname(file).toLowerCase()];
  if (!mime) return new Response("Not found", { status: 404 });
  const info = await stat(/* turbopackIgnore: true */ file);
  const headers = { "Content-Type": mime, "Accept-Ranges": "bytes", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    const start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
    const end = match[1] && match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= info.size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    return new Response(Readable.toWeb(createReadStream(/* turbopackIgnore: true */ file, { start, end })), { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${info.size}`, "Content-Length": String(end - start + 1) } });
  }
  return new Response(Readable.toWeb(createReadStream(/* turbopackIgnore: true */ file)), { headers: { ...headers, "Content-Length": String(info.size) } });
}
