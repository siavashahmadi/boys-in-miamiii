// The pouring of Tommy. Fantasy football justice, one declaration per pourer.
import { POURERS, type Pour } from '../shared/seeds.js';
import { bad, loadState, setJson, type Req, type Res } from './_lib.js';

const clamp = (s: unknown, n: number) => String(s ?? '').slice(0, n);

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const body = (req.body ?? {}) as Record<string, unknown>;
  const name = clamp(body.name, 30).trim();
  if (name === 'Tom') return bad(res, 400, "you're the pouree. sit down.");
  if (!(POURERS as readonly string[]).includes(name)) return bad(res, 400, 'who are you? pick your name first.');
  const text = clamp(body.text, 140).trim();
  if (!text) return bad(res, 400, 'declare something. anything legal.');

  try {
    const state = await loadState();
    const pour: Pour = { name, text, updatedAt: Date.now() };
    state.pours = [...state.pours.filter((p) => p.name !== name), pour];
    await setJson('pours', state.pours);
    return res.status(200).json(state);
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
