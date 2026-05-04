# s1oop Cloudflare Blog Public

Sanitized public source for the s1oop Cloudflare blog. The repository keeps two major architecture lines instead of overwriting the old public copy.

Live site: <https://s1oop.bbroot.com>

## Versions

| Version | Branch | Tag | Model | Use case |
| --- | --- | --- | --- | --- |
| v1 Static Public Copy | `v1-static` | `v1.0.0` | Astro Content Collections with Markdown files in Git | Study the original static blog demo and UI structure |
| v2 Runtime Architecture | `main` / `v2-runtime` | `v2.0.0` | Cloudflare D1 runtime posts with admin publishing APIs | Study the current runtime publishing architecture |

The `v1-static` branch preserves the original public demo with `content/posts` and static article routes. The `v2-runtime` branch opens the current private repository architecture after removing production content, secrets, local state, and deployment data.

## Architecture

- Astro builds static page shells in `dist/`.
- Cloudflare Pages serves the frontend.
- Pages Functions route `/api/*` to `workers/api.js`.
- D1 is the only public article source in v2.
- The single article reader is `/blog/live?slug=...`.
- Archive, collection, search, home entry, and recommendations read `/api/posts` in the browser.
- Git stores code, design, scripts, and docs. Public posts are not written back to the repository.

## What Is Open Sourced In v2

- Runtime post APIs for D1-backed archive, detail, search, collections, and recommendations.
- Private admin publishing flow structure for Markdown upload and replacement.
- D1 image asset storage for small uploaded images.
- Comment storage and runtime comment switch.
- Cloudflare Pages Functions / Workers shared entrypoint.
- D1 migrations for posts, image assets, settings, search text, and comments.
- Frontend pages, components, scripts, and styles for the runtime model.

## What Is Not Included

- Production D1 data.
- Real article Markdown or uploaded article images.
- `.dev.vars`, `.env`, passwords, tokens, sessions, logs, or local Wrangler state.
- Cloudflare account state or real production binding IDs.
- Private drafts or unpublished content.

## Tech Stack

- Astro 6
- TailwindCSS
- Cloudflare Pages
- Cloudflare Pages Functions
- Cloudflare D1
- Wrangler for Worker config validation

## Local Development

```sh
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:4322
```

`npm run dev` starts:

- Astro dev server on `127.0.0.1:4322`
- Local API server on `127.0.0.1:8787`
- A proxy so Astro can call `/api/*`

Split commands are also available:

```sh
npm run dev:astro
npm run dev:api
npm run dev:proxy
```

The local Node API shim does not emulate D1. Without a real `BLOG_DB` binding, publishing, post listing, D1 images, delete operations, and comment settings must be tested through Cloudflare Pages Functions or a Wrangler environment.

## Environment

Copy local placeholders:

```sh
cp .dev.vars.example .dev.vars
```

`.dev.vars` is ignored by Git.

Required for private admin login:

```text
ADMIN_PASSWORD=...
```

Required Cloudflare binding:

```text
BLOG_DB      D1 database for posts, comments, settings, and uploaded small images
```

Optional:

```text
SITE_URL=https://example.com
```

`wrangler.jsonc` uses a placeholder D1 `database_id`. Replace it with your own Cloudflare D1 database ID before direct Worker deployment.

## Build

```sh
npm run build
npm run preview
```

The static output is written to `dist/`.

Expected public route shape:

- `/`
- `/blog`
- `/blog/live?slug=...`
- `/collections`
- `/collections/:slug`
- `/search`
- `/about`
- `/changelog`
- `/s1oop`
- `/s1oop/admin`

There are no generated static article routes such as `/blog/my-post`, and no static post indexes such as `/posts.json` or `/search-index.json` in v2.

## Runtime Publishing

Create the D1 database:

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

Bind it to the Pages project:

```text
BLOG_DB -> s1oop-blog-content
```

`POST /api/admin/posts` accepts a Markdown file plus optional image files. The Markdown is parsed into HTML and stored in `blog_posts`; uploaded images are stored in `blog_assets` and referenced through `/api/assets/*`.

## Public API

- `GET /api/posts`: returns D1 posts for archive, collections, search, home entry, and recommendations.
- `GET /api/posts/:slug`: returns one published D1 post for `/blog/live?slug=...`.
- `GET /api/assets/*`: serves uploaded D1 image assets.
- `GET /api/comments`: returns public comments when enabled.
- `POST /api/comments`: stores a public comment when comments are enabled.

## Admin API

- `POST /api/admin/check`: verifies the private `/s1oop` password.
- `GET /api/admin/posts`: lists D1 posts.
- `POST /api/admin/posts`: uploads or replaces a D1 post.
- `GET /api/admin/posts/:slug`: checks or fetches one D1 post.
- `DELETE /api/admin/posts/:slug`: deletes one D1 post and its assets.
- `GET /api/admin/assets/orphans`: counts orphaned D1 image assets.
- `DELETE /api/admin/assets/orphans`: deletes orphaned D1 image assets.
- `GET /api/admin/comments`: lists comments for moderation.
- `DELETE /api/admin/comments/:id`: deletes one comment.
- `GET /api/admin/settings`: reads runtime settings.
- `PATCH /api/admin/settings`: updates runtime settings.

## Notes

- Keep article content in D1, not under `content/posts`.
- Use `v1-static` if you want the older static Markdown demo.
- Use the admin page for new runtime posts.
- The admin publishing API requires `ADMIN_PASSWORD` and `BLOG_DB` and should only be enabled for trusted deployments.
- Public comments are disabled by default.
- Use Cloudflare Web Analytics for production analytics.

## License

Code is released under the MIT License.

Article content and images remain copyright of their respective author unless a post or asset states otherwise.
