import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry } from "../../../lib/content.mjs";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import { DocsArticle, SidebarFolder } from "../../components/DocsSidebar.jsx";

// Read the Markdown on each request so edits and new files appear on refresh.
export const dynamic = "force-dynamic";

// content/resources/ as a docs site: every document in the folder, and in the folders inside it, listed in a sidebar
// (folders as headed groups), and the one you pick beside it. /resources shows resources/README.md. No previous/next
// pager: you move between documents with the sidebar.

async function find(params) {
  const { slug = [] } = await params;
  const resources = (await getEntry(["resources"]))?.entry;
  if (!resources) return null;
  if (!slug.length) return { resources, entry: resources, section: "resources" };
  const found = await getEntry(["resources", ...slug]);
  // The header highlights the group you're in (audio, video, images, cli); see Chrome.jsx.
  return found ? { resources, entry: found.entry, section: decodeURIComponent(slug[0]) } : null;
}

export async function generateMetadata({ params }) {
  const found = await find(params);
  return found ? { title: found.entry.title, description: found.entry.description } : {};
}

export default async function ResourcesPage({ params }) {
  const found = await find(params);
  if (!found) notFound();
  const { resources, entry } = found;

  return (
    <>
      <SiteHeader current={found.section} />
      <div className="docs-shell">
        <aside className="docs-sidebar">
          <Link className="eyebrow sidebar-title" href={resources.href} aria-current={entry === resources ? "page" : undefined}>{resources.title}</Link>
          <nav aria-label={`${resources.title} contents`}>
            <SidebarFolder folder={resources} current={entry.href} top />
            {resources.count === 0 && <p className="sidebar-empty">Nothing here yet.</p>}
          </nav>
        </aside>
        <main id="main" className="docs-main">
          <DocsArticle entry={entry} eyebrow={entry === resources ? "Resources" : entry.eyebrow} />
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
