// Admin-only itinerary override. Saved whole to redis key `days`; the client
// merges it over the static DAYS by index.
import type { ItinDayOverride } from '../shared/seeds.js';
import { bad, loadState, setJson, type Req, type Res } from './_lib.js';

const clamp = (s: unknown, n: number) => String(s ?? '').slice(0, n);

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const body = (req.body ?? {}) as Record<string, unknown>;
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || clamp(body.adminKey, 200) !== adminKey) return bad(res, 401, 'not the king');
  if (!Array.isArray(body.days)) return bad(res, 400, 'days required');

  try {
    const days: ItinDayOverride[] = (body.days as unknown[]).slice(0, 4).map((raw) => {
      const d = (raw ?? {}) as Record<string, unknown>;
      const items = (Array.isArray(d.items) ? d.items : []).slice(0, 12)
        .map((r) => {
          const it = (r ?? {}) as Record<string, unknown>;
          return {
            time: clamp(it.time, 12).trim(),
            title: clamp(it.title, 80).trim(),
            note: clamp(it.note, 240).trim(),
          };
        })
        .filter((it) => it.title);
      const title = clamp(d.title, 60).trim();
      return title ? { title, items } : { items };
    });
    await setJson('days', days);
    const state = await loadState();
    return res.status(200).json(state);
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
