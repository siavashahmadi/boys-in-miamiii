import type { Expense, Payment } from './seeds.js';

export interface BudgetSummary {
  total: number;
  paid: Record<string, number>;
  share: Record<string, number>;
  net: Record<string, number>;
  settle: { from: string; to: string; amount: number }[];
}

// Greedy largest-debtor -> largest-creditor matching, ported from the prototype.
// Recorded payments shift the nets before matching, so a settled debt drops off
// the list and a partial payment leaves the remainder.
export function computeBudget(squadNames: string[], expenses: Expense[], payments: Payment[] = []): BudgetSummary {
  const paid: Record<string, number> = {};
  const share: Record<string, number> = {};
  squadNames.forEach((n) => { paid[n] = 0; share[n] = 0; });
  let total = 0;
  expenses.forEach((e) => {
    total += e.amount;
    if (paid[e.payer] === undefined) paid[e.payer] = 0;
    paid[e.payer] += e.amount;
    const parts = e.participants && e.participants.length ? e.participants : squadNames;
    const per = e.amount / parts.length;
    parts.forEach((p) => { if (share[p] === undefined) share[p] = 0; share[p] += per; });
  });
  const net: Record<string, number> = {};
  Object.keys(paid).forEach((n) => { net[n] = paid[n] - share[n]; });

  payments.forEach((p) => {
    if (net[p.from] === undefined) net[p.from] = 0;
    if (net[p.to] === undefined) net[p.to] = 0;
    net[p.from] += p.amount;
    net[p.to] -= p.amount;
  });

  const creditors: { name: string; amt: number }[] = [];
  const debtors: { name: string; amt: number }[] = [];
  squadNames.forEach((n) => {
    const v = Math.round(net[n] * 100) / 100;
    if (v > 0.01) creditors.push({ name: n, amt: v });
    else if (v < -0.01) debtors.push({ name: n, amt: -v });
  });
  creditors.sort((a, b) => b.amt - a.amt);
  debtors.sort((a, b) => b.amt - a.amt);
  const settle: BudgetSummary['settle'] = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci], d = debtors[di];
    const pay = Math.min(c.amt, d.amt);
    settle.push({ from: d.name, to: c.name, amount: Math.round(pay * 100) / 100 });
    c.amt -= pay; d.amt -= pay;
    if (c.amt < 0.01) ci++;
    if (d.amt < 0.01) di++;
  }
  return { total, paid, share, net, settle };
}

export interface PairLine { from: string; to: string; amount: number }

// The traceable ledger: one line per pair of people, netted within the pair
// only. Unlike the greedy matcher above, nothing routes through third parties,
// so every amount maps to actual shared expenses. Rounding happens once at the
// end (rounding inside the loop is how the greedy plan strands cents).
export function computePairwise(squadNames: string[], expenses: Expense[], payments: Payment[] = []): PairLine[] {
  const bal: Record<string, Record<string, number>> = {};
  const owe = (a: string, b: string, amt: number) => {
    if (!bal[a]) bal[a] = {};
    bal[a][b] = (bal[a][b] ?? 0) + amt;
  };

  expenses.forEach((e) => {
    const parts = e.participants && e.participants.length ? e.participants : squadNames;
    const per = e.amount / parts.length;
    parts.forEach((p) => { if (p !== e.payer) owe(p, e.payer, per); });
  });
  payments.forEach((p) => owe(p.from, p.to, -p.amount));

  const people = new Set<string>();
  Object.keys(bal).forEach((a) => { people.add(a); Object.keys(bal[a]).forEach((b) => people.add(b)); });
  const list = [...people].sort();

  const lines: PairLine[] = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      const raw = (bal[a]?.[b] ?? 0) - (bal[b]?.[a] ?? 0);
      // dead zone: paying a displayed (rounded) line leaves up to a half-cent
      // of float residue; without this, that residue can round back up into a
      // phantom or even reversed one-cent line
      if (Math.abs(raw) < 0.0051) continue;
      const net = Math.round(raw * 100) / 100;
      if (net >= 0.01) lines.push({ from: a, to: b, amount: net });
      else if (net <= -0.01) lines.push({ from: b, to: a, amount: -net });
    }
  }
  lines.sort((x, y) => y.amount - x.amount);
  return lines;
}

// What `from` currently owes `to` on the pairwise ledger (0 if nothing).
export function pairOwed(lines: PairLine[], from: string, to: string): number {
  const line = lines.find((t) => t.from === from && t.to === to);
  return line ? line.amount : 0;
}

export const money = (n: number) => {
  const r = Math.round(Math.abs(n) * 100) / 100;
  return '$' + (r % 1 === 0
    ? r.toLocaleString('en-US')
    : r.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
};
