# s1oop Cloudflare Blog Public

[中文](README.md) | [English](docs/README.en.md)

[![Astro](https://img.shields.io/badge/Astro-6-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![License: MIT](https://img.shields.io/badge/License-MIT-111827.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/s1oopX/s1oop-cloudflare-blog-public?display_name=tag)](https://github.com/s1oopX/s1oop-cloudflare-blog-public/releases)

s1oop Cloudflare 博客的公开源码仓库。本仓库保留原始静态公开版作为 `v1`，同时将当前 Cloudflare D1 运行时架构发布为 `v2`。

线上站点：<https://s1oop.bbroot.com>

## 目录

- [版本线](#版本线)
- [仓库定位](#仓库定位)
- [架构](#架构)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [运行时发布](#运行时发布)
- [API 范围](#api-范围)
- [部署说明](#部署说明)
- [公开边界](#公开边界)
- [贡献](#贡献)

## 版本线

| 版本 | 分支 | 标签 | 内容模型 | 适合场景 |
| --- | --- | --- | --- | --- |
| v1 静态公开版 | `v1-static` | `v1.0.0` | Markdown 文件通过 Astro Content Collections 存在于 Git 中 | 阅读原始静态博客实现 |
| v2 运行时架构版 | `main` / `v2-runtime` | `v2.0.0` | Cloudflare D1 文章通过 Pages Functions / Worker API 提供 | 阅读当前运行时发布架构 |

`main` 跟随 v2 运行时架构。旧静态实现被保留在 `v1-static`，不会被 v2 覆盖。

## 仓库定位

这是博客源码的脱敏公开副本。它用于展示项目如何组织、构建和部署，同时不暴露私有内容或生产数据。

在 v2 中，Git 只保存源码、页面壳、样式、脚本、数据库迁移和文档。公开文章内容存储在 Cloudflare D1，并在运行时加载。

## 架构

```text
Astro 静态页面壳
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

核心运行时行为：

- `/blog` 渲染静态归档页面壳，并从 `/api/posts` 加载 D1 文章。
- `/blog/live?slug=...` 从 `/api/posts/:slug` 读取单篇运行时文章。
- `/collections`、`/search`、首页入口和推荐模块共享同一套运行时文章 API。
- `/s1oop` 和 `/s1oop/admin` 提供私有发布流程结构。
- 上传的小图存储在 D1 `blog_assets` 中，并通过 `/api/assets/*` 提供访问。

## 项目结构

```text
functions/api/[[path]].js   Pages Functions 到共享 Worker 的桥接入口
migrations/                 文章、资源、设置、搜索、评论的 D1 schema
public/scripts/             归档、搜索、评论、阅读页的浏览器运行时脚本
src/components/             Astro UI 组件
src/pages/                  静态页面壳和私有管理路由
src/scripts/admin/          私有后台浏览器模块
src/styles/                 全局、页面、阅读、运行时、后台样式
workers/api.js              主 Worker 路由
workers/lib/                运行时 API 模块
wrangler.jsonc              带占位 D1 绑定的 Worker 配置示例
```

## 快速开始

环境要求：

- Node.js 22 或更新版本
- npm

安装并启动：

```sh
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:4322
```

`npm run dev` 会启动：

- Astro：`127.0.0.1:4322`
- 本地 API shim：`127.0.0.1:8787`
- `/api/*` 本地代理

也可以拆分运行：

```sh
npm run dev:astro
npm run dev:api
npm run dev:proxy
```

构建：

```sh
npm run build
npm run preview
```

本地 API shim 不模拟 D1。没有真实 `BLOG_DB` 绑定时，发布、文章列表、D1 图片服务、删除操作和评论设置应在 Cloudflare Pages Functions 或 Wrangler 环境中测试。

## 运行时发布

创建 D1 数据库：

```sh
npx wrangler d1 create s1oop-blog-content
```

应用 schema：

```sh
npx wrangler d1 execute s1oop-blog-content --file migrations/0001_runtime_posts.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0002_blog_assets.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0003_site_settings.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0004_runtime_post_search_text.sql
npx wrangler d1 execute s1oop-blog-content --file migrations/0005_blog_comments.sql
```

配置绑定和密钥：

```text
BLOG_DB          Cloudflare D1 绑定
ADMIN_PASSWORD   私有后台密码
SITE_URL         可选 canonical 站点 URL
```

`POST /api/admin/posts` 接收 Markdown 文件和可选图片文件。Worker 会解析 frontmatter，将 Markdown 转为 HTML，提取搜索文本和阅读统计，写入 D1，并把上传图片引用改写为 `/api/assets/*`。

## API 范围

公开运行时 API：

- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET /api/assets/*`
- `GET /api/comments`
- `GET /api/comments/status`
- `POST /api/comments`

私有后台 API：

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

## 部署说明

推荐 Cloudflare Pages 设置：

```text
Build command: npm run build
Build output directory: dist
Production branch: main
Node.js version: 22
```

Pages Functions 入口：

```text
functions/api/[[path]].js
```

共享 Worker 路由：

```text
workers/api.js
```

`wrangler.jsonc` 包含一个使用占位 `database_id` 的 D1 绑定示例。直接部署 Worker 前，请替换为自己的 D1 数据库 ID。

## 公开边界

包含：

- 运行时架构代码
- D1 schema 迁移
- 公开路由和私有路由结构
- 前端页面壳和样式
- 带占位值的 Cloudflare 配置示例

不包含：

- 生产 D1 数据
- 真实文章 Markdown 和上传文章图片
- `.dev.vars`、`.env`、token、密码、会话、日志和 Wrangler 本地状态
- 真实 Cloudflare 账号 ID 或生产绑定 ID
- 私有草稿和未发布内容

## 贡献

欢迎在公开边界内贡献。适合的改动包括 bug 修复、无障碍改进、文档、本地开发修复，以及符合现有档案式设计的聚焦 UI 优化。

提交前请运行：

```sh
npm run build
```

参见 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [SECURITY.md](SECURITY.md)。

## 许可

代码使用 [MIT License](LICENSE) 发布。

除非单篇文章或资源另有说明，文章内容和图片版权归各自作者所有。
