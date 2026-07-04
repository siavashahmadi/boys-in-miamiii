import { ALL_SEED_PITCHES, SEED_EXPENSES, type Expense, type Pitch } from '../../shared/seeds';

// Client for the shared state. Talks to /api/* (Vercel functions + Upstash).
// If the API is unreachable (plain `npm run dev`), falls back to localStorage
// so the whole app still works, just per-browser.

export interface SharedState { pitches: Pitch[]; expenses: Expense[] }

const LS_PITCHES = 'miami_pitches_v1';
const LS_EXPENSES = 'miami_expenses_v1';

let localMode = false;
export const isLocalMode = () => localMode;

function loadLocal(): SharedState {
  let pitches: Pitch[] | null = null;
  let expenses: Expense[] | null = null;
  try { const p = JSON.parse(localStorage.getItem(LS_PITCHES) || 'null'); if (Array.isArray(p)) pitches = p; } catch { /* seed */ }
  try { const e = JSON.parse(localStorage.getItem(LS_EXPENSES) || 'null'); if (Array.isArray(e)) expenses = e; } catch { /* seed */ }
  return {
    pitches: pitches ?? ALL_SEED_PITCHES.map((x) => ({ ...x })),
    expenses: expenses ?? SEED_EXPENSES.map((x) => ({ ...x })),
  };
}

function saveLocal(s: SharedState) {
  try {
    localStorage.setItem(LS_PITCHES, JSON.stringify(s.pitches));
    localStorage.setItem(LS_EXPENSES, JSON.stringify(s.expenses));
  } catch { /* storage full or blocked; nothing to do */ }
}

async function post(path: string, body: unknown): Promise<SharedState | null> {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (r.status === 401) throw new ApiAuthError();
  if (!r.ok) throw new Error(`api ${path} ${r.status}`);
  return (await r.json()) as SharedState;
}

export class ApiAuthError extends Error {
  constructor() { super('unauthorized'); }
}

export async function fetchState(): Promise<SharedState> {
  try {
    const r = await fetch('/api/state');
    if (r.ok) {
      const j = (await r.json()) as SharedState;
      if (Array.isArray(j.pitches) && Array.isArray(j.expenses)) return j;
    }
    throw new Error(`state ${r.status}`);
  } catch {
    localMode = true;
    return loadLocal();
  }
}

export async function addPitch(p: Omit<Pitch, 'id' | 'status' | 'voters'> & { voters?: string[] }): Promise<SharedState> {
  if (localMode) {
    const s = loadLocal();
    const pitch: Pitch = { ...p, id: 'u' + Date.now(), status: 'pending', voters: p.voters ?? [p.requester] };
    s.pitches = [pitch, ...s.pitches];
    saveLocal(s);
    return s;
  }
  return (await post('/api/pitch', { action: 'add', pitch: p }))!;
}

export async function votePitch(id: string, voter: string): Promise<SharedState> {
  if (localMode) {
    const s = loadLocal();
    s.pitches = s.pitches.map((r) => {
      if (r.id !== id) return r;
      const has = r.voters.includes(voter);
      return { ...r, voters: has ? r.voters.filter((v) => v !== voter) : [...r.voters, voter] };
    });
    saveLocal(s);
    return s;
  }
  return (await post('/api/pitch', { action: 'vote', id, voter }))!;
}

export async function verdictPitch(id: string, decision: 'approved' | 'denied', adminKey: string): Promise<SharedState> {
  if (localMode) {
    const s = loadLocal();
    s.pitches = s.pitches.map((r) => (r.id === id ? { ...r, status: decision } : r));
    saveLocal(s);
    return s;
  }
  return (await post('/api/pitch', { action: 'verdict', id, decision, adminKey }))!;
}

export async function addExpense(e: Omit<Expense, 'id'>): Promise<SharedState> {
  if (localMode) {
    const s = loadLocal();
    s.expenses = [{ ...e, id: 'e' + Date.now() }, ...s.expenses];
    saveLocal(s);
    return s;
  }
  return (await post('/api/expense', { action: 'add', expense: e }))!;
}

export async function deleteExpense(id: string): Promise<SharedState> {
  if (localMode) {
    const s = loadLocal();
    s.expenses = s.expenses.filter((e) => e.id !== id);
    saveLocal(s);
    return s;
  }
  return (await post('/api/expense', { action: 'delete', id }))!;
}
