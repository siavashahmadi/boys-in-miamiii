// Tonight in the 954: the daily curated events feed. Admin-only writes; the
// research agents produce it, the site just serves it.
import type { Tonight, TonightPick } from '../shared/seeds.js';
import { bad, loadState, setJson, type Req, type Res } from './_lib.js';

const clamp = (s: unknown, n: number) => String(s ?? '').slice(0, n);

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const body = (req.body ?? {}) as Record<string, unknown>;
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || clamp(body.adminKey, 200) !== adminKey) return bad(res, 401, 'not the king');
  const t = (body.tonight ?? {}) as Record<string, unknown>;
  const date = clamp(t.date, 10).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return bad(res, 400, 'tonight.date must be YYYY-MM-DD');
  if (!Array.isArray(t.picks) || t.picks.length === 0) return bad(res, 400, 'picks required');

  try {
    const picks: TonightPick[] = (t.picks as unknown[]).slice(0, 6).map((raw) => {
      const p = (raw ?? {}) as Record<string, unknown>;
      const pick: TonightPick = {
        emoji: clamp(p.emoji, 8).trim() || '✨',
        title: clamp(p.title, 80).trim(),
        where: clamp(p.where, 80).trim(),
        when: clamp(p.when, 40).trim(),
        note: clamp(p.note, 200).trim(),
      };
      const link = clamp(p.link, 500).trim();
      if (link) pick.link = link;
      return pick;
    }).filter((p) => p.title);
    // validate AFTER filtering so a malformed payload can't clobber a good
    // edition with an empty one while reporting success
    if (picks.length === 0) return bad(res, 400, 'picks need titles');
    const tonight: Tonight = { date, updatedAt: Date.now(), picks };
    await setJson('tonight', tonight);
    const state = await loadState();
    return res.status(200).json(state);
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
