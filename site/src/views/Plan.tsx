import { DAYS } from '../data/trip';

export function Plan() {
  return (
    <section className="section-wide" style={{ paddingBottom: 20 }}>
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">DAY BY DAY</div>
        <h1 className="h1">The game plan</h1>
        <p className="sub">subject to change, hangovers, and whatever the casino does to joe.</p>
      </div>
      <div className="grid-250" style={{ gap: 16 }}>
        {DAYS.map((d) => (
          <div key={d.label} style={{ borderRadius: 22, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadowSm)' }}>
            <div style={{ padding: '18px 20px', background: d.bg }}>
              <div style={{ fontSize: 12, letterSpacing: 2, fontWeight: 700, color: d.accent }}>{d.label}</div>
              <div className="serif" style={{ fontSize: 23, lineHeight: 1.05, marginTop: 5 }}>{d.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 4 }}>{d.date}</div>
            </div>
            <div style={{ padding: '6px 0' }}>
              {d.items.map((it) => (
                <div key={it.time + it.title} style={{ display: 'flex', gap: 12, padding: '11px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: d.accent, minWidth: 50, paddingTop: 2 }}>{it.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{it.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink3)', lineHeight: 1.45, marginTop: 2 }}>{it.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
