import Link from "next/link";
import { site } from "../../lib/content.mjs";

// `current` marks the section you're on: "resources", "audio", "video", "images", "cli", "tools", or nothing.
const sections = [
  ["resources", "/resources", "Resources"],
  ["audio", "/resources/audio", "Audio"],
  ["video", "/resources/video", "Video"],
  ["images", "/resources/images", "Images"],
  ["cli", "/resources/cli", "Command line"],
  ["tools", "/tools", "Tools"],
];

export function SiteHeader({ current = "" }) {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/">
        {site.title} <span>{site.label}</span>
      </Link>
      <nav aria-label="Main navigation">
        {sections.map(([key, href, label]) => <Link key={key} href={href} aria-current={current === key ? "page" : undefined}>{label}</Link>)}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/">{site.title}</Link>
      <span>{site.term}</span>
    </footer>
  );
}
