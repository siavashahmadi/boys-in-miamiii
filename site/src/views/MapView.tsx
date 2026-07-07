import { useState } from 'react';
import type { CatKey, Pitch } from '../../shared/seeds';
import { AREA_MAPS_URL, CATS, CAT_HEX, MAP_PINS } from '../data/trip';
import { Graveyard } from '../components/Graveyard';
import { RealMap, type MapMarker } from '../components/RealMap';

type Filter = 'all' | CatKey;

function decorate(p: Pitch, whoami: string | null) {
  const cat = CATS[p.category] ?? CATS.chaos;
  const pending = p.status === 'pending';
  const voted = !!whoami && p.voters.includes(whoami);
  const who = (p.who || []).filter((w) => w && w !== p.requester);
  return {
    cat, pending, voted,
    votes: p.voters.length,
    badge: pending ? '⏳ AWAITING APPROVAL' : '✅ LOCKED IN',
    badgeBg: pending ? 'var(--c-gold-s)' : 'var(--c-mint-s)',
    badgeCol: pending ? 'var(--c-gold)' : 'var(--c-mint)',
    statusLabel: pending ? 'pending' : 'locked in',
    whoStr: who.join(', '),
  };
}

export function MapView({ pitches, whoami, onVote, onAdd, initialSelected }: {
  pitches: Pitch[];
  whoami: string | null;
  onVote: (id: string) => void;
  onAdd: (p: { title: string; category: CatKey; link: string; note: string; who: string[]; requester: string }) => void;
  initialSelected?: string | null;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<string | null>(initialSelected ?? null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', link: '', note: '' });

  const visible = pitches.filter((p) => p.status !== 'denied');
  const filtered = filter === 'all' ? visible : visible.filter((p) => p.category === filter);
  const list = [...filtered].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return b.voters.length - a.voters.length;
  });
  const graveyard = pitches.filter((p) => p.status === 'denied');
  const sel = pitches.find((p) => p.id === selected) ?? null;

  const mapMarkers: MapMarker[] = visible
    .filter((p) => MAP_PINS[p.id])
    .map((p) => {
      const cat = CATS[p.category] ?? CATS.chaos;
      return {
        id: p.id,
        lat: MAP_PINS[p.id].lat,
        lng: MAP_PINS[p.id].lng,
        emoji: cat.emoji,
        color: CAT_HEX[p.category] ?? CAT_HEX.chaos,
        title: p.title,
      };
    });

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    ...(Object.keys(CATS) as CatKey[]).map((k) => ({
      key: k as Filter,
      label: `${CATS[k].emoji} ${CATS[k].label[0]}${CATS[k].label.slice(1).toLowerCase()}`,
    })),
  ];

  const submit = () => {
    if (!form.title.trim()) { alert('at least name the thing, champ.'); return; }
    const requester = whoami ?? 'someone';
    onAdd({
      title: form.title.trim(),
      category: 'chaos',
      link: form.link.trim(),
      note: form.note.trim() || 'no reason given. bold strategy.',
      who: [requester],
      requester,
    });
    setShowForm(false);
    setForm({ title: '', link: '', note: '' });
  };

  return (
    <section className="section-wide">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <div className="eyebrow">THE LAY OF THE LAND</div>
          <h1 className="h1">The map</h1>
          <p className="sub" style={{ fontSize: 15, margin: '8px 0 0', maxWidth: 560 }}>
            the fort lauderdale to miami stretch, where everything's going down. tap a place below to see it, vote it up, or pitch something new for sia to judge.
          </p>
        </div>
        <button className="cta" onClick={() => setShowForm((s) => !s)}>＋ Pitch a place</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {filterTabs.map((t) => {
          const active = filter === t.key;
          return (
            <button key={t.key} onClick={() => setFilter(t.key)} style={{ padding: '8px 15px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, border: `1px solid ${active ? 'var(--c-coral)' : 'var(--border)'}`, background: active ? 'var(--c-coral)' : 'var(--surface)', color: active ? '#fff' : 'var(--ink2)' }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {showForm && (
        <div style={{ marginBottom: 18, padding: 24, borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--c-coral)', boxShadow: 'var(--shadowSm)' }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Pitch your idea 🎤</div>
          <label style={{ display: 'block' }}>
            <span className="label-sm">WHAT IS IT? *</span>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. jet ski situation" />
          </label>
          <label style={{ display: 'block', marginTop: 14 }}>
            <span className="label-sm">LINK (menu, tickets, whatever)</span>
            <input className="input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
          </label>
          <label style={{ display: 'block', marginTop: 14 }}>
            <span className="label-sm">WHY? MAKE YOUR CASE.</span>
            <textarea className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} placeholder="sell it. funny works on sia." style={{ resize: 'vertical' }} />
          </label>
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button onClick={submit} style={{ padding: '12px 24px', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 15, color: '#fff', background: 'var(--c-mint)' }}>Submit to the king 👑</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '12px 20px', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', fontSize: 14, color: 'var(--ink2)', background: 'transparent' }}>nvm</button>
          </div>
        </div>
      )}

      <div className="grid-2col">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <RealMap markers={mapMarkers} selected={selected} onSelect={setSelected} legend />
          <a href={AREA_MAPS_URL} target="_blank" rel="noreferrer" style={{ alignSelf: 'flex-start', fontSize: 13, color: 'var(--c-teal)', textDecoration: 'none', fontWeight: 600 }}>
            need real directions? open google maps ↗
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {sel ? (() => {
            const d = decorate(sel, whoami);
            return (
              <div style={{ padding: 20, borderRadius: 20, background: 'var(--surface)', border: `2px solid ${d.cat.color}`, boxShadow: 'var(--shadow)', animation: 'softGlow 3s ease-in-out infinite' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, letterSpacing: '.5px', padding: '5px 11px', borderRadius: 999, background: d.cat.soft, color: d.cat.color }}>
                    {d.cat.emoji} {d.cat.label}
                  </span>
                  <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'transparent', color: 'var(--ink3)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                </div>
                <div className="serif" style={{ fontSize: 24, lineHeight: 1.1, margin: '12px 0 3px' }}>{sel.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 2 }}>📍 {sel.place}</div>
                <div style={{ fontSize: 12, color: 'var(--ink3)' }}>pitched by {sel.requester}</div>
                <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.55, margin: '12px 0 4px', fontStyle: 'italic' }}>"{sel.note}"</div>
                {d.whoStr && (
                  <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 8 }}>🙋 in: <span style={{ color: 'var(--ink)' }}>{d.whoStr}</span></div>
                )}
                <span style={{ display: 'inline-block', marginTop: 12, fontSize: 11, fontWeight: 700, letterSpacing: '.5px', padding: '4px 10px', borderRadius: 999, background: d.badgeBg, color: d.badgeCol }}>{d.badge}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                  <button onClick={() => onVote(sel.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, border: `1px solid ${d.voted ? 'var(--c-coral)' : 'var(--border)'}`, background: d.voted ? 'var(--c-coral)' : 'var(--surface2)', color: d.voted ? '#fff' : 'var(--ink)' }}>
                    👍 {d.votes}
                  </button>
                  {sel.link && (
                    <a href={sel.link} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--c-teal)', textDecoration: 'none', fontWeight: 600 }}>🔗 open link ↗</a>
                  )}
                </div>
              </div>
            );
          })() : (
            <div style={{ padding: '18px 20px', borderRadius: 18, background: 'var(--surface2)', border: '1px dashed var(--border)', fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>
              👆 tap a place below to see the details.
            </div>
          )}

          <div style={{ borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadowSm)' }}>
            <div className="list-head" style={{ padding: '13px 18px' }}>
              {list.length} PLACES{filter === 'all' ? '' : ` · ${CATS[filter as CatKey].label.toLowerCase()}`}
            </div>
            <div style={{ maxHeight: 520, overflowY: 'auto' }}>
              {list.map((p) => {
                const d = decorate(p, whoami);
                return (
                  <div key={p.id} onClick={() => setSelected(p.id)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '13px 18px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected === p.id ? d.cat.soft : 'transparent' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, flex: '0 0 auto', background: d.cat.soft, color: d.cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{d.cat.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📍 {p.place} · {d.statusLabel}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onVote(p.id); }} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, border: `1px solid ${d.voted ? 'var(--c-coral)' : 'var(--border)'}`, background: d.voted ? 'var(--c-coral)' : 'var(--surface2)', color: d.voted ? '#fff' : 'var(--ink)' }}>
                      👍 {d.votes}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Graveyard
        heading="⚰️ The graveyard of denied dreams"
        sub="rejected by management. rest in pieces."
        items={graveyard.map((g) => ({ title: g.title, epitaph: g.note }))}
      />
    </section>
  );
}
