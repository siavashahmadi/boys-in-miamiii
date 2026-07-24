import { useState } from 'react';
import { PACKING, WEATHER_CITIES, WEATHER_FALLBACK_NOTE, WEATHER_FEELS_NOTE, WEATHER_HOURLY_HINT, WEATHER_HOURLY_OFFLINE, WEATHER_SUB } from '../data/trip';
import type { CityWx } from '../lib/weather';

const rainColor = (rain: string) => {
  const n = parseInt(rain, 10);
  if (Number.isNaN(n)) return 'var(--ink3)';
  if (n >= 60) return 'var(--c-coral)';
  if (n >= 30) return 'var(--c-gold)';
  return 'var(--ink3)';
};

export function Weather({ weather }: { weather: Record<string, CityWx> | null }) {
  const anyLive = !!weather && Object.values(weather).some((w) => w.days);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="section" style={{ paddingBottom: 44 }}>
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">THE FORECAST</div>
        <h1 className="h1">Weather</h1>
        <p className="sub" style={{ maxWidth: 580 }}>{WEATHER_SUB}</p>
        <p style={{ fontSize: 12.5, color: 'var(--c-teal)', margin: '8px 0 0', fontWeight: 600 }}>👆 {WEATHER_HOURLY_HINT}</p>
        {!anyLive && (
          <p style={{ fontSize: 12.5, color: 'var(--c-gold)', margin: '8px 0 0', fontWeight: 600 }}>⏳ {WEATHER_FALLBACK_NOTE}</p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {WEATHER_CITIES.map((c) => {
          const live = weather?.[c.key];
          const now = live?.now ?? c.fallbackNow;
          const days = live?.days ?? c.fallbackDays;
          const sel = days.find((d) => expanded === `${c.key}-${d.date}`) ?? null;
          return (
            <div key={c.key} style={{ borderRadius: 22, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '18px 22px', background: c.soft }}>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: '1.5px', fontWeight: 700, color: c.accent }}>{c.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 2 }}>{c.note}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="serif" style={{ fontSize: 34, lineHeight: 1 }}>{now}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>right now</div>
                  {live?.nowFeels && (
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: c.accent }}>feels {live.nowFeels}</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(128px,1fr))', gap: 12, padding: '18px 22px' }}>
                {days.map((d) => {
                  const key = `${c.key}-${d.date}`;
                  const open = expanded === key;
                  return (
                    <div
                      key={d.date}
                      onClick={() => setExpanded(open ? null : key)}
                      style={{ padding: '16px 12px', borderRadius: 16, background: 'var(--surface2)', border: open ? `2px solid ${c.accent}` : '1px solid var(--border)', textAlign: 'center', cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--ink2)' }}>{d.day}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{d.date}</div>
                      <div style={{ fontSize: 34, margin: '8px 0 4px' }}>{d.icon}</div>
                      <div className="serif" style={{ fontSize: 20 }}>
                        {d.hi}<span style={{ color: 'var(--ink3)', fontSize: 15 }}> / {d.lo}</span>
                      </div>
                      {d.feels && (
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: c.accent, marginTop: 2 }}>feels {d.feels}</div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 4 }}>{d.cond}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--c-teal)', marginTop: 3 }}>💧 {d.rain}</div>
                      <div style={{ fontSize: 9, color: 'var(--ink3)', marginTop: 6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' }}>▼</div>
                    </div>
                  );
                })}
              </div>
              {sel && (
                <div style={{ padding: '0 22px 18px' }}>
                  <div style={{ borderRadius: 16, background: 'var(--surface2)', border: '1px solid var(--border)', padding: '14px 16px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--ink2)', marginBottom: 10 }}>
                      {sel.day} {sel.date} · HOUR BY HOUR
                    </div>
                    {sel.hours && sel.hours.length > 0 ? (
                      <>
                        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
                          {sel.hours.map((h) => (
                            <div key={h.time} style={{ flex: '0 0 auto', minWidth: 52, textAlign: 'center', padding: '8px 4px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink3)' }}>{h.time}</div>
                              <div style={{ fontSize: 18, margin: '3px 0' }}>{h.icon}</div>
                              <div style={{ fontSize: 14, fontWeight: 700 }}>{h.feels}</div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: rainColor(h.rain), marginTop: 2 }}>💧{h.rain}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 8 }}>{WEATHER_FEELS_NOTE}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12.5, color: 'var(--ink2)' }}>{WEATHER_HOURLY_OFFLINE}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div style={{ padding: 22, borderRadius: 20, background: 'var(--c-gold-s)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{PACKING.title}</div>
          <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6 }}>{PACKING.body}</div>
        </div>
      </div>
    </section>
  );
}
