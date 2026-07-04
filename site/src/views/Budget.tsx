import { useState } from 'react';
import type { Expense } from '../../shared/seeds';
import { BUDGET_EMPTY, BUDGET_SUB, SQUAD, squadMeta, TOM_CALLOUT } from '../data/trip';
import { computeBudget, money } from '../lib/settle';

export function Budget({ expenses, whoami, onAdd, onDelete }: {
  expenses: Expense[];
  whoami: string | null;
  onAdd: (e: Omit<Expense, 'id'>) => void;
  onDelete: (id: string) => void;
}) {
  const names = SQUAD.map((s) => s.name);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ desc: '', amount: '', payer: whoami ?? 'Sia', participants: names });

  const bud = computeBudget(names, expenses);
  const perPerson = bud.total / names.length;
  let topSpender = 'nobody', topAmt = -1;
  names.forEach((n) => { if ((bud.paid[n] || 0) > topAmt) { topAmt = bud.paid[n] || 0; topSpender = n; } });

  const stats = [
    { emoji: '💰', label: 'Total spent', value: money(bud.total), sub: `${expenses.length} expense${expenses.length === 1 ? '' : 's'}`, color: 'var(--ink)' },
    { emoji: '👤', label: 'Per person', value: money(perPerson), sub: `split ${names.length} ways`, color: 'var(--c-gold)' },
    { emoji: '🧾', label: 'Expenses', value: String(expenses.length), sub: 'logged so far', color: 'var(--c-teal)' },
    { emoji: '🏆', label: 'Biggest spender', value: expenses.length ? topSpender : 'nobody', sub: expenses.length ? `${money(topAmt)} fronted` : 'the throne is empty', color: 'var(--c-coral)' },
  ];

  const submit = () => {
    const amt = parseFloat(form.amount);
    if (!form.desc.trim()) { alert('what did you buy, exactly?'); return; }
    if (!(amt > 0)) { alert('enter a real dollar amount.'); return; }
    if (!form.participants.length) { alert('split it between at least one person.'); return; }
    onAdd({ desc: form.desc.trim(), amount: Math.round(amt * 100) / 100, payer: form.payer, participants: [...form.participants] });
    setShow(false);
    setForm({ desc: '', amount: '', payer: whoami ?? 'Sia', participants: names });
  };

  return (
    <section className="section" style={{ paddingBottom: 44 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <div className="eyebrow">THE DAMAGE</div>
          <h1 className="h1">Budget &amp; split</h1>
          <div className="sub" style={{ maxWidth: 560 }}>{BUDGET_SUB}</div>
        </div>
        <button className="cta" onClick={() => setShow((s) => !s)}>＋ Add expense</button>
      </div>

      <div style={{ marginBottom: 16, padding: '16px 20px', borderRadius: 16, background: 'var(--c-pink-s)', border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{TOM_CALLOUT.title}</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink2)', lineHeight: 1.55 }}>{TOM_CALLOUT.body}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(158px,1fr))', gap: 12, marginBottom: 16 }}>
        {stats.map((s) => (
          <div key={s.label} className="tile">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 15 }}>{s.emoji}</span>
              <span style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>{s.label}</span>
            </div>
            <div className="serif" style={{ fontSize: 29, lineHeight: 1.05, marginTop: 8, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {show && (
        <div style={{ marginBottom: 16, padding: 24, borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--c-coral)', boxShadow: 'var(--shadowSm)' }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Log an expense 🧾</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
            <label style={{ display: 'block' }}>
              <span className="label-sm">WHAT WAS IT? *</span>
              <input className="input" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="e.g. airbnb deposit" />
            </label>
            <label style={{ display: 'block' }}>
              <span className="label-sm">AMOUNT ($) *</span>
              <input className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} inputMode="decimal" placeholder="0.00" />
            </label>
          </div>
          <div style={{ marginTop: 14 }}>
            <span className="label-sm">WHO PAID?</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {SQUAD.map((s) => {
                const active = form.payer === s.name;
                return (
                  <button key={s.name} onClick={() => setForm({ ...form, payer: s.name })} style={{ padding: '8px 15px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, border: `1px solid ${active ? s.color : 'var(--border)'}`, background: active ? s.color : 'var(--surface2)', color: active ? '#fff' : 'var(--ink2)' }}>
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <span className="label-sm">SPLIT BETWEEN <span style={{ color: 'var(--ink3)', fontWeight: 500 }}>(tap to toggle)</span></span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {SQUAD.map((s) => {
                const active = form.participants.includes(s.name);
                return (
                  <button key={s.name} onClick={() => setForm({ ...form, participants: active ? form.participants.filter((p) => p !== s.name) : [...form.participants, s.name] })} style={{ padding: '8px 15px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, border: `1px solid ${active ? s.color : 'var(--border)'}`, background: active ? s.soft : 'var(--surface2)', color: active ? s.color : 'var(--ink3)' }}>
                    {active ? '✓' : '＋'} {s.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button onClick={submit} style={{ padding: '12px 24px', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 15, color: '#fff', background: 'var(--c-mint)' }}>Add to the tab</button>
            <button onClick={() => setShow(false)} style={{ padding: '12px 20px', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', fontSize: 14, color: 'var(--ink2)', background: 'transparent' }}>nvm</button>
          </div>
        </div>
      )}

      <div className="grid-2col">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadowSm)' }}>
            <div className="list-head">WHO'S UP, WHO'S DOWN</div>
            {SQUAD.map((s) => {
              const net = Math.round((bud.net[s.name] || 0) * 100) / 100;
              const owed = net > 0.01, owes = net < -0.01;
              return (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', flex: '0 0 auto', background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{s.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>paid {money(bud.paid[s.name] || 0)} · owes {money(bud.share[s.name] || 0)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: owed ? 'var(--c-mint)' : owes ? 'var(--c-coral)' : 'var(--ink3)' }}>
                      {(owed ? '+' : owes ? '−' : '') + money(net)}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--ink3)' }}>{owed ? 'is owed' : owes ? 'owes' : 'all square'}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadowSm)' }}>
            <div className="list-head">💸 SETTLE UP</div>
            {bud.settle.length ? (
              <div style={{ padding: '6px 0' }}>
                {bud.settle.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: squadMeta[t.from]?.color ?? 'var(--ink)' }}>{t.from}</span>
                    <span style={{ color: 'var(--ink3)' }}>pays</span>
                    <span style={{ fontWeight: 600, color: squadMeta[t.to]?.color ?? 'var(--ink)' }}>{t.to}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{money(t.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '22px 18px', textAlign: 'center', fontSize: 14, color: 'var(--ink2)' }}>🎉 all square. nobody owes anybody. miracle.</div>
            )}
          </div>
        </div>

        <div style={{ borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadowSm)' }}>
          <div className="list-head">{expenses.length} EXPENSES</div>
          {expenses.map((e) => {
            const parts = e.participants?.length ? e.participants : names;
            const pm = squadMeta[e.payer] ?? { color: 'var(--ink3)', soft: 'var(--surface2)', name: e.payer };
            return (
              <div key={e.id} style={{ display: 'flex', gap: 12, padding: '15px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flex: '0 0 auto', background: pm.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{e.payer[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{e.desc}</div>
                    <div className="serif" style={{ fontSize: 17, whiteSpace: 'nowrap' }}>{money(e.amount)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 2 }}>{e.payer} paid · split {parts.length} ways · {money(e.amount / parts.length)} each</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8, alignItems: 'center' }}>
                    {parts.map((p) => {
                      const m = squadMeta[p] ?? { color: 'var(--ink)', soft: 'var(--surface2)' };
                      return <span key={p} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: m.soft, color: m.color }}>{p}</span>;
                    })}
                    <span style={{ flex: 1 }} />
                    <button onClick={() => onDelete(e.id)} style={{ border: 'none', background: 'transparent', color: 'var(--ink3)', fontSize: 13, cursor: 'pointer' }}>delete</button>
                  </div>
                </div>
              </div>
            );
          })}
          {expenses.length === 0 && (
            <div style={{ padding: '30px 18px', textAlign: 'center', fontSize: 14, color: 'var(--ink2)' }}>{BUDGET_EMPTY}</div>
          )}
        </div>
      </div>
    </section>
  );
}
