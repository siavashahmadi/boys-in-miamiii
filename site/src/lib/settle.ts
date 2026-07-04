import type { Expense } from '../../shared/seeds';

export interface BudgetSummary {
  total: number;
  paid: Record<string, number>;
  share: Record<string, number>;
  net: Record<string, number>;
  settle: { from: string; to: string; amount: number }[];
}

// Greedy largest-debtor -> largest-creditor matching, ported from the prototype.
export function computeBudget(squadNames: string[], expenses: Expense[]): BudgetSummary {
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

export const money = (n: number) => {
  const r = Math.round(Math.abs(n) * 100) / 100;
  return '$' + (r % 1 === 0
    ? r.toLocaleString('en-US')
    : r.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
};
