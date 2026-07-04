import type { CatKey, Pitch } from '../shared/seeds';
import { bad, loadState, savePitches, type Req, type Res } from './_lib';

const CATS: CatKey[] = ['eats', 'water', 'beach', 'night', 'culture', 'chaos'];
const clamp = (s: unknown, n: number) => String(s ?? '').slice(0, n);

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const body = (req.body ?? {}) as Record<string, unknown>;
  try {
    const state = await loadState();

    if (body.action === 'add') {
      const p = (body.pitch ?? {}) as Record<string, unknown>;
      const title = clamp(p.title, 80).trim();
      if (!title) return bad(res, 400, 'title required');
      const requester = clamp(p.requester, 30).trim() || 'someone';
      const who = Array.isArray(p.who) ? p.who.slice(0, 12).map((w) => clamp(w, 30).trim()).filter(Boolean) : [requester];
      const pitch: Pitch = {
        id: 'u' + Date.now() + Math.random().toString(36).slice(2, 6),
        title,
        category: CATS.includes(p.category as CatKey) ? (p.category as CatKey) : 'chaos',
        place: clamp(p.place, 60).trim() || 'spot TBD',
        mx: 0, my: 0,
        link: clamp(p.link, 500).trim(),
        note: clamp(p.note, 500).trim() || 'no reason given. bold strategy.',
        who,
        requester,
        voters: [requester],
        status: 'pending',
      };
      state.pitches = [pitch, ...state.pitches].slice(0, 200);
      await savePitches(state.pitches);
      return res.status(200).json(state);
    }

    if (body.action === 'vote') {
      const id = clamp(body.id, 60);
      const voter = clamp(body.voter, 30).trim();
      if (!id || !voter) return bad(res, 400, 'id and voter required');
      state.pitches = state.pitches.map((r) => {
        if (r.id !== id) return r;
        const voters = r.voters.includes(voter) ? r.voters.filter((v) => v !== voter) : [...r.voters, voter];
        return { ...r, voters };
      });
      await savePitches(state.pitches);
      return res.status(200).json(state);
    }

    if (body.action === 'verdict') {
      const adminKey = process.env.ADMIN_KEY;
      if (!adminKey || clamp(body.adminKey, 200) !== adminKey) return bad(res, 401, 'not the king');
      const id = clamp(body.id, 60);
      const decision = body.decision === 'approved' ? 'approved' : body.decision === 'denied' ? 'denied' : null;
      if (!id || !decision) return bad(res, 400, 'id and decision required');
      state.pitches = state.pitches.map((r) => (r.id === id ? { ...r, status: decision } : r));
      await savePitches(state.pitches);
      return res.status(200).json(state);
    }

    return bad(res, 400, 'unknown action');
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
