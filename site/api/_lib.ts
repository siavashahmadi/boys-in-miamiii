// Minimal Upstash Redis REST client + shared state helpers for the api routes.
// Env vars are injected by the Vercel + Upstash marketplace integration.
import { ALL_SEED_PITCHES, SEED_EXPENSES, type Expense, type Pitch } from '../shared/seeds';

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

async function getJson<T>(key: string): Promise<T | null> {
  const raw = (await redis(['GET', key])) as string | null;
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

async function setJson(key: string, value: unknown): Promise<void> {
  await redis(['SET', key, JSON.stringify(value)]);
}

export interface SharedState { pitches: Pitch[]; expenses: Expense[] }

export async function loadState(): Promise<SharedState> {
  const [pitches, expenses] = await Promise.all([
    getJson<Pitch[]>('pitches'),
    getJson<Expense[]>('expenses'),
  ]);
  return {
    pitches: pitches ?? ALL_SEED_PITCHES,
    expenses: expenses ?? SEED_EXPENSES,
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
