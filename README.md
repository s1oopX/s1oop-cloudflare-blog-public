# s1oop Cloudflare Blog Public

[![Astro](https://img.shields.io/badge/Astro-6-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![License: MIT](https://img.shields.io/badge/License-MIT-111827.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/s1oopX/s1oop-cloudflare-blog-public?display_name=tag)](https://github.com/s1oopX/s1oop-cloudflare-blog-public/releases)

Public source for the s1oop Cloudflare blog. This repository preserves the original static public copy as `v1` and publishes the current Cloudflare D1 runtime architecture as `v2`.

Live site: <https://s1oop.bbroot.com>

## Contents

- [Version Lines](#version-lines)
- [What This Repository Is](#what-this-repository-is)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Runtime Publishing](#runtime-publishing)
- [API Surface](#api-surface)
- [Deployment Notes](#deployment-notes)
- [Public Boundary](#public-boundary)
- [Contributing](#contributing)

## Version Lines

| Version | Branch | Tag | Content model | Best for |
| --- | --- | --- | --- | --- |
| v1 Static Public Copy | `v1-static` | `v1.0.0` | Markdown files in Git through Astro Content Collections | Studying the original static blog implementation |
| v2 Runtime Architecture | `main` / `v2-runtime` | `v2.0.0` | Cloudflare D1 posts served through Pages Functions / Worker APIs | Studying the current runtime publishing architecture |

`main` tracks the v2 runtime architecture. The old static implementation is intentionally kept on `v1-static` instead of being overwritten.

## What This Repository Is

This is a sanitized public copy of the blog source. It is intended to show how the project is structured, built, and deployed without exposing private content or production data.

In v2, Git stores source code, page shells, styles, scripts, migrations, and documentation. Public article content is stored in Cloudflare D1 and loaded at runtime.

## Architecture

```text
Astro static page shells
        |
        v
Cloudflare Pages
        |
        v
Pages Functions / workers/api.js
        |
        v
Cloudflare D1
  - blog_posts
  - blog_assets
  - blog_comments
  - site_settings
```

Key runtime behavior:

- `/blog` renders a static archive shell and hydrates D1 posts from `/api/posts`.
- `/blog/live?slug=...` reads one runtime post from `/api/posts/:slug`.
- `/collections`, `/search`, the home entry, and recommendations share the same runtime post API.
- `/s1oop` and `/s1oop/admin` provide the private publishing flow structure.
- Uploaded small images are stored in D1 `blog_assets` and served through `/api/assets/*`.

## Project Structure

```text
functions/api/[[path]].js   Pages Functions bridge into the shared Worker
migrations/                 D1 schema for posts, assets, settings, search, comments
public/scripts/             Browser runtime scripts for archive, search, comments, reader
src/components/             Astro UI components
src/pages/                  Static page shells and private admin routes
src/scripts/admin/          Private admin browser modules
src/styles/                 Global, page, reading, runtime, and admin styles
workers/api.js              Main Worker router
workers/lib/                Runtime API modules
wrangler.jsonc              Example Worker config with placeholder D1 binding
```

## Getting Started

Requirements:

- Node.js 22 or newer
- npm

Install and run:

```sh
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:4322
```

The dev command starts:

- Astro on `127.0.0.1:4322`
- Local API shim on `127.0.0.1:8787`
- A local proxy for `/api/*`

Split commands are also available:

```sh
npm run dev:astro
npm run dev:api
npm run dev:proxy
```

Build:

```sh
npm run build
npm run preview
```

The local API shim does not emulate D1. Without a real `BLOG_DB` binding, publishing, post listing, D1 image serving, delete operations, and comment settings should be tested in Cloudflare Pages Functions or a Wrangler environment.

## Runtime Publishing

Create a D1 database:

```sh
npx wrangler d1 create s1oop-blog-content
```

Apply the schema:

```sh
npx wrangler d1 execute s1oop-blog-content --file migrations/0001_runtime_posts.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0002_blog_assets.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0003_site_settings.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0004_runtime_post_search_text.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0005_blog_comments.sql
```

Configure bindings and secrets:

```text
BLOG_DB          Cloudflare D1 binding
ADMIN_PASSWORD   Private admin password
SITE_URL         Optional canonical site URL
```

`POST /api/admin/posts` accepts a Markdown file plus optional image files. The Worker parses frontmatter, converts Markdown to HTML, extracts search text and reading stats, writes the post to D1, and rewrites uploaded image references to `/api/assets/*`.

## API Surface

Public runtime API:

- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET /api/assets/*`
- `GET /api/comments`
- `GET /api/comments/status`
- `POST /api/comments`

Private admin API:

- `POST /api/admin/check`
- `POST /api/admin/logout`
- `GET /api/admin/posts`
- `POST /api/admin/posts`
- `GET /api/admin/posts/:slug`
- `DELETE /api/admin/posts/:slug`
- `GET /api/admin/assets/orphans`
- `DELETE /api/admin/assets/orphans`
- `GET /api/admin/comments`
- `DELETE /api/admin/comments/:id`
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`

## Deployment Notes

Recommended Cloudflare Pages settings:

```text
Build command: npm run build
Build output directory: dist
Production branch: main
Node.js version: 22
```

Pages Functions entry:

```text
functions/api/[[path]].js
```

Shared Worker router:

```text
workers/api.js
```

`wrangler.jsonc` contains an example D1 binding with a placeholder `database_id`. Replace it with your own D1 database ID before direct Worker deployment.

## Public Boundary

Included:

- Runtime architecture code
- D1 schema migrations
- Public and private route structure
- Frontend page shells and styling
- Example Cloudflare configuration with placeholders

Excluded:

- Production D1 data
- Real article Markdown and uploaded article images
- `.dev.vars`, `.env`, tokens, passwords, sessions, logs, and Wrangler local state
- Real Cloudflare account IDs or production binding IDs
- Private drafts and unpublished content

## Contributing

Contributions are welcome when they stay inside the public boundary. Good changes include bug fixes, accessibility improvements, documentation, local development fixes, and focused UI refinements that match the existing archive-style design.

Before submitting a change:

```sh
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## License

Code is released under the [MIT License](LICENSE).

Article content and images remain copyright of their respective author unless a post or asset states otherwise.
