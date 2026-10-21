import Link from "next/link";
import { listMedia } from "../../../lib/media.mjs";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import Trimmer from "./Trimmer.jsx";
import "../tools.css";
import "./trimmer.css";

// /tools/trimmer: lists the videos in _media/sources/ and hands them to the Trimmer (Trimmer.jsx), which does the
// rest in the browser. The cutting happens in app/api/trim/. ?source=<file> opens that video.
export const metadata = { title: "Trimmer" };
export const dynamic = "force-dynamic";

export default async function TrimmerPage({ searchParams }) {
  const { source = "" } = await searchParams;
  const sources = (await listMedia(["sources"], { kind: "video" })).map((item) => item.name);
  return (
    <>
      <SiteHeader current="tools" />
      <main id="main" className="tools-main">
        <p className="eyebrow"><Link href="/tools">Tools</Link> · Trimmer</p>
        <h1>Trimmer</h1>
        <p className="tools-lede">Pick a video, mark the segments you want, and export each one as its own clip. Clips go to <code>_media/clips/</code>. <Link className="trim-doclink" href="/resources/tools/trimmer">How it works, and how to fork it</Link></p>
        <Trimmer initialSources={sources} initialSource={sources.includes(source) ? source : sources[0] || ""} />
      </main>
      <SiteFooter />
    </>
  );
}
