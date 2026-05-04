# Changelog

## v2.0.0 - Runtime Architecture Open Source

This release opens the current runtime architecture used by the private source repository while keeping production data private.

### Changed

- Replaced the static Markdown public-copy architecture with D1 runtime post storage.
- Replaced generated static article routes with a single runtime reader at `/blog/live?slug=...`.
- Updated archive, collection, search, home, and recommendation flows to load posts from `/api/posts`.
- Updated the public repository metadata for the runtime architecture line.

### Added

- D1 migrations for posts, image assets, settings, search text, and comments.
- Private admin publishing flow structure for Markdown uploads and post replacement.
- D1-backed image asset serving through `/api/assets/*`.
- Runtime comment storage and admin-controlled comment switch.
- Worker library modules for auth, posts, assets, markdown, settings, comments, and HTTP helpers.

### Removed

- Static demo Markdown files from `content/posts`.
- Static post images from `public/images/posts`.
- Astro Content Collections article routes and static post/search JSON indexes.

### Security

- Production D1 data, secrets, sessions, local logs, and real Cloudflare binding IDs are not included.
- `wrangler.jsonc` uses a placeholder D1 `database_id`.

## v1.0.0 - Static Public Copy

The original public copy remains available on the `v1-static` branch and `v1.0.0` tag.

### Included

- Static Markdown sample posts in `content/posts`.
- Static article routes and generated post/search indexes.
- Demo public assets and screenshots.
- Documentation for the original sanitized public copy boundary.
