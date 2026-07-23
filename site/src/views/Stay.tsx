import { useState } from 'react';
import type { ManifestItem } from '../../shared/seeds';
import { CAT_HEX, ESSENTIALS, HOUSE, HOUSE_DETAIL, HOUSE_INTEL, HOUSE_MAPS_URL, MANIFEST } from '../data/trip';
import type { ManifestAction } from '../lib/api';
import { RealMap } from '../components/RealMap';

// Curated from the actual listing (site/public/house). 1 is the money shot.
const GALLERY = ['/house/1.jpg', '/house/2.jpg', '/house/3.jpg', '/house/4.jpg', '/house/5.jpg', '/house/6.jpg'];

export function Stay({ manifest, whoami, onManifest }: {
  manifest?: ManifestItem[];
  whoami: string | null;
  onManifest: (a: ManifestAction) => Promise<void>;
}) {
  const [shot, setShot] = useState(0);
  const [addForm, setAddForm] = useState({ emoji: '', label: '', note: '' });
  const [manifestBusy, setManifestBusy] = useState(false);

  const items = manifest ?? [];
  const unclaimed = items.filter((m) => !m.claimedBy).length;
  // unclaimed floats to the top so the guilt is visible
  const sorted = [...items.filter((m) => !m.claimedBy), ...items.filter((m) => m.claimedBy)];

  const act = async (a: ManifestAction) => {
    if (manifestBusy) return;
    setManifestBusy(true);
    try { await onManifest(a); } finally { setManifestBusy(false); }
  };

  const addItem = async () => {
    if (!whoami || !addForm.label.trim()) return;
    await act({ action: 'add', emoji: addForm.emoji.trim(), label: addForm.label.trim(), note: addForm.note.trim(), addedBy: whoami });
    setAddForm({ emoji: '', label: '', note: '' });
  };

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

      {/* house intel: the day-of essentials from the check-in email */}
      <div style={{ marginTop: 18, borderRadius: 20, background: 'var(--c-teal-s)', border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)', padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>🗝️ {HOUSE_INTEL.title}</div>
          <span style={{ fontSize: 12, color: 'var(--ink3)' }}>{HOUSE_INTEL.sub}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12, marginTop: 14 }}>
          {HOUSE_INTEL.items.map((it) => (
            <div key={it.label} style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--ink3)', textTransform: 'uppercase' }}>{it.emoji} {it.label}</div>
              {it.href ? (
                <a href={it.href} target={it.href.startsWith('tel:') ? undefined : '_blank'} rel="noreferrer" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--c-teal)', marginTop: 4, textDecoration: 'none', lineHeight: 1.45, wordBreak: 'break-word' }}>
                  {it.value} ↗
                </a>
              ) : (
                <div style={{ fontSize: it.value.length <= 12 ? 22 : 13.5, fontWeight: 700, marginTop: 4, lineHeight: 1.45, fontFamily: it.value.length <= 12 ? "'DM Serif Display',serif" : undefined }}>{it.value}</div>
              )}
            </div>
          ))}
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

      {/* the manifest */}
      <div style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
          <h2 className="h2">🎒 {MANIFEST.title}</h2>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: unclaimed > 0 ? 'var(--c-coral-s)' : 'var(--c-mint-s)', color: unclaimed > 0 ? 'var(--c-coral)' : 'var(--c-mint)' }}>
            {unclaimed > 0 ? `${unclaimed} ${MANIFEST.unclaimedSuffix}` : '✅ all claimed'}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 14, maxWidth: 620 }}>{MANIFEST.sub}</div>
        <div style={{ borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadowSm)' }}>
          {sorted.length === 0 && (
            <div style={{ padding: 18, fontSize: 13, color: 'var(--ink2)' }}>{MANIFEST.allClaimed}</div>
          )}
          {sorted.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--border)', opacity: m.claimedBy ? 0.75 : 1 }}>
              <span style={{ fontSize: 20, flex: '0 0 auto' }}>{m.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.label}</div>
                {m.note && <div style={{ fontSize: 11.5, color: 'var(--ink3)', lineHeight: 1.45 }}>{m.note}</div>}
              </div>
              {m.claimedBy ? (
                <button
                  onClick={() => { if (whoami && whoami === m.claimedBy) act({ action: 'unclaim', id: m.id, name: whoami }); }}
                  disabled={manifestBusy || whoami !== m.claimedBy}
                  title={whoami === m.claimedBy ? 'tap to unclaim' : undefined}
                  style={{ flex: '0 0 auto', padding: '7px 12px', borderRadius: 999, border: 'none', background: 'var(--c-mint-s)', color: 'var(--c-mint)', fontSize: 12, fontWeight: 700, cursor: whoami === m.claimedBy ? 'pointer' : 'default' }}
                >
                  ✅ {m.claimedBy.toLowerCase()}{MANIFEST.claimedSuffix}
                </button>
              ) : (
                <button
                  onClick={() => { if (whoami) act({ action: 'claim', id: m.id, name: whoami }); }}
                  disabled={manifestBusy || !whoami}
                  style={{ flex: '0 0 auto', padding: '8px 14px', borderRadius: 999, border: 'none', background: 'var(--c-coral)', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', opacity: manifestBusy ? 0.5 : 1 }}
                >
                  {MANIFEST.claimBtn}
                </button>
              )}
              <button
                onClick={() => act({ action: 'delete', id: m.id })}
                disabled={manifestBusy}
                title="remove"
                style={{ flex: '0 0 auto', border: 'none', background: 'transparent', color: 'var(--ink3)', fontSize: 14, cursor: 'pointer', padding: 4 }}
              >
                ✕
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, padding: '14px 18px', flexWrap: 'wrap', background: 'var(--surface2)' }}>
            <input className="input" value={addForm.emoji} maxLength={4} onChange={(e) => setAddForm({ ...addForm, emoji: e.target.value })} placeholder={MANIFEST.addEmojiPh} style={{ marginTop: 0, width: 58, flex: '0 0 auto', textAlign: 'center' }} />
            <input className="input" value={addForm.label} maxLength={60} onChange={(e) => setAddForm({ ...addForm, label: e.target.value })} placeholder={MANIFEST.addLabelPh} onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }} style={{ marginTop: 0, flex: '2 1 180px' }} />
            <input className="input" value={addForm.note} maxLength={140} onChange={(e) => setAddForm({ ...addForm, note: e.target.value })} placeholder={MANIFEST.addNotePh} onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }} style={{ marginTop: 0, flex: '3 1 200px' }} />
            <button onClick={addItem} disabled={manifestBusy || !whoami || !addForm.label.trim()} style={{ padding: '11px 18px', borderRadius: 11, border: 'none', background: 'var(--c-teal)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: manifestBusy || !addForm.label.trim() ? 0.5 : 1 }}>
              {MANIFEST.addBtn}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
