import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import PhotoEditor from "./PhotoEditor.jsx";
import "../tools.css";
import "./photo.css";

// /tools/photo: the page around the photo editor (PhotoEditor.jsx). ?photo=<file> opens that photo.
export const metadata = { title: "Photo editor" };
export const dynamic = "force-dynamic";

export default async function PhotoPage({ searchParams }) {
  const { photo = "" } = await searchParams;
  return (
    <>
      <SiteHeader current="tools" />
      <main id="main" className="tools-main">
        <p className="eyebrow"><Link href="/tools">Tools</Link> · Photo editor</p>
        <h1>Photo editor</h1>
        <p className="tools-lede">Crop, turn, resize, and adjust a photo, then save it as a new file in <code>_media/photos/</code>. It all happens in your browser; the original is never changed. <Link className="pe-doclink" href="/resources/tools/photo">How it works, and how to fork it</Link></p>
        <PhotoEditor initialPhoto={photo} />
      </main>
      <SiteFooter />
    </>
  );
}
