import { useMemo, useState } from 'react';
import type { CatKey, ItinDayOverride, ItinItem, Pitch } from '../../shared/seeds';
import { CATS, CAT_HEX, MAP_PINS, type Day } from '../data/trip';
import type { PinnedPitchInput } from '../lib/api';
import { getAdminKey, setAdminKey } from '../lib/whoami';
import { BAD_BURST, GOOD_BURST, makeBurst } from '../lib/burst';
import { RealMap, type MapMarker } from '../components/RealMap';

export type AdminResult = 'ok' | 'auth' | 'error';
type Section = 'judge' | 'pins' | 'days';

const STICK_ERR = 'that did not stick. check the connection and run it again.';

export function Admin({ pitches, days, onVerdict, onAddPin, onSaveDays, onExit }: {
  pitches: Pitch[];
  days: Day[];
  onVerdict: (id: string, decision: 'approved' | 'denied', adminKey: string) => Promise<AdminResult>;
  onAddPin: (pin: PinnedPitchInput, adminKey: string) => Promise<AdminResult>;
  onSaveDays: (days: ItinDayOverride[], adminKey: string) => Promise<AdminResult>;
  onExit: () => void;
}) {
  const [key, setKey] = useState(getAdminKey());
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('judge');

  // judgment
  const [skipped, setSkipped] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<{ decision: 'approved' | 'denied'; id: string } | null>(null);
  const [judgeBusy, setJudgeBusy] = useState(false);
  const [judgeError, setJudgeError] = useState<string | null>(null);

  // pins
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(null);
  const [pinForm, setPinForm] = useState({ title: '', category: 'eats' as CatKey, place: '', note: '', link: '' });
  const [pinBusy, setPinBusy] = useState(false);
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // itinerary
  const [dayEdit, setDayEdit] = useState<{ title: string; items: ItinItem[] }[] | null>(null);
  const [openDay, setOpenDay] = useState(0);
  const [daysBusy, setDaysBusy] = useState(false);
  const [daysMsg, setDaysMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const pending = pitches.filter((p) => p.status === 'pending');
  const queue = [...pending.filter((p) => !skipped.includes(p.id)), ...pending.filter((p) => skipped.includes(p.id))];
  const cur = queue[0] ?? null;
  const burst = useMemo(() => (verdict ? makeBurst(verdict.decision === 'approved' ? GOOD_BURST : BAD_BURST) : []), [verdict]);

  const failAuth = () => {
    setAdminKey('');
    setKey('');
    setKeyError('that seal was fake. enter the real one.');
  };

  const judge = async (decision: 'approved' | 'denied') => {
    if (!cur || judgeBusy) return;
    setJudgeBusy(true);
    setJudgeError(null);
    setVerdict({ decision, id: cur.id });
    const started = Date.now();
    const result = await onVerdict(cur.id, decision, key);
    const wait = Math.max(0, 1900 - (Date.now() - started));
    setTimeout(() => {
      setVerdict(null);
      setJudgeBusy(false);
      if (result === 'auth') failAuth();
      else if (result === 'error') setJudgeError(STICK_ERR);
    }, wait);
  };

  const later = () => {
    if (!cur || queue.length < 2) return;
    setSkipped((s) => [...s.filter((id) => id !== cur.id), cur.id]);
  };

  // pins: existing markers for context, same coord resolution as the Map tab
  const pinMarkers: MapMarker[] = pitches
    .filter((p) => p.status !== 'denied')
    .map((p): MapMarker | null => {
      const c = MAP_PINS[p.id] ?? (p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null);
      if (!c) return null;
      const cat = CATS[p.category] ?? CATS.chaos;
      return { id: p.id, lat: c.lat, lng: c.lng, emoji: cat.emoji, color: CAT_HEX[p.category] ?? CAT_HEX.chaos, title: p.title };
    })
    .filter((m): m is MapMarker => m !== null);

  const plantFlag = async () => {
    if (!draft) { setPinMsg({ ok: false, text: 'tap the map first. the pin goes where you tap.' }); return; }
    if (!pinForm.title.trim()) { setPinMsg({ ok: false, text: 'name the spot.' }); return; }
    if (pinBusy) return;
    setPinBusy(true);
    setPinMsg(null);
    const result = await onAddPin({
      title: pinForm.title.trim(),
      category: pinForm.category,
      place: pinForm.place.trim(),
      note: pinForm.note.trim(),
      link: pinForm.link.trim(),
      lat: draft.lat,
      lng: draft.lng,
    }, key);
    setPinBusy(false);
    if (result === 'auth') failAuth();
    else if (result === 'error') setPinMsg({ ok: false, text: STICK_ERR });
    else {
      setPinMsg({ ok: true, text: 'planted. it is live on the map for everyone.' });
      setDraft(null);
      setPinForm((f) => ({ title: '', category: f.category, place: '', note: '', link: '' }));
    }
  };

  // itinerary editor state: starts from the merged live days
  const edit = dayEdit ?? days.map((d) => ({ title: d.title, items: d.items.map((it) => ({ ...it })) }));
  const cloneEdit = () => edit.map((d) => ({ title: d.title, items: d.items.map((it) => ({ ...it })) }));
  const setItem = (di: number, ii: number, field: keyof ItinItem, val: string) => {
    const c = cloneEdit();
    c[di].items[ii][field] = val;
    setDayEdit(c);
  };
  const addItem = (di: number) => {
    const c = cloneEdit();
    if (c[di].items.length >= 12) return;
    c[di].items.push({ time: '', title: '', note: '' });
    setDayEdit(c);
  };
  const delItem = (di: number, ii: number) => {
    const c = cloneEdit();
    c[di].items.splice(ii, 1);
    setDayEdit(c);
  };
  const setDayTitle = (di: number, val: string) => {
    const c = cloneEdit();
    c[di].title = val;
    setDayEdit(c);
  };
  const saveSchedule = async () => {
    if (daysBusy) return;
    setDaysBusy(true);
    setDaysMsg(null);
    const payload: ItinDayOverride[] = edit.map((d) => ({
      title: d.title.trim() || undefined,
      items: d.items.filter((it) => it.title.trim()),
    }));
    const result = await onSaveDays(payload, key);
    setDaysBusy(false);
    if (result === 'auth') failAuth();
    else if (result === 'error') setDaysMsg({ ok: false, text: STICK_ERR });
    else setDaysMsg({ ok: true, text: 'the royal schedule is law. saved for everyone.' });
  };

  const smallInput = (value: string, onChange: (v: string) => void, placeholder: string, flex: string | number, maxLength = 240) => (
    <input
      className="input"
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ marginTop: 0, flex, minWidth: 0, padding: '8px 10px', fontSize: 13 }}
    />
  );

  if (!key) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', overflowY: 'auto', padding: 20 }}>
        <div style={{ position: 'relative', maxWidth: 480, margin: '10vh auto 0', textAlign: 'center', padding: '40px 30px', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 50 }}>👑</div>
          <div className="serif" style={{ fontSize: 30, marginTop: 10 }}>The throne room</div>
          <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '10px 0 18px' }}>royals only. enter the royal seal to judge the peasants' pitches.</p>
          {keyError && (
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-coral)', marginBottom: 12 }}>{keyError}</div>
          )}
          <input
            className="input"
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && keyInput.trim()) { setAdminKey(keyInput.trim()); setKey(keyInput.trim()); setKeyError(null); } }}
            placeholder="the royal seal"
            style={{ textAlign: 'center' }}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
            <button className="cta" style={{ background: 'var(--c-gold)' }} onClick={() => { if (keyInput.trim()) { setAdminKey(keyInput.trim()); setKey(keyInput.trim()); setKeyError(null); } }}>
              claim the throne
            </button>
            <button onClick={onExit} style={{ padding: '13px 20px', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', fontSize: 14, color: 'var(--ink2)', background: 'var(--surface)' }}>
              i am a peasant, take me back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sectionTabs: { key: Section; label: string }[] = [
    { key: 'judge', label: `⚖️ judgment${pending.length ? ` (${pending.length})` : ''}` },
    { key: 'pins', label: '📍 pins' },
    { key: 'days', label: '🗓️ itinerary' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', overflowY: 'auto', padding: 20 }}>
      <div style={{ position: 'absolute', top: '-25%', left: 0, right: 0, height: '70%', background: 'radial-gradient(closest-side, var(--c-gold-s), transparent 72%)', animation: 'spotlight 7s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', textAlign: 'center', paddingBottom: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--c-gold)' }}>👑 The throne room</div>
          <button onClick={onExit} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: 'var(--ink2)', background: 'var(--surface)' }}>✕ back to site</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
          {sectionTabs.map((t) => {
            const active = section === t.key;
            return (
              <button key={t.key} onClick={() => setSection(t.key)} style={{ padding: '9px 16px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 700, border: `1px solid ${active ? 'var(--c-gold)' : 'var(--border)'}`, background: active ? 'var(--c-gold)' : 'var(--surface)', color: active ? '#fff' : 'var(--ink2)' }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {section === 'judge' && (
          <>
            <div className="serif" style={{ fontSize: 'clamp(32px,7vw,60px)', margin: '20px 0 4px' }}>Judgment day</div>
            <div style={{ fontSize: 15, color: 'var(--ink2)', marginBottom: 8 }}>{pending.length} peasant(s) await your royal verdict, sia.</div>
            {judgeError && (
              <div style={{ margin: '10px auto 0', maxWidth: 480, padding: '10px 16px', borderRadius: 12, background: 'var(--c-coral-s)', color: 'var(--c-coral)', fontSize: 13, fontWeight: 700 }}>{judgeError}</div>
            )}

            {cur ? (
              <div style={{ position: 'relative', margin: '22px auto 0', maxWidth: 600, padding: '34px 30px 30px', borderRadius: 26, background: 'var(--surface)', border: `2px solid ${CATS[cur.category].color}`, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '.5px', padding: '6px 14px', borderRadius: 999, background: CATS[cur.category].soft, color: CATS[cur.category].color }}>
                  {CATS[cur.category].emoji} {CATS[cur.category].label} · 📍 {cur.place}
                </div>
                <div className="serif" style={{ fontSize: 'clamp(28px,5.5vw,44px)', lineHeight: 1.08, margin: '18px 0 6px' }}>{cur.title}</div>
                <div style={{ fontSize: 15, color: 'var(--c-gold)', fontWeight: 600 }}>
                  pitched by {cur.requester}
                  {(() => { const o = (cur.who || []).filter((w) => w && w !== cur.requester); return o.length ? ` + ${o.join(', ')}` : ''; })()}
                </div>
                <div style={{ margin: '22px auto 0', maxWidth: 460, padding: '18px 22px', borderRadius: 16, background: 'var(--surface2)', borderLeft: `4px solid ${CATS[cur.category].color}`, textAlign: 'left' }}>
                  <div style={{ fontSize: 11, letterSpacing: '1.5px', color: 'var(--ink3)', marginBottom: 6 }}>THEIR DEFENSE:</div>
                  <div style={{ fontSize: 19, fontStyle: 'italic', lineHeight: 1.4 }}>"{cur.note}"</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 20 }}>
                  <div style={{ fontSize: 14, color: 'var(--ink2)' }}>👍 {cur.voters.length} votes from the peanut gallery</div>
                  {cur.link && <a href={cur.link} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: 'var(--c-teal)', textDecoration: 'none', fontWeight: 600 }}>🔗 evidence ↗</a>}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
                  <button onClick={() => judge('denied')} disabled={judgeBusy} className="serif" style={{ flex: 1, padding: 20, border: 'none', borderRadius: 16, cursor: judgeBusy ? 'default' : 'pointer', fontSize: 'clamp(20px,4vw,28px)', color: '#fff', background: 'var(--c-coral)', boxShadow: 'var(--shadowSm)', opacity: judgeBusy ? 0.5 : 1 }}>👎 Denied</button>
                  <button onClick={() => judge('approved')} disabled={judgeBusy} className="serif" style={{ flex: 1, padding: 20, border: 'none', borderRadius: 16, cursor: judgeBusy ? 'default' : 'pointer', fontSize: 'clamp(20px,4vw,28px)', color: '#fff', background: 'var(--c-mint)', boxShadow: 'var(--shadowSm)', opacity: judgeBusy ? 0.5 : 1 }}>👑 Approved</button>
                </div>
                <button onClick={later} disabled={judgeBusy} style={{ marginTop: 14, padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 10, cursor: judgeBusy ? 'default' : 'pointer', fontSize: 13, color: 'var(--ink2)', background: 'transparent', opacity: judgeBusy ? 0.5 : 1 }}>
                  🤔 ugh, decide later (send to back)
                </button>
              </div>
            ) : (
              <div style={{ margin: '40px auto 0', maxWidth: 520, padding: '44px 30px', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)' }}>
                <div style={{ fontSize: 56 }}>🍸</div>
                <div className="serif" style={{ fontSize: 30, marginTop: 12 }}>The court is adjourned</div>
                <p style={{ fontSize: 15, color: 'var(--ink2)', margin: '10px 0 0' }}>no peasants await judgment. you've ruled with a gentle but firm hand. go get a drink, your majesty.</p>
                <button onClick={onExit} style={{ marginTop: 22, padding: '12px 26px', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, color: '#fff', background: 'var(--c-gold)' }}>← Back to the site</button>
              </div>
            )}
          </>
        )}

        {section === 'pins' && (
          <>
            <div className="serif" style={{ fontSize: 'clamp(30px,6vw,48px)', margin: '20px 0 4px' }}>Plant a flag</div>
            <div style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 16 }}>tap the map where it goes, name it, and it appears on everyone's map. no trial, no jury.</div>
            <div style={{ textAlign: 'left' }}>
              <RealMap markers={pinMarkers} height={380} onMapClick={(lat, lng) => { setDraft({ lat, lng }); setPinMsg(null); }} draft={draft} />
              <div style={{ fontSize: 12, color: draft ? 'var(--c-mint)' : 'var(--ink3)', marginTop: 8, fontWeight: 600 }}>
                {draft ? `📍 pin staged at ${draft.lat.toFixed(4)}, ${draft.lng.toFixed(4)}. now name it.` : '👆 tap the map to stage the pin.'}
              </div>
              <div style={{ marginTop: 14, padding: 20, borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadowSm)' }}>
                <label style={{ display: 'block' }}>
                  <span className="label-sm">WHAT IS IT? *</span>
                  <input className="input" value={pinForm.title} maxLength={80} onChange={(e) => setPinForm({ ...pinForm, title: e.target.value })} placeholder="e.g. that taco window lucas found" />
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
                  {(Object.keys(CATS) as CatKey[]).map((k) => {
                    const active = pinForm.category === k;
                    return (
                      <button key={k} onClick={() => setPinForm({ ...pinForm, category: k })} style={{ padding: '7px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 700, border: `1px solid ${active ? CATS[k].color : 'var(--border)'}`, background: active ? CATS[k].soft : 'var(--surface2)', color: active ? CATS[k].color : 'var(--ink2)' }}>
                        {CATS[k].emoji} {CATS[k].label.toLowerCase()}
                      </button>
                    );
                  })}
                </div>
                <label style={{ display: 'block', marginTop: 12 }}>
                  <span className="label-sm">PLACE LABEL</span>
                  <input className="input" value={pinForm.place} maxLength={60} onChange={(e) => setPinForm({ ...pinForm, place: e.target.value })} placeholder="e.g. Las Olas Blvd" />
                </label>
                <label style={{ display: 'block', marginTop: 12 }}>
                  <span className="label-sm">THE PITCH (shows in the pin popup)</span>
                  <input className="input" value={pinForm.note} maxLength={500} onChange={(e) => setPinForm({ ...pinForm, note: e.target.value })} placeholder="why this spot is happening" />
                </label>
                <label style={{ display: 'block', marginTop: 12 }}>
                  <span className="label-sm">LINK (optional)</span>
                  <input className="input" value={pinForm.link} maxLength={500} onChange={(e) => setPinForm({ ...pinForm, link: e.target.value })} placeholder="https://..." />
                </label>
                {pinMsg && (
                  <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: pinMsg.ok ? 'var(--c-mint)' : 'var(--c-coral)' }}>{pinMsg.text}</div>
                )}
                <button onClick={plantFlag} disabled={pinBusy} className="cta" style={{ marginTop: 14, background: 'var(--c-mint)', opacity: pinBusy ? 0.5 : 1 }}>
                  {pinBusy ? 'planting...' : '📍 plant the flag'}
                </button>
              </div>
            </div>
          </>
        )}

        {section === 'days' && (
          <>
            <div className="serif" style={{ fontSize: 'clamp(30px,6vw,48px)', margin: '20px 0 4px' }}>The royal schedule</div>
            <div style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 16 }}>edit the plan. saves for everyone, so no funny business (some funny business).</div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {edit.map((d, di) => {
                const meta = days[di];
                const open = openDay === di;
                return (
                  <div key={meta.label} style={{ borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadowSm)' }}>
                    <div onClick={() => setOpenDay(open ? -1 : di)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', cursor: 'pointer', background: meta.bg }}>
                      <span style={{ fontSize: 12, letterSpacing: 2, fontWeight: 700, color: meta.accent }}>{meta.label}</span>
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--ink2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title} · {d.items.length} item{d.items.length === 1 ? '' : 's'}</span>
                      <span style={{ fontSize: 9, color: 'var(--ink3)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s ease' }}>▶</span>
                    </div>
                    {open && (
                      <div style={{ padding: '14px 16px 16px' }}>
                        <label style={{ display: 'block', marginBottom: 10 }}>
                          <span className="label-sm">DAY TITLE</span>
                          <input className="input" value={d.title} maxLength={60} onChange={(e) => setDayTitle(di, e.target.value)} />
                        </label>
                        {d.items.map((it, ii) => (
                          <div key={ii} style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'flex-start' }}>
                            {smallInput(it.time, (v) => setItem(di, ii, 'time', v), 'time', '0 0 64px', 12)}
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {smallInput(it.title, (v) => setItem(di, ii, 'title', v), 'what', '1', 80)}
                              {smallInput(it.note, (v) => setItem(di, ii, 'note', v), 'the note under it', '1', 240)}
                            </div>
                            <button onClick={() => delItem(di, ii)} title="remove" style={{ border: 'none', background: 'transparent', color: 'var(--c-coral)', fontSize: 16, cursor: 'pointer', padding: '8px 4px' }}>✕</button>
                          </div>
                        ))}
                        <button onClick={() => addItem(di)} style={{ marginTop: 12, padding: '8px 14px', border: '1px dashed var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--c-teal)', background: 'transparent' }}>
                          ＋ add item
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {daysMsg && (
                <div style={{ fontSize: 13, fontWeight: 700, color: daysMsg.ok ? 'var(--c-mint)' : 'var(--c-coral)' }}>{daysMsg.text}</div>
              )}
              <button onClick={saveSchedule} disabled={daysBusy} className="cta" style={{ alignSelf: 'flex-start', background: 'var(--c-gold)', opacity: daysBusy ? 0.5 : 1 }}>
                {daysBusy ? 'decreeing...' : '🗓️ save the royal schedule'}
              </button>
            </div>
          </>
        )}
      </div>

      {verdict && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: verdict.decision === 'approved' ? 'radial-gradient(circle at center, var(--c-mint-s), transparent 70%)' : 'radial-gradient(circle at center, var(--c-coral-s), transparent 70%)', animation: 'flashFade 1.9s ease-out forwards' }} />
          <div className="serif" style={{ position: 'absolute', top: '50%', left: '50%', fontSize: 'clamp(46px,12vw,140px)', color: verdict.decision === 'approved' ? 'var(--c-mint)' : 'var(--c-coral)', textShadow: `0 6px 30px ${verdict.decision === 'approved' ? 'rgba(90,165,126,.5)' : 'rgba(227,140,116,.5)'}`, border: `7px solid ${verdict.decision === 'approved' ? 'var(--c-mint)' : 'var(--c-coral)'}`, padding: '12px 40px', borderRadius: 20, animation: 'stampSlam .7s cubic-bezier(.2,1.4,.4,1) forwards', background: 'var(--glass)' }}>
            {verdict.decision === 'approved' ? 'Approved' : 'Denied'}
          </div>
          {burst.map((p, i) => (
            <span key={i} style={p.style}>{p.emoji}</span>
          ))}
        </div>
      )}
    </div>
  );
}
