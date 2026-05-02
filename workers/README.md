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
