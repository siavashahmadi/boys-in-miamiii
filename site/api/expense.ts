import { SQUAD_NAMES, type Expense } from '../shared/seeds.js';
import { bad, loadState, saveExpenses, type Req, type Res } from './_lib.js';

const NAMES = SQUAD_NAMES as readonly string[];

const clamp = (s: unknown, n: number) => String(s ?? '').slice(0, n);

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const body = (req.body ?? {}) as Record<string, unknown>;
  try {
    const state = await loadState();

    if (body.action === 'add') {
      const e = (body.expense ?? {}) as Record<string, unknown>;
      const desc = clamp(e.desc, 100).trim();
      const amount = Math.round(Number(e.amount) * 100) / 100;
      const payer = clamp(e.payer, 30).trim();
      // dedupe + squad-only: a duplicated participant would be double-charged by
      // the pairwise ledger, and an unknown name creates a debt nobody can settle
      const participants = Array.isArray(e.participants)
        ? [...new Set(e.participants.slice(0, 12).map((p) => clamp(p, 30).trim()).filter(Boolean))]
        : [];
      if (!desc) return bad(res, 400, 'desc required');
      if (!(amount > 0) || amount > 1_000_000) return bad(res, 400, 'real dollar amounts only');
      if (!payer || !participants.length) return bad(res, 400, 'payer and participants required');
      if (!NAMES.includes(payer) || participants.some((p) => !NAMES.includes(p))) {
        return bad(res, 400, 'squad members only. the tab does not know strangers.');
      }
      const expense: Expense = {
        id: 'e' + Date.now() + Math.random().toString(36).slice(2, 6),
        desc, amount, payer, participants,
      };
      state.expenses = [expense, ...state.expenses].slice(0, 500);
      await saveExpenses(state.expenses);
      return res.status(200).json(state);
    }

    if (body.action === 'delete') {
      const id = clamp(body.id, 60);
      if (!id) return bad(res, 400, 'id required');
      state.expenses = state.expenses.filter((e) => e.id !== id);
      await saveExpenses(state.expenses);
      return res.status(200).json(state);
    }

    return bad(res, 400, 'unknown action');
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
