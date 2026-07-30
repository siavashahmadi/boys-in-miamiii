import { SQUAD_NAMES, type Expense, type Payment } from '../shared/seeds.js';
import { computePairwise, pairOwed } from '../shared/settle.js';
import { bad, casJson, getRaw, loadState, type Req, type Res } from './_lib.js';

const clamp = (s: unknown, n: number) => String(s ?? '').slice(0, n);
const NAMES = SQUAD_NAMES as readonly string[];

function parsePayments(raw: string | null): Payment[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as Payment[]) : [];
  } catch {
    return [];
  }
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const body = (req.body ?? {}) as Record<string, unknown>;
  try {
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

      // Compare-and-set loop: the guard must be re-run against fresh rows on
      // every attempt so two phones settling at once can't double-record or
      // silently drop each other's payment.
      for (let attempt = 0; attempt < 3; attempt++) {
        const [prevRaw, expensesRaw] = await Promise.all([getRaw('payments'), getRaw('expenses')]);
        const payments = parsePayments(prevRaw);
        const expenses = expensesRaw ? (JSON.parse(expensesRaw) as Expense[]) : [];

        // The ledger is the referee: never record more than what's owed on the
        // pairwise ledger, in exact cents, so a debt can never flip direction.
        const owed = pairOwed(computePairwise([...NAMES], expenses, payments), from, to);
        if (owed < 0.01) return bad(res, 400, 'that debt is already settled. the ledger remembers.');
        if (Math.round(amount * 100) > Math.round(owed * 100)) {
          return bad(res, 400, "that's more than what's owed. generous, but no.");
        }
        if (payments.length >= 200) return bad(res, 400, 'the ledger is full. how are there 200 payments between six people.');

        const payment: Payment = {
          id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6),
          from, to, amount, by, at: Date.now(),
        };
        const next = [payment, ...payments];
        if (await casJson('payments', prevRaw, next)) {
          const state = await loadState();
          state.payments = next;
          return res.status(200).json(state);
        }
      }
      return bad(res, 409, 'the ledger got jostled. try again.');
    }

    if (body.action === 'undo') {
      const id = clamp(body.id, 60);
      if (!id) return bad(res, 400, 'id required');
      for (let attempt = 0; attempt < 3; attempt++) {
        const prevRaw = await getRaw('payments');
        const payments = parsePayments(prevRaw);
        const next = payments.filter((p) => p.id !== id);
        if (next.length === payments.length) {
          const state = await loadState();
          return res.status(200).json(state);
        }
        if (await casJson('payments', prevRaw, next)) {
          const state = await loadState();
          state.payments = next;
          return res.status(200).json(state);
        }
      }
      return bad(res, 409, 'the ledger got jostled. try again.');
    }

    return bad(res, 400, 'unknown action');
  } catch {
    bad(res, 500, 'the ledger is unavailable. try again in a minute.');
  }
}
