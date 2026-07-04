import { bad, type Req, type Res } from './_lib.js';

// POST { password }. On match, set the gate cookie so middleware lets the
// real site through. Cookie value is GATE_TOKEN (a shared secret), never the
// password itself.
export default function handler(req: Req & { body?: unknown }, res: Res & { setHeader: (k: string, v: string) => void }) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const password = process.env.SITE_PASSWORD;
  const token = process.env.GATE_TOKEN;
  if (!password || !token) return bad(res, 503, 'gate not configured');

  const body = (req.body ?? {}) as Record<string, unknown>;
  if (String(body.password ?? '') !== password) {
    return res.status(401).json({ ok: false });
  }

  const cookie = `miami_gate=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`;
  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ ok: true });
}
