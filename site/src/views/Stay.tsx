import { HOUSE, HOUSE_MAPS_URL, HOUSE_MAP_EMBED } from '../data/trip';

export function Stay() {
  return (
    <section className="section">
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">HOME BASE</div>
        <h1 className="h1">{HOUSE.name}</h1>
        <p className="sub" style={{ maxWidth: 620 }}>
          it's booked. this is where we're posting up for the long weekend.
        </p>
      </div>

      {/* hero */}
      <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)', background: 'var(--surface)' }}>
        <div style={{ height: 150, background: 'linear-gradient(135deg,#F5C6D3,#F5D9A8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, position: 'relative' }}>
          🏝️
          <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--surface)', padding: '6px 13px', borderRadius: 999, fontWeight: 700, fontSize: 14, color: 'var(--c-mint)', border: '1px solid var(--border)' }}>✅ BOOKED</span>
        </div>
        <div style={{ padding: '22px 24px' }}>
          <div className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>{HOUSE.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink3)', margin: '6px 0 2px' }}>📍 {HOUSE.area}</div>
          <div style={{ fontSize: 13, color: 'var(--ink3)' }}>{HOUSE.specs} · {HOUSE.price}</div>
          <p style={{ fontSize: 14.5, color: 'var(--ink2)', lineHeight: 1.65, margin: '16px 0 0' }}>{HOUSE.blurb}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
            {HOUSE.amenities.map((a) => (
              <span key={a.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '8px 13px', borderRadius: 999, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--ink2)' }}>
                <span style={{ fontSize: 15 }}>{a.emoji}</span> {a.label}
              </span>
            ))}
          </div>

          <a href={HOUSE.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, padding: '11px 18px', borderRadius: 13, fontWeight: 600, fontSize: 14, background: 'var(--surface2)', color: 'var(--ink)', textDecoration: 'none', border: '1px solid var(--border)' }}>
            peep the listing ↗
          </a>
        </div>
      </div>

      {/* map */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h2 className="h2" style={{ fontSize: 'clamp(20px,3vw,26px)' }}>where we at</h2>
          <a href={HOUSE_MAPS_URL} target="_blank" rel="noreferrer" style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', background: 'var(--c-teal)', padding: '9px 16px', borderRadius: 12, textDecoration: 'none' }}>
            open in google maps ↗
          </a>
        </div>
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)', lineHeight: 0 }}>
          <iframe
            title="Casa de los Uncs on the map"
            src={HOUSE_MAP_EMBED}
            width="100%"
            height="360"
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 8 }}>
          centered on fort lauderdale for now. exact pin drops once we've got the street address.
        </p>
      </div>
    </section>
  );
}
