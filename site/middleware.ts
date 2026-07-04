// Vercel Edge Middleware: HTTP Basic Auth over the whole site + api.
// Password comes from the SITE_PASSWORD env var (any username works).
// Also stamps noindex so nothing gets crawled even if the URL leaks.

export const config = { matcher: '/(.*)' };

export default function middleware(req: Request): Response | undefined {
  const password = process.env.SITE_PASSWORD;
  if (!password) return undefined; // gate unset: fail open rather than lock everyone out

  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const pass = decoded.slice(decoded.indexOf(':') + 1);
      if (pass === password) {
        return undefined; // authorized: continue to the asset/function
      }
    } catch { /* fall through to 401 */ }
  }

  return new Response('the boys only. get the password from the chat.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="the boys only", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
      'content-type': 'text/plain; charset=utf-8',
    },
  });
}
