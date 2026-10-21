// The trimmer's server side. GET /api/trim?source=<file> probes a video in _media/sources/ and returns its saved
// segments. POST /api/trim { source, mode, segments } cuts each segment into _media/clips/<source-name>/<nn>-<name>.mp4
// and streams back one line of JSON per update (NDJSON), so the page can show progress clip by clip.
//
// To change first: where clips go (clipAddress) and the most segments one export may cut.
import { rm } from "node:fs/promises";
import path from "node:path";
import { listMedia, moveIntoPlace, readJson, realMedia, safeName, tempPathFor } from "../../../lib/media.mjs";
import { cutClip, probe } from "./ffmpeg.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SEGMENTS = 200;

// Where a source's clips go: _media/clips/<source name without extension>/<01>-<segment name>.mp4
function clipAddress(source, index, name) {
  return ["clips", safeName(path.parse(source).name, "source"), `${String(index + 1).padStart(2, "0")}-${safeName(name, "clip")}.mp4`];
}

export async function GET(request) {
  const source = new URL(request.url).searchParams.get("source") || "";
  if (!source) return Response.json({ sources: await listMedia(["sources"], { kind: "video" }) });
  const file = await realMedia(["sources", source]);
  if (!file) return Response.json({ error: "There's no such video in _media/sources/." }, { status: 404 });
  try {
    const info = await probe(file);
    const saved = await readJson(["sources", `${source}.segments.json`], {});
    return Response.json({ source, info, segments: Array.isArray(saved.segments) ? saved.segments : [] });
  } catch (error) {
    return Response.json({ error: `ffprobe couldn't read it: ${error.message}` }, { status: 422 });
  }
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Send JSON." }, { status: 400 }); }
  const { source = "", mode = "fast", segments = [] } = body || {};
  const input = await realMedia(["sources", String(source)]);
  if (!input) return Response.json({ error: "There's no such video in _media/sources/." }, { status: 404 });
  if (!["fast", "exact"].includes(mode)) return Response.json({ error: "mode is fast or exact." }, { status: 400 });
  if (!Array.isArray(segments) || !segments.length || segments.length > MAX_SEGMENTS) return Response.json({ error: `Send 1 to ${MAX_SEGMENTS} segments.` }, { status: 400 });
  const cuts = segments.map((segment, index) => ({ index, name: String(segment?.name || `segment ${index + 1}`), start: Number(segment?.in), end: Number(segment?.out) }));
  const bad = cuts.find((cut) => !Number.isFinite(cut.start) || !Number.isFinite(cut.end) || cut.start < 0 || cut.end <= cut.start);
  if (bad) return Response.json({ error: `Segment ${bad.index + 1} needs an in point before its out point.` }, { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (message) => controller.enqueue(encoder.encode(JSON.stringify(message) + "\n"));
      for (const cut of cuts) {
        if (request.signal.aborted) break;
        const address = clipAddress(String(source), cut.index, cut.name);
        let temp;
        try {
          send({ index: cut.index, status: "working", progress: 0 });
          temp = await tempPathFor(address);
          let last = 0;
          await cutClip({
            input, start: cut.start, duration: cut.end - cut.start, output: temp, mode, signal: request.signal,
            onProgress: (progress) => { if (progress - last >= 0.05) { last = progress; send({ index: cut.index, status: "working", progress }); } },
          });
          const saved = await moveIntoPlace(temp, address);
          send({ index: cut.index, status: "done", progress: 1, ...saved });
        } catch (error) {
          if (temp) await rm(temp, { force: true });
          send({ index: cut.index, status: "failed", error: error.message });
        }
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}
