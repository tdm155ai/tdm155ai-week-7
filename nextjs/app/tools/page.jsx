import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import "./tools.css";

export const metadata = { title: "Tools" };

// The Tools tab: one card per tool. To add a tool, give it a folder in app/tools/ and add a line to this list.
// Each tool is a starter meant to be forked: copy its folder (and its app/api/ folder) and ask Claude to change it.
const tools = [
  { href: "/tools/trimmer", title: "Trimmer", copy: "Mark a whole set of segments in a video, name them, and export each one as its own clip into _media/clips/." },
];

export default function ToolsPage() {
  return (
    <>
      <SiteHeader current="tools" />
      <main id="main" className="tools-main">
        <p className="eyebrow">Editing · Tools</p>
        <h1>Tools</h1>
        <p className="tools-lede">Small editing tools that run on your own machine. Your media stays in the app's gitignored <code>_media/</code> folder. Each one is a starter: copy it into your own app and change it with Claude.</p>
        <div className="tools-grid">
          {tools.map((tool) => <Link key={tool.href} href={tool.href}><strong>{tool.title}</strong><span>{tool.copy}</span></Link>)}
        </div>
        <p className="tools-links"><Link href="/resources/tools/trimmer">How the trimmer works, and how to fork it</Link><Link href="/resources/cli/ffmpeg">ffmpeg</Link></p>
      </main>
      <SiteFooter />
    </>
  );
}
