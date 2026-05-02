# Private Entry Pattern

[简体中文](#简体中文) | [English](#english)

## 简体中文

这个公开仓库不包含站点所有者的生产密码、后台会话或内部发布记录。博客本身是公开的，私人入口只是一种维护模式，不应该把个人实现原样放进开源副本。

### 适合公开说明的内容

- 私人入口的存在目的：只用于维护、发布或检查内容。
- 生产站点使用 `/s1oop` 作为访问入口，`/s1oop/admin` 作为发布页面。
- 入口应当独立于公开阅读页面，不影响普通读者访问。
- 密码、token、会话和发布逻辑必须依赖部署环境配置。
- 开源仓库只保留模式说明，不保留生产密码、会话状态或内部发布数据。

### 推荐边界

```text
public pages        -> archive, posts, search, changelog
public api          -> static post index and optional demo endpoints
private entry       -> /s1oop guarded by deployment secrets
private publishing  -> /s1oop/admin -> Pages Functions -> D1
```

### 如果你要自己实现

1. 使用自己的路由名称；如果复用 `/s1oop`，请确保它只存在于你的私有部署配置中。
2. 使用服务端校验，不要把密码或 token 写进前端代码。
3. 将 Cloudflare token、密码和 D1 binding 放在部署环境变量或 Pages 绑定里。
4. 给私有 API 单独加速率限制、日志和错误处理。
5. 不要把生产后台截图、会话状态、真实数据或生产配置提交到公开仓库。

## English

This public repository does not include the owner's production password, admin session, or internal publishing records. The blog itself is public; the private entry is a maintenance pattern and should not be copied from the owner's implementation into the open-source copy.

### What Belongs In Public Documentation

- The private entry exists only for maintenance, publishing, or content checks.
- The production site uses `/s1oop` as the access entry and `/s1oop/admin` as the publishing page.
- It should be isolated from public reading pages.
- Passwords, tokens, sessions, and publishing logic must come from deployment-specific configuration.
- The open-source repository keeps the pattern, not production passwords, session state, or internal publishing data.

### Recommended Boundary

```text
public pages        -> archive, posts, search, changelog
public api          -> static post index and optional demo endpoints
private entry       -> /s1oop guarded by deployment secrets
private publishing  -> /s1oop/admin -> Pages Functions -> D1
```

### If You Build Your Own

1. Use your own route name; if you reuse `/s1oop`, keep it isolated to your private deployment configuration.
2. Validate access on the server side; never place passwords or tokens in frontend code.
3. Store Cloudflare tokens, passwords, and D1 bindings in deployment environment variables or Pages bindings.
4. Add rate limiting, logging, and explicit error handling for private APIs.
5. Do not commit production admin screenshots, session state, real data, or production config to a public repository.
