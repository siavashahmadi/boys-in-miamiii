// The wheel. Spin is resolved entirely server-side (crypto RNG); the client
// receives the pocket and animates to it. Shares bankrolls with blackjack.
import { SQUAD_NAMES } from '../shared/seeds.js';
import { BJ_CUTOFF_MS, freshRecord, sanitize, type PlayerRecord, type Rng } from '../shared/blackjack.js';
import { colorOf, spin, validateBets, type Pocket, type RouletteBet } from '../shared/roulette.js';
import { bad, casJson, ensureContestFinal, getJson, getRaw, loadBoard, setJson, type Req, type Res } from './_lib.js';

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
  if (body.action !== 'spin') return bad(res, 400, 'unknown action');

  const rawBets = Array.isArray(body.bets) ? (body.bets as unknown[]).slice(0, 45) : [];
  const bets: RouletteBet[] = rawBets.map((raw) => {
    const b = (raw ?? {}) as Record<string, unknown>;
    const bet: RouletteBet = {
      kind: clamp(b.kind, 10) as RouletteBet['kind'],
      amount: Math.round(Number(b.amount)),
    };
    if (b.pocket !== undefined) bet.pocket = clamp(b.pocket, 3);
    if (b.target !== undefined) bet.target = Math.round(Number(b.target));
    return bet;
  });

  try {
    const key = `bj:${name}`;
    const now = Date.now();
    const contest = await ensureContestFinal(now);

    // Compare-and-set with one retry: a blackjack deal from another device
    // between our read and write must not be clobbered (TOCTOU guard).
    let result: ReturnType<typeof spin> | null = null;
    let rec: PlayerRecord | null = null;
    for (let attempt = 0; attempt < 2 && !result; attempt++) {
      const prevRaw = await getRaw(key);
      let stored: Partial<PlayerRecord> | null = null;
      try { stored = prevRaw ? (JSON.parse(prevRaw) as Partial<PlayerRecord>) : null; } catch { stored = null; }
      const candidate: PlayerRecord = { ...freshRecord(), ...(stored ?? {}) };

      if (candidate.round && candidate.round.phase === 'player') return bad(res, 400, 'finish your blackjack hand first.');

      try {
        validateBets(bets, candidate.bankroll);
      } catch (gameErr) {
        return bad(res, 400, gameErr instanceof Error ? gameErr.message : 'the wheel says no');
      }

      const spun = spin(candidate, bets, rng);
      if (await casJson(key, prevRaw, candidate)) {
        result = spun;
        rec = candidate;
      }
    }
    if (!result || !rec) return bad(res, 409, 'the table got jostled. spin again.');

    const hist = (await getJson<Pocket[]>('wheel_history')) ?? [];
    const history = [...hist, result.pocket].slice(-12);
    await setJson('wheel_history', history);

    const board = await loadBoard();
    res.setHeader('cache-control', 'no-store');
    res.status(200).json({
      pocket: result.pocket,
      color: colorOf(result.pocket),
      net: result.net,
      payout: result.payout,
      staked: result.staked,
      history,
      me: sanitize(rec),
      board,
      cutoff: BJ_CUTOFF_MS,
      closed: now >= BJ_CUTOFF_MS,
      contest: contest ? { name: contest.board[0]?.name ?? null, net: contest.board[0]?.net ?? 0 } : null,
    });
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
