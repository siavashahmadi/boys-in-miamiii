// The manifest: shared packing list. Everyone can add, claim, unclaim, and
// delete; six trusted uncs on the honor system.
import { SQUAD_NAMES, type ManifestItem } from '../shared/seeds.js';
import { bad, loadState, setJson, type Req, type Res } from './_lib.js';

const clamp = (s: unknown, n: number) => String(s ?? '').slice(0, n);

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const body = (req.body ?? {}) as Record<string, unknown>;
  try {
    const state = await loadState();

    if (body.action === 'add') {
      const label = clamp(body.label, 60).trim();
      if (!label) return bad(res, 400, 'name the thing.');
      const addedBy = clamp(body.addedBy, 30).trim();
      if (!(SQUAD_NAMES as readonly string[]).includes(addedBy)) return bad(res, 400, 'who are you? pick your name first.');
      const item: ManifestItem = {
        id: 'm' + Date.now() + Math.random().toString(36).slice(2, 6),
        emoji: clamp(body.emoji, 8).trim() || '🧳',
        label,
        note: clamp(body.note, 140).trim(),
        claimedBy: null,
        addedBy,
      };
      state.manifest = [...state.manifest, item].slice(0, 60);
      await setJson('manifest', state.manifest);
      return res.status(200).json(state);
    }

    if (body.action === 'claim' || body.action === 'unclaim') {
      const id = clamp(body.id, 60);
      const name = clamp(body.name, 30).trim();
      if (!(SQUAD_NAMES as readonly string[]).includes(name)) return bad(res, 400, 'who are you? pick your name first.');
      state.manifest = state.manifest.map((m) => {
        if (m.id !== id) return m;
        if (body.action === 'claim') return m.claimedBy ? m : { ...m, claimedBy: name };
        return m.claimedBy === name ? { ...m, claimedBy: null } : m;
      });
      await setJson('manifest', state.manifest);
      return res.status(200).json(state);
    }

    if (body.action === 'delete') {
      const id = clamp(body.id, 60);
      state.manifest = state.manifest.filter((m) => m.id !== id);
      await setJson('manifest', state.manifest);
      return res.status(200).json(state);
    }

    return bad(res, 400, 'unknown action');
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
