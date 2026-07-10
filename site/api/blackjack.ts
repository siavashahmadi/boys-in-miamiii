// The practice table. All dealing happens here, server-side, so the deck and
// the dealer's hole card never reach a browser. Cheating requires beating
// crypto.getRandomValues, at which point you deserve the dinner pick.
import { SQUAD_NAMES } from '../shared/seeds.js';
import {
  BJ_CUTOFF_MS,
  deal, doubleDown, freshRecord, hit, sanitize, split, stand, takeMarker,
  type PlayerRecord, type Rng,
} from '../shared/blackjack.js';
import { bad, getJson, loadBoard, setJson, type Req, type Res } from './_lib.js';

const rng: Rng = (n) => {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] % n;
};

const clamp = (s: unknown, n: number) => String(s ?? '').slice(0, n);

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const body = (req.body ?? {}) as Record<string, unknown>;
  const name = clamp(body.name, 30).trim();
  if (!(SQUAD_NAMES as readonly string[]).includes(name)) return bad(res, 400, 'who are you? pick your name first.');
  const action = clamp(body.action, 20);

  try {
    const key = `bj:${name}`;
    const rec: PlayerRecord = (await getJson<PlayerRecord>(key)) ?? freshRecord();
    const now = Date.now();

    try {
      if (action === 'state') {
        // read-only
      } else if (action === 'deal') {
        deal(rec, Math.round(Number(body.bet)), rng, now);
      } else if (action === 'hit') {
        hit(rec);
      } else if (action === 'stand') {
        stand(rec);
      } else if (action === 'double') {
        doubleDown(rec);
      } else if (action === 'split') {
        split(rec);
      } else if (action === 'marker') {
        takeMarker(rec);
      } else {
        return bad(res, 400, 'unknown action');
      }
    } catch (gameErr) {
      // Rule violations come back as readable table talk, not 500s.
      return bad(res, 400, gameErr instanceof Error ? gameErr.message : 'table says no');
    }

    if (action !== 'state') await setJson(key, rec);
    const board = await loadBoard();
    res.setHeader('cache-control', 'no-store');
    res.status(200).json({
      me: sanitize(rec),
      board,
      cutoff: BJ_CUTOFF_MS,
      closed: now >= BJ_CUTOFF_MS,
    });
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
