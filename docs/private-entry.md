# Private Entry Pattern

[简体中文](#简体中文) | [English](#english)

## 简体中文

这个公开仓库不包含站点所有者的私人入口、后台页面或 GitHub 发布接口。博客本身是公开的，私人入口只是一种可选的维护模式，不应该把个人实现原样放进开源副本。

### 适合公开说明的内容

- 私人入口的存在目的：只用于维护、发布或检查内容。
- 入口应当独立于公开阅读页面，不影响普通读者访问。
- 密码、token、会话和发布逻辑必须依赖部署环境配置。
- 开源仓库只保留模式说明，不保留个人路由、个人 UI 或生产发布链路。

### 推荐边界

```text
public pages        -> archive, posts, search, changelog
public api          -> stats, comments state, static post index
private entry       -> kept in a private branch or private repository
private publishing  -> requires deployment-specific secrets
```

### 如果你要自己实现

1. 使用自己的路由名称，不复用本仓库所有者的私人路径。
2. 使用服务端校验，不要把密码或 token 写进前端代码。
3. 将 GitHub 写入 token、Cloudflare token 和密码放在部署环境变量里。
4. 给私有 API 单独加速率限制、日志和错误处理。
5. 不要把私人入口截图、真实后台 UI 或生产配置提交到公开仓库。

## English

This public repository does not include the owner's private entry, admin pages, or GitHub publishing API. The blog itself is public; the private entry is only an optional maintenance pattern and should not be copied from the owner's implementation into the open-source copy.

### What Belongs In Public Documentation

- The private entry exists only for maintenance, publishing, or content checks.
- It should be isolated from public reading pages.
- Passwords, tokens, sessions, and publishing logic must come from deployment-specific configuration.
- The open-source repository keeps the pattern, not the owner's route, UI, or production publishing flow.

### Recommended Boundary

```text
public pages        -> archive, posts, search, changelog
public api          -> stats, comments state, static post index
private entry       -> kept in a private branch or private repository
private publishing  -> requires deployment-specific secrets
```

### If You Build Your Own

1. Use your own route name instead of reusing the owner's private path.
2. Validate access on the server side; never place passwords or tokens in frontend code.
3. Store GitHub write tokens, Cloudflare tokens, and passwords in deployment environment variables.
4. Add rate limiting, logging, and explicit error handling for private APIs.
5. Do not commit private-entry screenshots, real admin UI, or production config to a public repository.
