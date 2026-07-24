// The practice table. All dealing happens here, server-side, so the deck and
// the dealer's hole card never reach a browser. Cheating requires beating
// crypto.getRandomValues, at which point you deserve the dinner pick.
import { SQUAD_NAMES } from '../shared/seeds.js';
import {
  BJ_CUTOFF_MS,
  deal, doubleDown, freshRecord, hit, sanitize, split, stand, takeMarker,
  type PlayerRecord, type Rng,
} from '../shared/blackjack.js';
import { bad, ensureContestFinal, getJson, loadBoard, setJson, type Req, type Res } from './_lib.js';

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
    // Spread over fresh defaults: records written before jul 13 lack the
    // deeper counters and would NaN on increment.
    const stored = await getJson<Partial<PlayerRecord>>(key);
    const rec: PlayerRecord = { ...freshRecord(), ...(stored ?? {}) };
    const now = Date.now();
    // freeze the contest board before any post-cutoff action mutates it
    const contest = await ensureContestFinal(now);

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

    // The prophecy egg: first player ever dealt J♠+J♣ claims it, permanently.
    let prophecy: { fresh: boolean; by: string } | undefined;
    if (action === 'deal' && rec.round?.prophecy) {
      const claim = await getJson<{ name: string; at: number }>('egg:prophecy');
      if (!claim) await setJson('egg:prophecy', { name, at: now });
      prophecy = { fresh: !claim, by: claim?.name ?? name };
    }

    if (action !== 'state') await setJson(key, rec);
    // The board only moves on deal/marker/settle. Mid-hand hits and stands
    // skip the rebuild so the hottest actions save a redis round trip; the
    // client keeps its previous board when it sees null.
    const settledNow = rec.round?.phase === 'settled';
    const boardMoved = action === 'state' || action === 'deal' || action === 'marker' || settledNow;
    const board = boardMoved ? await loadBoard() : null;
    res.setHeader('cache-control', 'no-store');
    res.status(200).json({
      me: sanitize(rec),
      board,
      cutoff: BJ_CUTOFF_MS,
      closed: now >= BJ_CUTOFF_MS,
      contest: contest ? { name: contest.board[0]?.name ?? null, net: contest.board[0]?.net ?? 0 } : null,
      prophecy,
    });
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
