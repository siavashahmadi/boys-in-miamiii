import type { Expense, Pitch } from '../../shared/seeds';
import { BNBS, CATS, INFO_CARDS, SQUAD, TRIP_META } from '../data/trip';
import { useCountdown } from '../lib/useCountdown';
import { computeBudget, money } from '../lib/settle';
import type { CityWx } from '../lib/weather';
import { WEATHER_CITIES } from '../data/trip';

export function Home({ pitches, expenses, weather }: {
  pitches: Pitch[];
  expenses: Expense[];
  weather: Record<string, CityWx> | null;
}) {
  const cd = useCountdown();
  const bud = computeBudget(SQUAD.map((s) => s.name), expenses);
  const perPerson = bud.total / SQUAD.length;
  const visible = pitches.filter((p) => p.status !== 'denied');
  const approved = visible.filter((p) => p.status === 'approved');
  const pending = visible.filter((p) => p.status === 'pending');
  const booked = BNBS.find((b) => b.status === 'booked');
  const lead = booked ?? BNBS[0];
  const approvedTop = [...approved].sort((a, b) => b.voters.length - a.voters.length).slice(0, 5);
  const budgetTop = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3);

  const stats = [
    { emoji: '🗓️', label: 'Trip length', value: '4 days', sub: '3 nights. zero plans after 2am', color: 'var(--c-coral)' },
    { emoji: '💰', label: 'Total spent', value: money(bud.total), sub: `${expenses.length} expense${expenses.length === 1 ? '' : 's'}`, color: 'var(--ink)' },
    { emoji: '👤', label: 'Per person', value: money(perPerson), sub: 'so far', color: 'var(--c-gold)' },
    { emoji: '✅', label: 'Plans locked', value: String(approved.length), sub: 'approved by sia', color: 'var(--c-mint)' },
    { emoji: '⏳', label: 'Awaiting Sia', value: String(pending.length), sub: 'pending ideas', color: 'var(--c-lav)' },
    { emoji: '🕶️', label: 'The squad', value: String(SQUAD.length), sub: 'locked in', color: 'var(--c-teal)' },
  ];

  const fllNow = weather?.fll?.now ?? WEATHER_CITIES[0].fallbackNow;
  const miaNow = weather?.mia?.now ?? WEATHER_CITIES[1].fallbackNow;

  return (
    <>
      <section className="section" style={{ paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="eyebrow">TRIP DASHBOARD</div>
            <h1 className="h1" style={{ fontSize: 'clamp(30px,5vw,46px)' }}>
              Miami <span className="amp">&amp;</span> Fort Lauderdale
            </h1>
            <div style={{ fontSize: 14, color: 'var(--ink2)', marginTop: 6 }}>{TRIP_META}</div>
          </div>
          <div style={{ textAlign: 'right', padding: '12px 18px', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '1.5px', fontWeight: 600 }}>WHEELS UP IN</div>
            <div className="serif" style={{ fontSize: 32, lineHeight: 1.1, marginTop: 2 }}>
              {cd.days}<span style={{ fontSize: 15, color: 'var(--ink2)' }}>d</span> {cd.hours}<span style={{ fontSize: 15, color: 'var(--ink2)' }}>h</span> {cd.mins}<span style={{ fontSize: 15, color: 'var(--ink2)' }}>m</span> <span style={{ color: 'var(--c-teal)' }}>{cd.secs}</span><span style={{ fontSize: 15, color: 'var(--ink2)' }}>s</span>
            </div>
          </div>
        </div>

        <div className="grid-tiles" style={{ marginTop: 22 }}>
          {stats.map((s) => (
            <div key={s.label} className="tile">
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 15 }}>{s.emoji}</span>
                <span style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>{s.label}</span>
              </div>
              <div className="serif" style={{ fontSize: 30, lineHeight: 1.05, marginTop: 8, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ padding: '34px 22px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
          <h2 className="h2">Getting there &amp; staying</h2>
          <span style={{ fontSize: 13, color: 'var(--ink3)' }}>the boring-but-important stuff.</span>
        </div>
        <div className="grid-cards">
          {INFO_CARDS.map((c) => (
            <div key={c.title} className="card" style={{ padding: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{c.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 17, margin: '14px 0 6px' }}>{c.title}</div>
              <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ padding: '38px 22px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
          <h2 className="h2">Quick look</h2>
          <span style={{ fontSize: 13, color: 'var(--ink3)' }}>jump into the details.</span>
        </div>
        <div className="grid-cards">
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>🏝️ Home base</div>
              <a href="#stay" style={{ fontSize: 12.5, color: 'var(--c-teal)', fontWeight: 600, textDecoration: 'none' }}>the four →</a>
            </div>
            <div className="serif" style={{ fontSize: 24, lineHeight: 1.1, margin: '14px 0 3px' }}>{lead.name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink2)' }}>{booked ? "BOOKED. it's done." : `the presumptive one · ${lead.price}`}</div>
            {!booked && (
              <div style={{ fontSize: 12.5, color: 'var(--c-coral)', marginTop: 10, fontWeight: 600 }}>⚠ not booked. the good ones keep getting sniped.</div>
            )}
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>💸 Budget so far</div>
              <a href="#budget" style={{ fontSize: 12.5, color: 'var(--c-teal)', fontWeight: 600, textDecoration: 'none' }}>Details →</a>
            </div>
            <div style={{ display: 'flex', gap: 20, margin: '14px 0 4px' }}>
              <div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1 }}>{money(bud.total)}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>spent so far</div>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1, color: 'var(--c-gold)' }}>{money(perPerson)}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>per person</div>
              </div>
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {budgetTop.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--ink3)' }}>tab's empty. for now.</div>}
              {budgetTop.map((e) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink2)' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.desc} · {e.payer}</span>
                  <b style={{ color: 'var(--ink)' }}>{money(e.amount)}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>📍 The plan</div>
              <a href="#map" style={{ fontSize: 12.5, color: 'var(--c-teal)', fontWeight: 600, textDecoration: 'none' }}>Map →</a>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', margin: '12px 0 10px' }}>
              <b style={{ color: 'var(--c-mint)' }}>{approved.length} locked in</b> · <b style={{ color: 'var(--c-gold)' }}>{pending.length} awaiting sia</b>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {approvedTop.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ fontSize: 14 }}>{CATS[p.category].emoji}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>🌤️ Weather</div>
              <a href="#weather" style={{ fontSize: 12.5, color: 'var(--c-teal)', fontWeight: 600, textDecoration: 'none' }}>Forecast →</a>
            </div>
            <div style={{ display: 'flex', gap: 18, margin: '14px 0 4px' }}>
              <div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1 }}>{fllNow}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>Fort Lauderdale</div>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1, color: 'var(--c-teal)' }}>{miaNow}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>Miami</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink2)', marginTop: 8 }}>hot, humid, daily 3pm downpour. SPF 30 minimum.</div>
          </div>
        </div>
      </section>
    </>
  );
}
