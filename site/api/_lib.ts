// Minimal Upstash Redis REST client + shared state helpers for the api routes.
// Env vars are injected by the Vercel + Upstash marketplace integration.
import { ALL_SEED_PITCHES, SEED_EXPENSES, SEED_MANIFEST, SEED_POURS, SQUAD_NAMES, type Expense, type ItinDayOverride, type ManifestItem, type Pitch, type Pour, type Tonight } from '../shared/seeds.js';
import { BJ_CUTOFF_MS, freshRecord, netOf, type BoardRow, type PlayerRecord } from '../shared/blackjack.js';

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

async function redis(cmd: (string | number)[]): Promise<unknown> {
  if (!URL_ || !TOKEN) throw new Error('redis env missing');
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error(`redis ${r.status}: ${await r.text()}`);
  const j = (await r.json()) as { result: unknown };
  return j.result;
}

export async function getJson<T>(key: string): Promise<T | null> {
  const raw = (await redis(['GET', key])) as string | null;
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function setJson(key: string, value: unknown): Promise<void> {
  await redis(['SET', key, JSON.stringify(value)]);
}

// Raw GET (exact stored string), for compare-and-set.
export async function getRaw(key: string): Promise<string | null> {
  return (await redis(['GET', key])) as string | null;
}

// SET NX: returns true if we won the write, false if the key already existed.
export async function setJsonNX(key: string, value: unknown): Promise<boolean> {
  const r = await redis(['SET', key, JSON.stringify(value), 'NX']);
  return r === 'OK';
}

// Compare-and-set via Lua: write only if the key still holds prevRaw
// (or is still missing when prevRaw is null). Returns true on success.
export async function casJson(key: string, prevRaw: string | null, value: unknown): Promise<boolean> {
  const next = JSON.stringify(value);
  if (prevRaw === null) {
    return setJsonNX(key, value);
  }
  const r = await redis([
    'EVAL',
    "if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[1], ARGV[2]) return 1 else return 0 end",
    1, key, prevRaw, next,
  ]);
  return r === 1;
}

export interface SharedState { pitches: Pitch[]; expenses: Expense[]; casino: BoardRow[]; pours: Pour[]; days: ItinDayOverride[] | null; manifest: ManifestItem[]; tonight: Tonight | null; wheelHistory: string[] }

export async function loadBoard(): Promise<BoardRow[]> {
  const raws = (await redis(['MGET', ...SQUAD_NAMES.map((n) => `bj:${n}`)])) as (string | null)[];
  return SQUAD_NAMES.map((name, i) => {
    let rec: PlayerRecord = freshRecord();
    // Spread over fresh defaults so pre-jul-13 records get zeroed counters.
    try { if (raws[i]) rec = { ...rec, ...(JSON.parse(raws[i] as string) as Partial<PlayerRecord>) }; } catch { /* fresh */ }
    return {
      name,
      net: netOf(rec),
      bankroll: rec.bankroll,
      markers: rec.markers,
      rounds: rec.rounds,
      wins: rec.wins,
      blackjacks: rec.blackjacks,
      biggestWin: rec.biggestWin,
      wonRounds: rec.wonRounds,
      lostRounds: rec.lostRounds,
      pushRounds: rec.pushRounds,
      doubles: rec.doubles,
      splits: rec.splits,
      wagered: rec.wagered,
      biggestLoss: rec.biggestLoss,
      bestStreak: rec.bestStreak,
      playing: !!(rec.round && rec.round.phase === 'player'),
    };
  }).sort((a, b) => b.net - a.net);
}

// The dinner contest ends at landing. The first request after the cutoff
// freezes the board into `contest_final` BEFORE any post-cutoff action can
// mutate it; every later call returns the frozen snapshot.
export interface ContestFinal { at: number; board: BoardRow[] }
export async function ensureContestFinal(now: number): Promise<ContestFinal | null> {
  if (now < BJ_CUTOFF_MS) return null;
  const existing = await getJson<ContestFinal>('contest_final');
  if (existing) return existing;
  const snap: ContestFinal = { at: now, board: await loadBoard() };
  // NX so concurrent first requests can't clobber each other's snapshot
  const won = await setJsonNX('contest_final', snap);
  if (won) return snap;
  return (await getJson<ContestFinal>('contest_final')) ?? snap;
}

export async function loadState(): Promise<SharedState> {
  const [pitches, expenses, casino, pours, days, manifest, tonight, wheelHistory] = await Promise.all([
    getJson<Pitch[]>('pitches'),
    getJson<Expense[]>('expenses'),
    loadBoard(),
    getJson<Pour[]>('pours'),
    getJson<ItinDayOverride[]>('days'),
    getJson<ManifestItem[]>('manifest'),
    getJson<Tonight>('tonight'),
    getJson<string[]>('wheel_history'),
  ]);
  return {
    pitches: pitches ?? ALL_SEED_PITCHES,
    expenses: expenses ?? SEED_EXPENSES,
    casino,
    pours: pours ?? SEED_POURS,
    days,
    manifest: manifest ?? SEED_MANIFEST,
    tonight,
    wheelHistory: wheelHistory ?? [],
  };
}

export async function savePitches(pitches: Pitch[]): Promise<void> {
  await setJson('pitches', pitches);
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await setJson('expenses', expenses);
}

// Tiny helpers for the route handlers (kept dependency-free).
export interface Req { method?: string; body?: unknown }
export interface Res {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (k: string, v: string) => void;
}

export function bad(res: Res, code: number, msg: string) {
  res.status(code).json({ error: msg });
}
