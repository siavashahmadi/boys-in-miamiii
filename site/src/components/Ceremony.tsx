import { useEffect, useMemo, useRef, useState } from 'react';
import type { BoardRow } from '../../shared/blackjack';
import { CEREMONY } from '../data/trip';
import { tripDayIndex, tripPhase } from '../lib/tripPhase';
import { JACKPOT_BURST, makeBurst, type BurstParticle } from '../lib/burst';

// Plays once per device, the first time the site is seen in trip mode. Phones
// already open at the 11:45p landing flip live via the 1s watcher.
const SEEN_KEY = 'miami_ceremony_v1';

// In-memory guard: if localStorage writes fail (quota, private mode) the
// ceremony must still stay dismissed for this page load instead of looping.
let dismissedThisLoad = false;
// Explicit replays work in any phase (incl. 'after'); auto-show is trip-only.
let forceReplay = false;

const seen = () => { try { return !!localStorage.getItem(SEEN_KEY); } catch { return true; } };
export const replayCeremony = () => {
  dismissedThisLoad = false;
  forceReplay = true;
  try { localStorage.removeItem(SEEN_KEY); } catch { /* fine */ }
};

const BEAMS = [
  { color: '#E38C74', left: '8%', delay: '0s', dur: '4.4s' },
  { color: '#3FA5B2', left: '28%', delay: '-1.2s', dur: '5.1s' },
  { color: '#D6A94E', left: '50%', delay: '-2.3s', dur: '3.9s' },
  { color: '#987FCF', left: '72%', delay: '-0.6s', dur: '4.8s' },
  { color: '#CE86A6', left: '92%', delay: '-1.8s', dur: '4.2s' },
];

export function Ceremony({ casino }: { casino?: BoardRow[] }) {
  const [show, setShow] = useState(false);
  const [burst, setBurst] = useState<BurstParticle[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useEffect(() => {
    const check = () => {
      if (dismissedThisLoad) return;
      if (forceReplay) { forceReplay = false; setShow(true); return; }
      if (tripPhase() === 'trip' && !seen()) setShow(true);
    };
    check();
    const t = setInterval(check, 1000);
    return () => clearInterval(t);
  }, []);

  // dialog semantics: focus the enter button, dismiss on escape
  useEffect(() => {
    if (!show) return;
    btnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const done = setTimeout(dismiss, 10000);
    if (reduced) return () => clearTimeout(done);
    setBurst(makeBurst(JACKPOT_BURST));
    const waves = setInterval(() => setBurst(makeBurst(JACKPOT_BURST)), 1200);
    return () => { clearTimeout(done); clearInterval(waves); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduced]);

  function dismiss() {
    dismissedThisLoad = true;
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* fine */ }
    setShow(false);
  }

  if (!show) return null;

  const leader = casino && casino[0] && casino[0].net > 0 ? casino[0].name : null;
  const day = String(tripDayIndex() + 1);
  const sub = (leader ? CEREMONY.subWinner.replace('{name}', leader.toLowerCase()) : CEREMONY.subNoWinner).replace('{n}', day);

  return (
    <div className="ceremony" onClick={dismiss} role="dialog" aria-modal="true" aria-label="landing ceremony">
      <div className="ceremony-glow" />
      {BEAMS.map((b) => (
        <div key={b.left} className="ceremony-beam" style={{ left: b.left, background: `linear-gradient(to top, ${b.color}, transparent)`, animationDelay: b.delay, animationDuration: b.dur, boxShadow: `0 0 18px ${b.color}66` }} />
      ))}
      {burst.map((p, i) => <span key={i} style={p.style}>{p.emoji}</span>)}
      <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', zIndex: 2 }}>
        <div style={{ fontSize: 56, animation: reduced ? undefined : 'floaty 3s ease-in-out infinite' }}>🪩</div>
        <div className="serif" style={{ fontSize: 'clamp(38px,10vw,72px)', color: '#fff', lineHeight: 1.05, marginTop: 10, textShadow: '0 6px 40px rgba(227,140,116,.6)', animation: reduced ? undefined : 'ceremonySlam .7s cubic-bezier(.2,1.4,.4,1) forwards' }}>
          {CEREMONY.title}
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,.75)', marginTop: 14, fontWeight: 600 }}>{sub}</div>
        <button ref={btnRef} onClick={dismiss} style={{ marginTop: 26, padding: '13px 26px', borderRadius: 999, border: '2px solid rgba(255,255,255,.7)', background: 'rgba(255,255,255,.08)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
          {CEREMONY.enter}
        </button>
      </div>
    </div>
  );
}
