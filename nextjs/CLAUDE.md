@AGENTS.md

# TDM 155AI week 7: the app

A Next app that renders the Markdown in `content/` (its README is the home page; `content/a/b.md` is `/a/b`) (`lib/content.mjs`). `/resources` (`app/resources/`) shows `content/resources/` as a docs site: every sheet in a sidebar, its folders (`audio/`, `video/`, `images/`, `cli/`) as headed groups, and the one you pick beside it, with no previous/next pager; it uses `app/components/DocsSidebar.jsx`. The header nav is Resources plus one link per group (`app/components/Chrome.jsx`), and the group you're in is highlighted. Every other file and folder renders through the catch-all `app/[...slug]/`. Images beside a doc are served by `app/context-media/`, and a light `/print` renders any page. Plain JavaScript and the app's own CSS throughout (`app/globals.css`); no TypeScript, Tailwind, or API keys. See the repo `README.md`.
