# Public API Worker

`api.js` contains the public runtime API used by the sanitized copy.

Local development is wired through:

```sh
npm run dev
```

This starts Astro on `127.0.0.1:4322` and a local API server on `127.0.0.1:8787`. Astro proxies `/api/*` to the local API server.

## Routes

- `GET /api/comments`: returns comment state and stored comments if `BLOG_KV` exists.
- `POST /api/comments`: returns a closed-comments response.
- `POST /api/stats/visit`: records a daily counter when `BLOG_KV` is bound.
- `GET /api/stats`: returns the daily counter when `BLOG_KV` is bound, otherwise zeros.
- `GET /api/posts`: points clients to the static `/posts.json` index.

These routes are intentionally lightweight demo endpoints for the public copy. The production private source repository has moved runtime publishing to D1:

- `POST /api/admin/check`: verifies the private entry password.
- `POST /api/admin/posts`: stores an uploaded Markdown post and optional small images in D1.
- `GET /api/posts`: returns runtime D1 posts for the browser overlay.
- `GET /api/posts/:slug`: returns one runtime D1 post.
- `GET /api/assets/*`: serves uploaded D1 image assets with long-lived cache headers.

## Optional KV Binding

When comments or stats are enabled later, bind one KV namespace as:

```text
BLOG_KV
```

Suggested keys:

```text
comments:{slug}
stats:daily:{yyyy-mm-dd}
settings:site
```

Private publishing endpoints are intentionally not included in this public copy. See `docs/private-entry.md` for the architecture boundary.

See `docs/runtime-publishing.md` for the current production publishing model.
