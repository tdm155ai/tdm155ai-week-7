import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import RemoveBg from "./RemoveBg.jsx";
import "../tools.css";
import "./remove-bg.css";

// /tools/remove-bg: the page around the background remover (RemoveBg.jsx). ?photo=<file> opens that photo.
export const metadata = { title: "Background remover" };
export const dynamic = "force-dynamic";

export default async function RemoveBgPage({ searchParams }) {
  const { photo = "" } = await searchParams;
  return (
    <>
      <SiteHeader current="tools" />
      <main id="main" className="tools-main">
        <p className="eyebrow"><Link href="/tools">Tools</Link> · Background remover</p>
        <h1>Background remover</h1>
        <p className="tools-lede">Cut the subject out of a photo, check the edges, and put it on a new background. Results go to <code>_media/photos/</code> as new files; the original is never changed. <Link className="rb-doclink" href="/resources/tools/remove-bg">How it works, and how to fork it</Link></p>
        <RemoveBg initialPhoto={photo} />
      </main>
      <SiteFooter />
    </>
  );
}
