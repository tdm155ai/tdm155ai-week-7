// PUT /api/trim/segments { source, segments }: saves a source's segment list beside it, as
// _media/sources/<source>.segments.json, so a reload brings it back. The page calls this after every change.
import { realMedia, writeJson } from "../../../../lib/media.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Send JSON." }, { status: 400 }); }
  const source = String(body?.source || "");
  if (!(await realMedia(["sources", source]))) return Response.json({ error: "There's no such video in _media/sources/." }, { status: 404 });
  if (!Array.isArray(body.segments)) return Response.json({ error: "segments must be a list." }, { status: 400 });
  const segments = body.segments.slice(0, 500).map((segment) => ({
    name: String(segment?.name || "").slice(0, 120),
    in: Number(segment?.in) || 0,
    out: Number(segment?.out) || 0,
  }));
  await writeJson(["sources", `${source}.segments.json`], { source, updated: new Date().toISOString(), segments });
  return Response.json({ saved: segments.length });
}
