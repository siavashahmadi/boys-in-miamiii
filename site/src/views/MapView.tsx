import { useState } from 'react';
import type { CatKey, Pitch } from '../../shared/seeds';
import { ANCHORS, CATS } from '../data/trip';
import { Graveyard } from '../components/Graveyard';

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

export function MapView({ pitches, whoami, onVote, onAdd }: {
  pitches: Pitch[];
  whoami: string | null;
  onVote: (id: string) => void;
  onAdd: (p: { title: string; category: CatKey; link: string; note: string; who: string[]; requester: string }) => void;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'eats' as CatKey, link: '', note: '', who: '' });

  const visible = pitches.filter((p) => p.status !== 'denied');
  const filtered = filter === 'all' ? visible : visible.filter((p) => p.category === filter);
  const list = [...filtered].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return b.voters.length - a.voters.length;
  });
  const pins = filtered.filter((p) => p.mx > 0);
  const graveyard = pitches.filter((p) => p.status === 'denied');
  const sel = pitches.find((p) => p.id === selected) ?? null;

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    ...(Object.keys(CATS) as CatKey[]).map((k) => ({
      key: k as Filter,
      label: `${CATS[k].emoji} ${CATS[k].label[0]}${CATS[k].label.slice(1).toLowerCase()}`,
    })),
  ];

  const submit = () => {
    if (!form.title.trim()) { alert('at least name the thing, champ.'); return; }
    const who = form.who.split(',').map((x) => x.trim()).filter(Boolean);
    const requester = whoami ?? who[0] ?? 'someone';
    if (!who.includes(requester)) who.unshift(requester);
    onAdd({
      title: form.title.trim(),
      category: form.category,
      link: form.link.trim(),
      note: form.note.trim() || 'no reason given. bold strategy.',
      who,
      requester,
    });
    setShowForm(false);
    setForm({ title: '', category: 'eats', link: '', note: '', who: '' });
  };

  return (
    <section className="section-wide">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <div className="eyebrow">THE LAY OF THE LAND</div>
          <h1 className="h1">The map</h1>
          <p className="sub" style={{ fontSize: 15, margin: '8px 0 0', maxWidth: 560 }}>
            everywhere we might go, plus home base and the airport. tap a pin to vote it up, or pitch something new for sia to judge.
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
            <label style={{ display: 'block' }}>
              <span className="label-sm">WHAT IS IT? *</span>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. jet ski situation" />
            </label>
            <label style={{ display: 'block' }}>
              <span className="label-sm">WHO'S IN?</span>
              <input className="input" value={form.who} onChange={(e) => setForm({ ...form, who: e.target.value })} placeholder="joe, lucas" />
            </label>
          </div>
          <div style={{ marginTop: 14 }}>
            <span className="label-sm">CATEGORY</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {(Object.keys(CATS) as CatKey[]).map((k) => {
                const c = CATS[k];
                const active = form.category === k;
                return (
                  <button key={k} onClick={() => setForm({ ...form, category: k })} style={{ padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, border: `1px solid ${active ? c.color : 'var(--border)'}`, background: active ? c.color : 'var(--surface2)', color: active ? '#fff' : 'var(--ink2)' }}>
                    {c.emoji} {c.label}
                  </button>
                );
              })}
            </div>
          </div>
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
        <div style={{ position: 'relative', width: '100%', aspectRatio: '5/6', borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', background: 'var(--mapOcean)' }}>
          <svg viewBox="0 0 100 120" width="100%" height="100%" style={{ position: 'absolute', inset: 0, display: 'block' }}>
            <rect x="0" y="0" width="100" height="120" fill="var(--mapOcean)" />
            <path d="M0,0 L58,0 C61,16 56,32 59,50 C61,64 55,80 58,96 C60,110 54,116 59,120 L0,120 Z" fill="var(--mapLand)" />
            <path d="M67,10 C74,11 79,18 78,28 C77,40 73,50 69,52 C65,49 65,26 66,16 C66,12 66,10 67,10 Z" fill="var(--mapIsland)" />
            <path d="M73,55 C78,57 80,64 79,70 C78,74 74,73 73,71 C71,66 71,58 72,56 Z" fill="var(--mapIsland)" />
            <path d="M66,82 C74,82 82,90 81,102 C80,112 75,117 70,116 C66,114 65,96 65,90 C65,85 65,83 66,82 Z" fill="var(--mapIsland)" />
            <path d="M30,0 L33,120" stroke="var(--mapRoad)" strokeWidth="1.6" strokeDasharray="5 4" fill="none" opacity=".8" />
            <text x="7" y="24" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="3.3" fontWeight="600" letterSpacing=".5" opacity=".85">FORT LAUDERDALE</text>
            <text x="9" y="100" fill="var(--mapLabel)" fontFamily="DM Serif Display" fontSize="6" opacity=".55">Miami</text>
            <text x="70" y="114" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="2.6" fontWeight="600" letterSpacing=".4" opacity=".8">MIAMI BEACH</text>
            <text x="94" y="58" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="3" fontWeight="600" letterSpacing="1.5" opacity=".65" transform="rotate(90 94 58)">ATLANTIC OCEAN</text>
          </svg>

          {ANCHORS.map((a) => (
            <div key={a.label} style={{ position: 'absolute', left: `${a.mx}%`, top: `${a.my}%`, transform: 'translate(-50%,-50%)', zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, pointerEvents: 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--surface)', border: `2px solid ${a.tint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: 'var(--shadowSm)' }}>{a.emoji}</div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--ink)', background: 'var(--surface)', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--border)', whiteSpace: 'nowrap', letterSpacing: '.2px' }}>{a.label}</div>
            </div>
          ))}

          {pins.map((p) => {
            const d = decorate(p, whoami);
            const isSel = selected === p.id;
            return (
              <button key={p.id} onClick={() => setSelected(p.id)} style={{ position: 'absolute', left: `${p.mx}%`, top: `${p.my}%`, transform: 'translate(-50%,-50%)', zIndex: isSel ? 20 : 5, width: isSel ? 40 : 30, height: isSel ? 40 : 30, borderRadius: '50%', border: '2.5px solid var(--surface)', background: d.cat.color, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isSel ? 19 : 15, boxShadow: isSel ? `0 0 0 5px ${d.cat.soft}, var(--shadow)` : 'var(--shadowSm)', animation: 'pinPop .3s ease', padding: 0 }}>
                {d.cat.emoji}
              </button>
            );
          })}

          <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 8, display: 'flex', flexWrap: 'wrap', gap: '5px 10px', maxWidth: '70%', padding: '9px 12px', borderRadius: 12, background: 'var(--glass)', backdropFilter: 'blur(8px)', border: '1px solid var(--glassBorder)' }}>
            {(Object.keys(CATS) as CatKey[]).map((k) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: 'var(--ink)' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: CATS[k].color }} />
                {CATS[k].label[0] + CATS[k].label.slice(1).toLowerCase()}
              </span>
            ))}
          </div>
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
              👆 tap a pin on the map or a place below to see the details.
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
