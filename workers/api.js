const json = (data, init = {}) =>
  Response.json(data, {
    ...init,
    headers: {
      'access-control-allow-origin': '*',
      ...init.headers,
    },
  });

const todayKey = () => new Date().toISOString().slice(0, 10);

async function readJson(kv, key, fallback) {
  if (!kv) return fallback;
  const value = await kv.get(key, 'json');
  return value ?? fallback;
}

async function writeJson(kv, key, value) {
  if (!kv) return false;
  await kv.put(key, JSON.stringify(value));
  return true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const kv = env.BLOG_KV;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET,POST,OPTIONS',
          'access-control-allow-headers': 'content-type',
        },
      });
    }

    if (url.pathname === '/api/comments' && request.method === 'GET') {
      const slug = url.searchParams.get('slug') ?? 'global';
      const comments = await readJson(kv, `comments:${slug}`, []);

      return json({
        ok: true,
        enabled: env.COMMENTS_ENABLED === 'true',
        comments,
      });
    }

    if (url.pathname === '/api/comments' && request.method === 'POST') {
      return json(
        {
          ok: false,
          enabled: false,
          message: 'Public comments are closed in this public copy',
        },
        { status: 403 },
      );
    }

    if (url.pathname === '/api/stats/visit' && request.method === 'POST') {
      if (!kv) {
        return json({
          ok: true,
          persisted: false,
          message: 'BLOG_KV is not bound. Static site remains fully functional',
        });
      }

      const body = await request.json().catch(() => ({}));
      const visitorId = String(body.visitorId ?? 'anonymous').slice(0, 64);
      const path = String(body.path ?? '/').slice(0, 256);
      const day = todayKey();
      const stats = await readJson(kv, `stats:daily:${day}`, {
        pageViews: 0,
        visitors: [],
        paths: {},
      });

      stats.pageViews += 1;
      if (!stats.visitors.includes(visitorId)) stats.visitors.push(visitorId);
      stats.paths[path] = (stats.paths[path] ?? 0) + 1;

      await writeJson(kv, `stats:daily:${day}`, stats);

      return json({
        ok: true,
        persisted: true,
        pageViews: stats.pageViews,
        visitors: stats.visitors.length,
      });
    }

    if (url.pathname === '/api/stats' && request.method === 'GET') {
      const day = url.searchParams.get('day') ?? todayKey();
      const stats = await readJson(kv, `stats:daily:${day}`, {
        pageViews: 0,
        visitors: [],
        paths: {},
      });

      return json({
        ok: true,
        persisted: Boolean(kv),
        day,
        pageViews: stats.pageViews,
        visitors: stats.visitors.length,
        paths: stats.paths,
      });
    }

    if (url.pathname === '/api/posts' && request.method === 'GET') {
      return json({
        ok: true,
        source: 'static',
        index: '/posts.json',
      });
    }

    return json({ ok: false, message: 'Not Found' }, { status: 404 });
  },
};
