import { SQUAD_NAMES, type Payment } from '../shared/seeds.js';
import { computeBudget, pairDebt } from '../shared/settle.js';
import { bad, loadState, savePayments, type Req, type Res } from './_lib.js';

const clamp = (s: unknown, n: number) => String(s ?? '').slice(0, n);
const NAMES = SQUAD_NAMES as readonly string[];

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const body = (req.body ?? {}) as Record<string, unknown>;
  try {
    const state = await loadState();

    if (body.action === 'record') {
      const from = clamp(body.from, 30).trim();
      const to = clamp(body.to, 30).trim();
      const by = clamp(body.by, 30).trim();
      const amount = Math.round(Number(body.amount) * 100) / 100;
      if (!NAMES.includes(from) || !NAMES.includes(to) || !NAMES.includes(by)) {
        return bad(res, 400, 'who are you? pick your name first.');
      }
      if (from === to) return bad(res, 400, 'you cannot pay yourself. this is not money laundering hours.');
      if (!(amount > 0) || amount > 1_000_000) return bad(res, 400, 'real dollar amounts only');

      // The ledger is the referee: never record more than what's actually owed,
      // so double-taps from two phones can't flip a debt the other way.
      const bud = computeBudget([...NAMES], state.expenses, state.payments);
      const owed = pairDebt(bud, from, to);
      if (owed < 0.01) return bad(res, 400, 'that debt is already settled. the ledger remembers.');
      if (amount > owed + 0.02) return bad(res, 400, "that's more than what's owed. generous, but no.");

      const payment: Payment = {
        id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6),
        from, to, amount, by, at: Date.now(),
      };
      state.payments = [payment, ...state.payments].slice(0, 200);
      await savePayments(state.payments);
      return res.status(200).json(state);
    }

    if (body.action === 'undo') {
      const id = clamp(body.id, 60);
      if (!id) return bad(res, 400, 'id required');
      state.payments = state.payments.filter((p) => p.id !== id);
      await savePayments(state.payments);
      return res.status(200).json(state);
    }

    return bad(res, 400, 'unknown action');
  } catch (e) {
    bad(res, 500, e instanceof Error ? e.message : 'redis unavailable');
  }
}
