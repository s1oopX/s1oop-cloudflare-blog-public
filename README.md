# s1oop Cloudflare Blog Public

[中文](README.md) | [English](docs/README.en.md)

[![Astro](https://img.shields.io/badge/Astro-6-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![Release](https://img.shields.io/github/v/release/s1oopX/s1oop-cloudflare-blog-public?display_name=tag)](https://github.com/s1oopX/s1oop-cloudflare-blog-public/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-111827.svg)](LICENSE)

s1oop Cloudflare 博客的脱敏公开源码。项目采用 **GitHub 驱动源码与部署、Cloudflare 承担运行时能力** 的单平台架构：GitHub 负责版本管理和 Pages 构建触发，Cloudflare Pages / Functions / D1 负责页面托管、API 和内容存储。

仓库保留两个大版本：`v1` 是原始静态公开版，`v2` 是当前 Cloudflare D1 运行时架构。

线上站点：<https://s1oop.bbroot.com>

工程约定见 [docs/engineering.md](docs/engineering.md)。

## 版本选择

| 版本 | 分支 / 标签 | 内容模型 | 适合 |
| --- | --- | --- | --- |
| v1 静态公开版 | `v1-static` / `v1.0.0` | Markdown 存在 Git 中，Astro 生成静态文章页 | 查看旧静态博客实现 |
| v2 运行时架构版 | `main`, `v2-runtime` / `v2.0.0` | 文章存储在 Cloudflare D1，通过 Worker API 运行时读取 | 查看当前生产架构 |

`main` 默认指向 v2。旧版没有被覆盖，可以通过 `v1-static` 分支或 `v1.0.0` Release 访问。

## 项目定位

这个仓库公开的是架构和实现方式，不公开生产内容。

v2 中，Git 保存页面壳、样式、脚本、Worker API、D1 migrations 和文档；文章 Markdown、上传图片、评论和运行时设置存储在 D1。

## Cloudflare + GitHub 驱动

v2 的设计目标是减少外部依赖，让个人博客的源码、部署和运行时内容形成一条清晰链路：

- GitHub：源码仓库、版本分支、Release、Cloudflare Pages 构建触发。
- Cloudflare Pages：静态页面壳托管。
- Cloudflare Pages Functions / Workers：统一处理 `/api/*`。
- Cloudflare D1：文章、上传小图、评论和运行时设置。
- 不需要独立 Node 服务、传统数据库服务器或额外对象存储；R2 可后续扩展，但不是当前架构的必要条件。
- 新文章不会写回 GitHub，GitHub 只保存代码和部署历史。
- Worker 和浏览器端模块保持轻量 JavaScript / ESM；TypeScript 用在需要类型收束的 Astro 辅助模块中，不为了语言统计迁移文件类型。

## 架构概览

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

核心路径：

- `/blog`：静态归档页面壳，浏览器从 `/api/posts` 加载文章。
- `/blog/live?slug=...`：单篇运行时文章阅读页。
- `/collections`、`/search`、首页入口和推荐：共享运行时文章 API。
- `/s1oop`、`/s1oop/admin`：私有发布入口和后台结构。
- `/api/assets/*`：读取 D1 中的小图资源。

## 目录结构

```text
functions/api/[[path]].js   Pages Functions 入口
migrations/                 D1 schema
public/scripts/             浏览器运行时脚本
src/pages/                  页面壳和私有管理页面
src/scripts/admin/          后台前端模块
src/styles/                 页面、阅读、后台和全局样式
workers/api.js              Worker 主路由
workers/lib/                Worker 业务模块
wrangler.jsonc              带占位 D1 绑定的配置示例
```

## 快速开始

```sh
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:4322
```

常用命令：

```sh
npm run dev      # Astro + local API shim + proxy
npm run build    # Astro production build
npm run preview  # Preview built site
```

本地 API shim 不模拟 D1。需要真实 `BLOG_DB` 的功能，例如文章发布、文章列表、D1 图片和评论设置，应在 Cloudflare Pages Functions 或 Wrangler 环境中测试。

## D1 运行时发布

创建数据库并应用 schema：

```sh
npx wrangler d1 create s1oop-blog-content
npx wrangler d1 execute s1oop-blog-content --file migrations/0001_runtime_posts.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0002_blog_assets.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0003_site_settings.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0004_runtime_post_search_text.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0005_blog_comments.sql
```

需要配置：

```text
BLOG_DB          Cloudflare D1 binding
ADMIN_PASSWORD   私有后台密码
SITE_URL         可选 canonical URL
```

`POST /api/admin/posts` 接收 Markdown 和可选图片，Worker 会解析 frontmatter、生成 HTML、提取搜索文本和阅读统计，然后写入 D1。

## API 范围

- Public: `GET /api/posts`, `GET /api/posts/:slug`, `GET /api/assets/*`, `GET /api/comments`, `POST /api/comments`
- Admin: `/api/admin/check`, `/api/admin/posts`, `/api/admin/assets/orphans`, `/api/admin/comments`, `/api/admin/settings`

## 部署

推荐 Cloudflare Pages 设置：

```text
Build command: npm run build
Build output directory: dist
Production branch: main
Node.js version: 22
```

`functions/api/[[path]].js` 会把 `/api/*` 交给 `workers/api.js`。`wrangler.jsonc` 中的 `database_id` 是占位值，直接部署 Worker 前需要替换为自己的 D1 数据库 ID。

## 公开边界

包含：

- 运行时架构代码和前端页面壳
- D1 schema migrations
- Worker / Pages Functions 路由结构
- 私有发布流程的代码结构
- 带占位值的 Cloudflare 配置示例

不包含：

- 生产 D1 数据
- 真实文章 Markdown 和上传图片
- `.dev.vars`、`.env`、token、密码、会话和日志
- 真实 Cloudflare 账号 ID 或生产绑定 ID
- 私有草稿和未发布内容

## 贡献

欢迎提交 bug 修复、无障碍改进、文档修正、本地开发修复，以及符合现有设计语言的聚焦 UI 优化。

提交前请运行：

```sh
npm run build
```

参见 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [SECURITY.md](SECURITY.md)。

## 许可

代码使用 [MIT License](LICENSE) 发布。文章内容和图片版权归各自作者所有，除非单篇文章或资源另有说明。
