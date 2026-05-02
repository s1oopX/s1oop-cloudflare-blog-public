# Runtime Publishing

[简体中文](#简体中文) | [English](#english)

## 简体中文

生产站点采用“静态源码 + D1 运行时内容”的轻量发布方式。GitHub 仍然是源码仓库和 Cloudflare Pages 的部署触发器，但新文章不会再写回 GitHub。

### 当前生产链路

```text
GitHub private repo -> Cloudflare Pages build -> static Astro site
Private admin entry -> Pages Functions / Worker -> Cloudflare D1
Public blog page    -> static posts + runtime D1 posts overlay
```

### 存储分工

| 内容 | 位置 | 说明 |
| --- | --- | --- |
| 源码、样式、静态文章 | GitHub 私有主仓库 | 触发 Cloudflare Pages 构建 |
| 新上传文章 | Cloudflare D1 `blog_posts` | 发布后无需重新构建 |
| 新上传小图 | Cloudflare D1 `blog_assets` | 单张图片限制 1 MB |
| 大图、长期媒体 | 暂不内置 | 如后续需要，可再接入 R2 或外部图床 |

### 为什么没有使用 R2

R2 适合大量媒体文件，但需要先在 Cloudflare 账号中启用对应产品。这个博客当前更需要轻量、少配置、免费优先的发布体验，所以小图直接存入 D1。这个取舍适合低频个人写作，不适合大型图库。

### 需要的生产绑定

```text
ADMIN_PASSWORD  私有入口密码
BLOG_DB         Cloudflare D1 binding
```

D1 schema:

```text
migrations/0001_runtime_posts.sql
migrations/0002_blog_assets.sql
```

公开副本不包含生产 D1 数据、Cloudflare 账号配置或私有后台会话。

## English

The production site uses a lightweight "static source + D1 runtime content" publishing model. GitHub remains the source repository and the Cloudflare Pages deployment trigger, but newly uploaded posts are not written back to GitHub.

### Production Flow

```text
GitHub private repo -> Cloudflare Pages build -> static Astro site
Private admin entry -> Pages Functions / Worker -> Cloudflare D1
Public blog page    -> static posts + runtime D1 posts overlay
```

### Storage Responsibilities

| Content | Location | Notes |
| --- | --- | --- |
| Source, styles, static posts | Private GitHub source repo | Triggers Cloudflare Pages builds |
| Newly uploaded posts | Cloudflare D1 `blog_posts` | Visible without rebuilding the site |
| Newly uploaded small images | Cloudflare D1 `blog_assets` | 1 MB limit per image |
| Large or long-lived media | Not bundled | R2 or an external image host can be added later |

### Why Not R2

R2 is better for larger media libraries, but it must be enabled for the Cloudflare account first. This blog currently favors a light, low-configuration, free-first publishing flow, so small images are stored directly in D1. That tradeoff fits low-volume personal writing, not a large image archive.

### Required Production Bindings

```text
ADMIN_PASSWORD  Private entry password
BLOG_DB         Cloudflare D1 binding
```

D1 schema:

```text
migrations/0001_runtime_posts.sql
migrations/0002_blog_assets.sql
```

The public copy does not include production D1 data, Cloudflare account configuration, or private admin sessions.
