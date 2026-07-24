import { ALL_SEED_PITCHES, SEED_EXPENSES, SEED_MANIFEST, SEED_POURS, type CatKey, type Expense, type ItinDayOverride, type ManifestItem, type Pitch, type Pour, type Tonight } from '../../shared/seeds';
import type { BoardRow, SanitizedPlayer } from '../../shared/blackjack';

// Client for the shared state. Talks to /api/* (Vercel functions + Upstash).
// If the API is unreachable (plain `npm run dev`), falls back to localStorage
// so the whole app still works, just per-browser.

export interface SharedState { pitches: Pitch[]; expenses: Expense[]; casino?: BoardRow[]; pours?: Pour[]; days?: ItinDayOverride[] | null; manifest?: ManifestItem[]; tonight?: Tonight | null; wheelHistory?: string[] }

export interface BJResponse {
  me: SanitizedPlayer;
  board: BoardRow[] | null; // null when the action couldn't have moved the board
  cutoff: number;
  closed: boolean;
  contest?: { name: string | null; net: number } | null; // frozen dinner winner
  prophecy?: { fresh: boolean; by: string }; // dealt the black jacks
}

export interface RouletteResponse extends Omit<BJResponse, 'prophecy'> {
  pocket: string;
  color: 'green' | 'red' | 'black';
  net: number;
  payout: number;
  staked: number;
  history: string[];
}

const LS_PITCHES = 'miami_pitches_v1';
const LS_EXPENSES = 'miami_expenses_v1';
const LS_POURS = 'miami_pours_v1';

let localMode = false;
export const isLocalMode = () => localMode;

function loadLocal(): SharedState {
  let pitches: Pitch[] | null = null;
  let expenses: Expense[] | null = null;
  let pours: Pour[] | null = null;
  try { const p = JSON.parse(localStorage.getItem(LS_PITCHES) || 'null'); if (Array.isArray(p)) pitches = p; } catch { /* seed */ }
  try { const e = JSON.parse(localStorage.getItem(LS_EXPENSES) || 'null'); if (Array.isArray(e)) expenses = e; } catch { /* seed */ }
  try { const o = JSON.parse(localStorage.getItem(LS_POURS) || 'null'); if (Array.isArray(o)) pours = o; } catch { /* seed */ }
  let days: ItinDayOverride[] | null = null;
  try { const d = JSON.parse(localStorage.getItem('miami_days_v1') || 'null'); if (Array.isArray(d)) days = d; } catch { /* static */ }
  let manifest: ManifestItem[] | null = null;
  try { const m = JSON.parse(localStorage.getItem('miami_manifest_v1') || 'null'); if (Array.isArray(m)) manifest = m; } catch { /* seed */ }
  return {
    pitches: pitches ?? ALL_SEED_PITCHES.map((x) => ({ ...x })),
    expenses: expenses ?? SEED_EXPENSES.map((x) => ({ ...x })),
    pours: pours ?? SEED_POURS.map((x) => ({ ...x })),
    days,
    manifest: manifest ?? SEED_MANIFEST.map((x) => ({ ...x })),
  };
}

function saveLocal(s: SharedState) {
  try {
    localStorage.setItem(LS_PITCHES, JSON.stringify(s.pitches));
    localStorage.setItem(LS_EXPENSES, JSON.stringify(s.expenses));
    localStorage.setItem(LS_POURS, JSON.stringify(s.pours ?? []));
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
      if (Array.isArray(j.pitches) && Array.isArray(j.expenses)) {
        // un-latch local mode when the server is reachable again (hotel wifi
        // blips must not silently fork writes into localStorage forever)
        localMode = false;
        return j;
      }
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

export type ManifestAction =
  | { action: 'add'; emoji: string; label: string; note: string; addedBy: string }
  | { action: 'claim' | 'unclaim'; id: string; name: string }
  | { action: 'delete'; id: string };

export async function manifestAct(a: ManifestAction): Promise<SharedState> {
  if (localMode) {
    const s = loadLocal();
    let list = s.manifest ?? SEED_MANIFEST.map((x) => ({ ...x }));
    if (a.action === 'add') list = [...list, { id: 'm' + Date.now(), emoji: a.emoji || '🧳', label: a.label, note: a.note, claimedBy: null, addedBy: a.addedBy }];
    else if (a.action === 'claim') list = list.map((m) => (m.id === a.id && !m.claimedBy ? { ...m, claimedBy: a.name } : m));
    else if (a.action === 'unclaim') list = list.map((m) => (m.id === a.id && m.claimedBy === a.name ? { ...m, claimedBy: null } : m));
    else list = list.filter((m) => m.id !== a.id);
    s.manifest = list;
    try { localStorage.setItem('miami_manifest_v1', JSON.stringify(list)); } catch { /* fine */ }
    return s;
  }
  return (await post('/api/manifest', a))!;
}

export interface PinnedPitchInput {
  title: string;
  category: CatKey;
  place: string;
  note: string;
  link: string;
  lat: number;
  lng: number;
}

export async function addPinnedPitch(pin: PinnedPitchInput, adminKey: string): Promise<SharedState> {
  if (localMode) {
    const s = loadLocal();
    const pitch: Pitch = {
      id: 'a' + Date.now(), title: pin.title, category: pin.category, place: pin.place || 'somewhere in florida',
      mx: 0, my: 0, lat: pin.lat, lng: pin.lng, link: pin.link,
      note: pin.note || 'the king decreed it. no defense necessary.',
      who: ['Sia'], requester: 'Sia', voters: ['Sia'], status: 'approved',
    };
    s.pitches = [pitch, ...s.pitches];
    saveLocal(s);
    return s;
  }
  return (await post('/api/pitch', { action: 'add-pinned', pitch: pin, adminKey }))!;
}

export async function saveItinerary(days: ItinDayOverride[], adminKey: string): Promise<SharedState> {
  if (localMode) {
    const s = loadLocal();
    s.days = days;
    try { localStorage.setItem('miami_days_v1', JSON.stringify(days)); } catch { /* fine */ }
    return s;
  }
  return (await post('/api/itinerary', { action: 'save', days, adminKey }))!;
}

export async function savePour(name: string, text: string): Promise<SharedState> {
  if (localMode) {
    const s = loadLocal();
    s.pours = [...(s.pours ?? []).filter((p) => p.name !== name), { name, text, updatedAt: Date.now() }];
    saveLocal(s);
    return s;
  }
  return (await post('/api/pour', { name, text }))!;
}

export interface RouletteBetInput { kind: string; pocket?: string; target?: number; amount: number }

export async function rouletteSpin(name: string, bets: RouletteBetInput[]): Promise<RouletteResponse> {
  const r = await fetch('/api/roulette', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'spin', name, bets }),
  });
  if (r.status === 401) throw new ApiAuthError();
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error((j as { error?: string } | null)?.error || `wheel error ${r.status}`);
  return j as RouletteResponse;
}

// Blackjack runs server-side only (the deck must never exist in a browser),
// so there's no localStorage fallback: the Casino view shows a notice instead.
export async function bj(
  action: 'state' | 'deal' | 'hit' | 'stand' | 'double' | 'split' | 'marker',
  name: string,
  bet?: number,
): Promise<BJResponse> {
  const r = await fetch('/api/blackjack', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action, name, bet }),
  });
  if (r.status === 401) throw new ApiAuthError();
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error((j as { error?: string } | null)?.error || `table error ${r.status}`);
  return j as BJResponse;
}
