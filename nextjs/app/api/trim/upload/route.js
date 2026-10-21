// PUT /api/trim/upload?name=<filename> with the file as the body: saves a video into _media/sources/. The body is
// streamed to disk, so a big file never sits in memory. A name that's taken gets " 2", " 3" … added.
//
// To change first: which extensions are allowed (videoTypes).
import path from "node:path";
import { safeName, writeMedia } from "../../../../lib/media.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const videoTypes = [".mp4", ".m4v", ".mov", ".webm"];

export async function PUT(request) {
  const original = new URL(request.url).searchParams.get("name") || "";
  const extension = path.extname(original).toLowerCase();
  if (!videoTypes.includes(extension)) return Response.json({ error: `The trimmer takes ${videoTypes.join(", ")} files.` }, { status: 400 });
  if (!request.body) return Response.json({ error: "The file was empty." }, { status: 400 });
  const stem = safeName(path.parse(original).name, "video");
  for (let n = 1; n < 100; n += 1) {
    const name = n === 1 ? `${stem}${extension}` : `${stem}-${n}${extension}`;
    try {
      const saved = await writeMedia(["sources", name], request.body);
      return Response.json({ name, ...saved });
    } catch (error) {
      if (!/already exists/.test(error.message)) return Response.json({ error: error.message }, { status: 400 });
    }
  }
  return Response.json({ error: "Too many files with that name." }, { status: 409 });
}
