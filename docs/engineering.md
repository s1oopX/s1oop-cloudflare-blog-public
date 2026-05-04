# Engineering Notes

[中文](#中文) | [English](#english)

## 中文

这个仓库优先展示一个轻量、可部署、边界清楚的 Cloudflare + GitHub 博客架构，而不是为了语言统计或工具堆叠去增加复杂度。

### 技术取向

- GitHub 负责源码、分支、Release 和 Cloudflare Pages 构建触发。
- Cloudflare Pages / Functions / D1 负责托管、API 和运行时内容。
- Worker 和浏览器端模块保持原生 JavaScript / ESM，贴近 Cloudflare 与浏览器运行环境。
- TypeScript 用在需要类型收束的 Astro 辅助模块中，例如 `src/lib/posts.ts`。
- 不因为 GitHub Languages 统计而迁移文件类型。语言占比不是工程质量指标。

### 当前质量边界

- 公开仓库不包含生产 D1 数据、真实文章、上传图片、密钥、会话或日志。
- `wrangler.jsonc` 只保留占位 D1 绑定，部署前必须替换为自己的数据库 ID。
- 本地开发 shim 只用于页面壳和交互预览，不模拟完整 D1 运行时。
- 发布、评论、D1 图片读取等能力应在 Cloudflare Pages Functions 或 Wrangler 环境中验证。

### 后续 TypeScript 演进

如果未来要增强类型系统，应按运行时边界渐进推进：

1. 先定义 D1 row、文章、评论、站点设置等共享数据结构。
2. 再为 `workers/lib/*` 增加 JSDoc 或逐步迁移到 TypeScript。
3. 最后考虑把浏览器端管理模块迁移到 TypeScript。

迁移时应避免同时改变 API 行为、路由结构和数据 schema。

### 提交前检查

```sh
npm run build
```

涉及 Cloudflare 绑定、D1 schema、后台发布或评论流程的修改，需要额外在真实 Cloudflare / Wrangler 环境中验证。

## English

This repository prioritizes a lightweight, deployable, and clearly bounded Cloudflare + GitHub blog architecture. It does not add complexity for language statistics or tooling optics.

### Technical Direction

- GitHub owns source code, branches, releases, and Cloudflare Pages build triggers.
- Cloudflare Pages / Functions / D1 own hosting, APIs, and runtime content.
- Worker and browser modules stay close to their native JavaScript / ESM runtime.
- TypeScript is used where Astro-side helper modules benefit from stronger type boundaries, such as `src/lib/posts.ts`.
- Files are not migrated only to change GitHub Languages percentages. Language share is not an engineering quality metric.

### Current Quality Boundary

- The public repository excludes production D1 data, real posts, uploaded images, secrets, sessions, and logs.
- `wrangler.jsonc` keeps placeholder D1 bindings and must be updated before direct deployment.
- The local development shim is for page shell and interaction preview only. It does not emulate the full D1 runtime.
- Publishing, comments, and D1 asset serving should be verified in Cloudflare Pages Functions or Wrangler.

### Future TypeScript Evolution

If the project grows toward stronger typing, migrate by runtime boundary:

1. Define shared data structures for D1 rows, posts, comments, and site settings.
2. Add JSDoc or gradually migrate `workers/lib/*` to TypeScript.
3. Consider migrating browser admin modules after the API boundaries are stable.

Avoid changing API behavior, route structure, and database schema in the same migration.

### Pre-commit Check

```sh
npm run build
```

Changes involving Cloudflare bindings, D1 schema, admin publishing, or comments need additional verification in a real Cloudflare / Wrangler environment.
