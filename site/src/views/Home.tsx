import { useState } from 'react';
import { POURERS, type Expense, type ManifestItem, type Pitch, type Pour } from '../../shared/seeds';
import type { BoardRow } from '../../shared/blackjack';
import { CATS, DAYS, HOUSE, INFO_CARDS, PHASE, POUR, SQUAD, squadMeta, TRIP_META, type Day } from '../data/trip';
import { useCountdown, useElapsed } from '../lib/useCountdown';
import { computeBudget, money } from '../lib/settle';
import { etDateStr, horoscopeFor } from '../lib/horoscope';
import { TRIP_START_MS, tripDayIndex, tripPhase } from '../lib/tripPhase';
import { Ticker } from '../components/Ticker';
import type { CityWx } from '../lib/weather';
import { WEATHER_CITIES } from '../data/trip';

export function Home({ pitches, expenses, weather, casino, pours, whoami, onDeclarePour, days = DAYS, manifest }: {
  pitches: Pitch[];
  expenses: Expense[];
  weather: Record<string, CityWx> | null;
  casino?: BoardRow[];
  pours?: Pour[];
  whoami: string | null;
  onDeclarePour: (text: string) => Promise<void>;
  days?: Day[];
  manifest?: ManifestItem[];
}) {
  const [pourDraft, setPourDraft] = useState('');
  const [pourEditing, setPourEditing] = useState(false);
  const [pourSaving, setPourSaving] = useState(false);
  const myPour = whoami ? pours?.find((p) => p.name === whoami) : undefined;
  const canPour = !!whoami && (POURERS as readonly string[]).includes(whoami);

  const submitPour = async () => {
    const text = pourDraft.trim();
    if (!text || pourSaving) return;
    setPourSaving(true);
    try {
      await onDeclarePour(text);
      setPourEditing(false);
      setPourDraft('');
    } finally {
      setPourSaving(false);
    }
  };
  const cd = useCountdown();
  const phase = tripPhase();
  const elapsed = useElapsed(TRIP_START_MS);
  const todayStr = etDateStr();
  const dayIdx = tripDayIndex();
  const bud = computeBudget(SQUAD.map((s) => s.name), expenses);
  const perPerson = bud.total / SQUAD.length;
  const visible = pitches.filter((p) => p.status !== 'denied');
  const boardTop = visible.slice(0, 5);
  const budgetTop = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3);

  const stats = [
    { emoji: '🕶️', label: 'The squad', value: String(SQUAD.length), sub: 'locked in', color: 'var(--c-teal)' },
    { emoji: '🗓️', label: 'Trip length', value: '4 days', sub: '3 nights, zero plans after 2am', color: 'var(--c-coral)' },
    { emoji: '🏠', label: 'The crib', value: '✅', sub: 'casa de los uncs', color: 'var(--c-mint)' },
    { emoji: '🚗', label: 'The whip', value: '✅', sub: 'minivan gang', color: 'var(--c-lav)' },
    { emoji: '💰', label: 'Total spent', value: money(bud.total), sub: `${expenses.length} expense${expenses.length === 1 ? '' : 's'}`, color: 'var(--ink)' },
    { emoji: '👤', label: 'Per person', value: money(perPerson), sub: 'so far', color: 'var(--c-gold)' },
  ];

  const fllNow = weather?.fll?.now ?? WEATHER_CITIES[0].fallbackNow;
  const miaNow = weather?.mia?.now ?? WEATHER_CITIES[1].fallbackNow;

  return (
    <>
      <Ticker casino={casino} pours={pours} days={days} manifest={manifest} />
      <section className="section" style={{ paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="eyebrow">{phase === 'trip' ? PHASE.tripEyebrow : phase === 'after' ? PHASE.afterEyebrow : 'TRIP DASHBOARD'}</div>
            <h1 className="h1" style={{ fontSize: 'clamp(30px,5vw,46px)' }}>
              Miami <span className="amp">&amp;</span> Fort Lauderdale
            </h1>
            <div style={{ fontSize: 14, color: 'var(--ink2)', marginTop: 6 }}>{TRIP_META}</div>
          </div>
          {phase === 'pre' && (
            <div style={{ textAlign: 'right', padding: '12px 18px', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)' }}>
              <div style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '1.5px', fontWeight: 600 }}>WHEELS UP IN</div>
              <div className="serif" style={{ fontSize: 32, lineHeight: 1.1, marginTop: 2 }}>
                {cd.days}<span style={{ fontSize: 15, color: 'var(--ink2)' }}>d</span> {cd.hours}<span style={{ fontSize: 15, color: 'var(--ink2)' }}>h</span> {cd.mins}<span style={{ fontSize: 15, color: 'var(--ink2)' }}>m</span> <span style={{ color: 'var(--c-teal)' }}>{cd.secs}</span><span style={{ fontSize: 15, color: 'var(--ink2)' }}>s</span>
              </div>
            </div>
          )}
          {phase === 'trip' && (
            <div style={{ textAlign: 'right', padding: '12px 18px', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)' }}>
              <div style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '1.5px', fontWeight: 600 }}>DAY {dayIdx + 1} OF 4 · {PHASE.hoursLabel}</div>
              <div className="serif" style={{ fontSize: 32, lineHeight: 1.1, marginTop: 2, color: 'var(--c-teal)' }}>
                {elapsed.totalHours}<span style={{ fontSize: 15, color: 'var(--ink2)' }}>h</span>
              </div>
            </div>
          )}
          {phase === 'after' && (
            <div style={{ textAlign: 'right', padding: '12px 18px', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)', maxWidth: 260 }}>
              <div style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '1.5px', fontWeight: 600 }}>{PHASE.overLabel}</div>
              <div className="serif" style={{ fontSize: 26, lineHeight: 1.1, marginTop: 2 }}>🕯️</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 4 }}>{PHASE.overSub}</div>
            </div>
          )}
        </div>

        {phase === 'trip' && (
          <div className="card" style={{ padding: 20, marginTop: 20, borderLeft: `4px solid ${days[dayIdx].accent}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>📍 {PHASE.todayTitle}</div>
              <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{days[dayIdx].label} · {days[dayIdx].title}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {days[dayIdx].items.map((it) => (
                <div key={it.time + it.title} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                  <span style={{ color: days[dayIdx].accent, fontWeight: 700, minWidth: 52 }}>{it.time}</span>
                  <span>{it.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 22 }}>
          {stats.map((s) => (
            <div key={s.label} className="tile" style={{ flex: '1 1 148px', maxWidth: 220, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
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
              <a href="#stay" style={{ fontSize: 12.5, color: 'var(--c-teal)', fontWeight: 600, textDecoration: 'none' }}>the spot →</a>
            </div>
            <div className="serif" style={{ fontSize: 24, lineHeight: 1.1, margin: '14px 0 3px' }}>{HOUSE.name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink2)' }}>{HOUSE.area} · {HOUSE.specs}</div>
            <div style={{ fontSize: 12.5, color: 'var(--c-mint)', marginTop: 10, fontWeight: 600 }}>✅ booked. heated pool, pool table, enough bathrooms.</div>
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
              <div style={{ fontWeight: 700, fontSize: 16 }}>📍 The board</div>
              <a href="#map" style={{ fontSize: 12.5, color: 'var(--c-teal)', fontWeight: 600, textDecoration: 'none' }}>Map →</a>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', margin: '12px 0 10px' }}>
              spots on the map. some real, some deeply unserious. pitch your own.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {boardTop.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ fontSize: 14 }}>{CATS[p.category].emoji}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>🃏 The practice table</div>
              <a href="#casino" style={{ fontSize: 12.5, color: 'var(--c-teal)', fontWeight: 600, textDecoration: 'none' }}>Play →</a>
            </div>
            {casino && casino.some((b) => b.rounds > 0) ? (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {casino.slice(0, 3).map((b, i) => {
                  const up = b.net > 0.005;
                  const down = b.net < -0.005;
                  return (
                    <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: squadMeta[b.name]?.color ?? 'var(--ink3)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{b.name[0]}</span>
                      <span style={{ flex: 1 }}>{b.name} {i === 0 && up ? '👑' : ''}</span>
                      <b style={{ color: up ? 'var(--c-mint)' : down ? 'var(--c-coral)' : 'var(--ink3)' }}>{up ? '+' : down ? '-' : ''}{money(b.net)}</b>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--ink2)', margin: '12px 0 0' }}>blackjack with $1,000 house money. nobody's sat down yet.</div>
            )}
            <div style={{ fontSize: 12.5, color: 'var(--c-gold)', marginTop: 10, fontWeight: 600 }}>most winnings when we land in FLL: dinner paid by the rest of the group.</div>
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 6 }}>record single-session loss: joe, -$15,500. pour one out.</div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{POUR.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6, margin: '10px 0 12px' }}>{POUR.lore}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {POURERS.map((name) => {
                const p = pours?.find((x) => x.name === name);
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', flex: '0 0 auto', background: squadMeta[name]?.color ?? 'var(--ink3)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{name[0]}</span>
                    <span style={{ lineHeight: 1.45 }}>
                      <b>{name}:</b>{' '}
                      {p ? <span style={{ color: 'var(--ink2)' }}>{p.text}</span> : <span style={{ color: 'var(--ink3)', fontStyle: 'italic' }}>{POUR.undeclared}</span>}
                    </span>
                  </div>
                );
              })}
            </div>
            {canPour && (
              pourEditing ? (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input
                    value={pourDraft}
                    onChange={(e) => setPourDraft(e.target.value)}
                    maxLength={140}
                    placeholder={POUR.inputPlaceholder}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitPour(); }}
                    style={{ flex: 1, minWidth: 0, padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--ink)', fontSize: 12.5, fontFamily: 'inherit' }}
                  />
                  <button onClick={submitPour} disabled={pourSaving || !pourDraft.trim()} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: 'var(--c-teal)', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', opacity: pourSaving || !pourDraft.trim() ? 0.5 : 1 }}>
                    {pourSaving ? '...' : POUR.saveBtn}
                  </button>
                </div>
              ) : (
                <button onClick={() => { setPourDraft(myPour?.text ?? ''); setPourEditing(true); }} style={{ marginTop: 12, padding: '8px 14px', borderRadius: 10, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--c-teal)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                  {myPour ? POUR.editBtn : POUR.saveBtn} →
                </button>
              )
            )}
            {whoami === 'Tom' && (
              <div style={{ fontSize: 12.5, color: 'var(--c-coral)', fontWeight: 600, marginTop: 12 }}>{POUR.tomLine}</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 12, lineHeight: 1.5 }}>
              {POUR.statementLabel} <i>{POUR.statement}</i>
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{PHASE.horoscopeTitle}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {SQUAD.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', flex: '0 0 auto', background: s.color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{s.name[0]}</span>
                  <span style={{ lineHeight: 1.45 }}>
                    <b>{s.name.toLowerCase()}:</b> <span style={{ color: 'var(--ink2)' }}>{horoscopeFor(s.name, todayStr)}</span>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 12 }}>{PHASE.horoscopeFoot}</div>
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
            <div style={{ fontSize: 12.5, color: 'var(--ink2)', marginTop: 8 }}>hot, humid, daily 3pm downpour. SPF 50 minimum.</div>
          </div>
        </div>
      </section>

    </>
  );
}
