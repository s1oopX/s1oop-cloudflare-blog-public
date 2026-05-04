# s1oop Cloudflare Blog Public

[中文](../README.md) | [English](README.en.md)

[![Astro](https://img.shields.io/badge/Astro-6-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![Release](https://img.shields.io/github/v/release/s1oopX/s1oop-cloudflare-blog-public?display_name=tag)](https://github.com/s1oopX/s1oop-cloudflare-blog-public/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-111827.svg)](../LICENSE)

Sanitized public source for the s1oop Cloudflare blog. The project uses a **GitHub-driven source and deployment flow with Cloudflare as the runtime platform**: GitHub handles version control and Pages build triggers, while Cloudflare Pages / Functions / D1 handle hosting, APIs, and content storage.

The repository keeps two major lines: `v1` is the original static public copy, and `v2` is the current Cloudflare D1 runtime architecture.

Live site: <https://s1oop.bbroot.com>

Engineering notes: [docs/engineering.md](engineering.md).

## Version Selection

| Version | Branch / Tag | Content model | Best for |
| --- | --- | --- | --- |
| v1 Static Public Copy | `v1-static` / `v1.0.0` | Markdown lives in Git and Astro generates static article pages | Reading the old static blog implementation |
| v2 Runtime Architecture | `main`, `v2-runtime` / `v2.0.0` | Posts live in Cloudflare D1 and are read through Worker APIs | Reading the current production architecture |

`main` points to v2 by default. The old version is preserved through the `v1-static` branch and the `v1.0.0` release.

## Purpose

This repository opens the architecture and implementation without exposing production content.

In v2, Git stores page shells, styles, scripts, Worker APIs, D1 migrations, and documentation. Article Markdown, uploaded images, comments, and runtime settings live in D1.

## Cloudflare + GitHub Driven

v2 is designed to keep the personal blog stack small and clear:

- GitHub: source repository, version branches, releases, and Cloudflare Pages build triggers.
- Cloudflare Pages: static page shell hosting.
- Cloudflare Pages Functions / Workers: unified `/api/*` runtime.
- Cloudflare D1: posts, uploaded small images, comments, and runtime settings.
- No standalone Node service, traditional database server, or required object storage is needed. R2 can be added later, but it is not required by the current architecture.
- New posts are not written back to GitHub. GitHub stores code and deployment history only.
- Worker and browser modules stay as lightweight JavaScript / ESM. TypeScript is used where Astro-side helper modules benefit from stronger type boundaries, not to chase language statistics.

## Architecture

```text
GitHub
  source + branches + releases
        |
        v
Cloudflare Pages
  Astro page shells
        |
        v
Pages Functions / workers/api.js
        |
        v
Cloudflare D1
  blog_posts / blog_assets / blog_comments / site_settings
```

Core routes:

- `/blog`: static archive shell hydrated from `/api/posts`.
- `/blog/live?slug=...`: runtime article reader.
- `/collections`, `/search`, home entry, and recommendations: shared runtime post API.
- `/s1oop`, `/s1oop/admin`: private publishing entry and admin structure.
- `/api/assets/*`: small image assets served from D1.

## Project Structure

```text
functions/api/[[path]].js   Pages Functions entry
migrations/                 D1 schema
public/scripts/             Browser runtime scripts
src/pages/                  Page shells and private admin pages
src/scripts/admin/          Admin frontend modules
src/styles/                 Page, reading, admin, and global styles
workers/api.js              Worker router
workers/lib/                Worker business modules
wrangler.jsonc              Example config with placeholder D1 binding
```

## Quick Start

```sh
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:4322
```

Common commands:

```sh
npm run dev      # Astro + local API shim + proxy
npm run build    # Astro production build
npm run preview  # Preview built site
```

The local API shim does not emulate D1. Features that require a real `BLOG_DB`, such as publishing, post listing, D1 image serving, and comment settings, should be tested in Cloudflare Pages Functions or a Wrangler environment.

## D1 Runtime Publishing

Create the database and apply the schema:

```sh
npx wrangler d1 create s1oop-blog-content
npx wrangler d1 execute s1oop-blog-content --file migrations/0001_runtime_posts.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0002_blog_assets.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0003_site_settings.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0004_runtime_post_search_text.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0005_blog_comments.sql
```

Configure:

```text
BLOG_DB          Cloudflare D1 binding
ADMIN_PASSWORD   Private admin password
SITE_URL         Optional canonical URL
```

`POST /api/admin/posts` accepts Markdown and optional images. The Worker parses frontmatter, renders HTML, extracts search text and reading stats, then writes the post to D1.

## API Surface

- Public: `GET /api/posts`, `GET /api/posts/:slug`, `GET /api/assets/*`, `GET /api/comments`, `POST /api/comments`
- Admin: `/api/admin/check`, `/api/admin/posts`, `/api/admin/assets/orphans`, `/api/admin/comments`, `/api/admin/settings`

## Deployment

Recommended Cloudflare Pages settings:

```text
Build command: npm run build
Build output directory: dist
Production branch: main
Node.js version: 22
```

`functions/api/[[path]].js` routes `/api/*` to `workers/api.js`. The `database_id` in `wrangler.jsonc` is a placeholder and should be replaced with your own D1 database ID before direct Worker deployment.

## Public Boundary

Included:

- Runtime architecture code and frontend page shells
- D1 schema migrations
- Worker / Pages Functions route structure
- Private publishing flow code structure
- Cloudflare config examples with placeholders

Excluded:

- Production D1 data
- Real article Markdown and uploaded images
- `.dev.vars`, `.env`, tokens, passwords, sessions, and logs
- Real Cloudflare account IDs or production binding IDs
- Private drafts and unpublished content

## Contributing

Bug fixes, accessibility improvements, documentation fixes, local development fixes, and focused UI refinements that match the existing design language are welcome.

Before submitting a change:

```sh
npm run build
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) and [SECURITY.md](../SECURITY.md).

## License

Code is released under the [MIT License](../LICENSE). Article content and images remain copyright of their respective author unless a post or asset states otherwise.
