// Serves files from the gitignored _media/ folder at /media/..., with range requests so videos seek.
// Everything is in lib/media.mjs; this file only connects the address to it.
import { mediaResponse } from "../../../lib/media.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { path: segments = [] } = await params;
  return mediaResponse(request, segments);
}
