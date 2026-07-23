// Minimal Upstash Redis REST client + shared state helpers for the api routes.
// Env vars are injected by the Vercel + Upstash marketplace integration.
import { ALL_SEED_PITCHES, SEED_EXPENSES, SEED_MANIFEST, SEED_POURS, SQUAD_NAMES, type Expense, type ItinDayOverride, type ManifestItem, type Pitch, type Pour, type Tonight } from '../shared/seeds.js';
import { freshRecord, netOf, type BoardRow, type PlayerRecord } from '../shared/blackjack.js';

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

export interface SharedState { pitches: Pitch[]; expenses: Expense[]; casino: BoardRow[]; pours: Pour[]; days: ItinDayOverride[] | null; manifest: ManifestItem[]; tonight: Tonight | null }

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

export async function loadState(): Promise<SharedState> {
  const [pitches, expenses, casino, pours, days, manifest, tonight] = await Promise.all([
    getJson<Pitch[]>('pitches'),
    getJson<Expense[]>('expenses'),
    loadBoard(),
    getJson<Pour[]>('pours'),
    getJson<ItinDayOverride[]>('days'),
    getJson<ManifestItem[]>('manifest'),
    getJson<Tonight>('tonight'),
  ]);
  return {
    pitches: pitches ?? ALL_SEED_PITCHES,
    expenses: expenses ?? SEED_EXPENSES,
    casino,
    pours: pours ?? SEED_POURS,
    days,
    manifest: manifest ?? SEED_MANIFEST,
    tonight,
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
