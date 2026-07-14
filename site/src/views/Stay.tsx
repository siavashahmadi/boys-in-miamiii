import { useState } from 'react';
import { CAT_HEX, ESSENTIALS, HOUSE, HOUSE_DETAIL, HOUSE_MAPS_URL } from '../data/trip';
import { RealMap } from '../components/RealMap';

// Curated from the actual listing (site/public/house). 1 is the money shot.
const GALLERY = ['/house/1.jpg', '/house/2.jpg', '/house/3.jpg', '/house/4.jpg', '/house/5.jpg', '/house/6.jpg'];

export function Stay() {
  const [shot, setShot] = useState(0);

  return (
    <section className="section">
      <div style={{ marginBottom: 18 }}>
        <div className="eyebrow">HOME BASE</div>
        <h1 className="h1">{HOUSE.name}</h1>
        <p className="sub" style={{ maxWidth: 620 }}>
          it's booked. this is where we're posting up for the long weekend.
        </p>
      </div>

      {/* hero card: the sacred banner + listing facts */}
      <div style={{ borderRadius: 22, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ height: 150, background: 'linear-gradient(135deg,#F5C6D3,#F5D9A8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, position: 'relative' }}>
          🏝️
          <span style={{ position: 'absolute', top: 12, right: 12, padding: '6px 12px', borderRadius: 999, background: 'var(--surface)', color: 'var(--c-mint)', fontSize: 12, fontWeight: 700 }}>✅ BOOKED</span>
        </div>
        <div style={{ padding: '22px 24px' }}>
          <div className="serif" style={{ fontSize: 26 }}>{HOUSE.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 3 }}>📍 {HOUSE.area}</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{HOUSE.specs} · {HOUSE.price}</div>
          <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.65, margin: '12px 0 0' }}>{HOUSE.blurb}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            {HOUSE.amenities.map((a) => (
              <span key={a.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '7px 12px', borderRadius: 999, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--ink2)' }}>
                {a.emoji} {a.label}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink3)', marginTop: 14 }}>{HOUSE_DETAIL.reviewsLine}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink3)', marginTop: 4 }}>{HOUSE_DETAIL.hostLine}</div>
          <a href={HOUSE.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 16, padding: '11px 20px', borderRadius: 12, background: 'var(--c-coral)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            peep the listing ↗
          </a>
        </div>
      </div>

      {/* the gallery */}
      <div style={{ marginTop: 18 }}>
        <img
          src={GALLERY[shot]}
          alt="casa de los uncs"
          style={{ width: '100%', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)', display: 'block', maxHeight: 440, objectFit: 'cover' }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {GALLERY.map((g, i) => (
            <img
              key={g}
              src={g}
              alt={`house photo ${i + 1}`}
              onClick={() => setShot(i)}
              style={{ height: 64, width: 96, objectFit: 'cover', borderRadius: 10, cursor: 'pointer', flex: '0 0 auto', border: shot === i ? '2px solid var(--c-coral)' : '1px solid var(--border)', opacity: shot === i ? 1 : 0.75 }}
            />
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 6 }}>{HOUSE_DETAIL.galleryNote}</div>
      </div>

      {/* who sleeps where */}
      <div style={{ marginTop: 26 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h2 className="h2">{HOUSE_DETAIL.sleepsTitle}</h2>
          <span style={{ fontSize: 13, color: 'var(--ink3)' }}>{HOUSE_DETAIL.sleepsSub}</span>
        </div>
        <div className="grid-cards">
          {HOUSE_DETAIL.sleeps.map((r) => (
            <div key={r.name} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{r.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-teal)', fontWeight: 600 }}>{r.beds}</div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.55, marginTop: 10 }}>{r.perk}</div>
            </div>
          ))}
        </div>
      </div>

      {/* the fine print */}
      <div style={{ marginTop: 22, padding: '18px 22px', borderRadius: 18, background: 'var(--surface2)', border: '1px dashed var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>📜 {HOUSE_DETAIL.rulesTitle}</div>
        {HOUSE_DETAIL.rules.map((r) => (
          <div key={r} style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.8 }}>· {r}</div>
        ))}
      </div>

      {/* the map */}
      <div style={{ marginTop: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h2 className="h2">where we at</h2>
          <a href={HOUSE_MAPS_URL} target="_blank" rel="noreferrer" style={{ padding: '9px 16px', borderRadius: 999, background: 'var(--c-teal)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            open in google maps ↗
          </a>
        </div>
        <RealMap
          markers={[{ id: 'house', lat: HOUSE.lat, lng: HOUSE.lng, emoji: '🏠', color: CAT_HEX.culture, title: HOUSE.name }]}
          singleZoom={14}
        />
        <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 8 }}>{HOUSE_DETAIL.mapCaption}</div>
      </div>

      {/* the essentials */}
      <div style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h2 className="h2">The essentials</h2>
          <span style={{ fontSize: 13, color: 'var(--ink3)' }}>researched and verified. distances from the front door. tops are pinned on the map tab.</span>
        </div>
        <div className="grid-cards">
          {ESSENTIALS.map((e) => (
            <div key={e.key} className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{e.emoji} {e.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {e.picks.map((p) => (
                  <div key={p.name}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                      <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 13.5, fontWeight: 700, color: p.top ? 'var(--c-coral)' : 'var(--ink)', textDecoration: 'none' }}>
                        {p.top ? '★ ' : ''}{p.name} ↗
                      </a>
                      <span style={{ fontSize: 11, color: 'var(--ink3)' }}>{p.distMi} mi · {p.driveMin} min</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5, marginTop: 2 }}>{p.why}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
