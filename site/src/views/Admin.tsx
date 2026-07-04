import { useMemo, useRef, useState } from 'react';
import type { Pitch } from '../../shared/seeds';
import { CATS } from '../data/trip';
import { getAdminKey, setAdminKey } from '../lib/whoami';

interface BurstParticle { emoji: string; style: React.CSSProperties }

function makeBurst(decision: 'approved' | 'denied'): BurstParticle[] {
  const good = ['💸', '🛥️', '🎉', '🍹', '🌴', '✅', '🤑', '👑', '🥂'];
  const bad = ['❌', '🚫', '💀', '😂', '👎', '🗑️', '🙅', '💔'];
  const set = decision === 'approved' ? good : bad;
  return Array.from({ length: 22 }, (_, i) => ({
    emoji: set[i % set.length],
    style: {
      position: 'fixed', left: '50%', top: '48%',
      fontSize: `${26 + Math.random() * 32}px`,
      ['--tx' as string]: `${(Math.random() * 2 - 1) * 600}px`,
      ['--ty' as string]: `${(Math.random() * 2 - 1) * 430}px`,
      ['--r' as string]: `${(Math.random() * 2 - 1) * 360}deg`,
      animation: 'fling 1.7s cubic-bezier(.15,.7,.3,1) forwards',
      animationDelay: `${Math.random() * 260}ms`,
    },
  }));
}

export function Admin({ pitches, onVerdict, onExit }: {
  pitches: Pitch[];
  onVerdict: (id: string, decision: 'approved' | 'denied', adminKey: string) => Promise<boolean>;
  onExit: () => void;
}) {
  const [key, setKey] = useState(getAdminKey());
  const [keyInput, setKeyInput] = useState('');
  const [skipped, setSkipped] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<{ decision: 'approved' | 'denied'; id: string } | null>(null);
  const busy = useRef(false);

  const pending = pitches.filter((p) => p.status === 'pending');
  const queue = [...pending.filter((p) => !skipped.includes(p.id)), ...pending.filter((p) => skipped.includes(p.id))];
  const cur = queue[0] ?? null;
  const burst = useMemo(() => (verdict ? makeBurst(verdict.decision) : []), [verdict]);

  const judge = async (decision: 'approved' | 'denied') => {
    if (!cur || busy.current) return;
    busy.current = true;
    setVerdict({ decision, id: cur.id });
    const started = Date.now();
    const ok = await onVerdict(cur.id, decision, key);
    const wait = Math.max(0, 1900 - (Date.now() - started));
    setTimeout(() => {
      setVerdict(null);
      busy.current = false;
      if (!ok) alert('nice try. you are not the king. (wrong admin key)');
    }, wait);
  };

  const later = () => {
    if (!cur || queue.length < 2) return;
    setSkipped((s) => [...s.filter((id) => id !== cur.id), cur.id]);
  };

  if (!key) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', overflowY: 'auto', padding: 20 }}>
        <div style={{ position: 'relative', maxWidth: 480, margin: '10vh auto 0', textAlign: 'center', padding: '40px 30px', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 50 }}>👑</div>
          <div className="serif" style={{ fontSize: 30, marginTop: 10 }}>The throne room</div>
          <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '10px 0 18px' }}>royals only. enter the royal seal to judge the peasants' pitches.</p>
          <input
            className="input"
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && keyInput.trim()) { setAdminKey(keyInput.trim()); setKey(keyInput.trim()); } }}
            placeholder="the royal seal"
            style={{ textAlign: 'center' }}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
            <button className="cta" style={{ background: 'var(--c-gold)' }} onClick={() => { if (keyInput.trim()) { setAdminKey(keyInput.trim()); setKey(keyInput.trim()); } }}>
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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', overflowY: 'auto', padding: 20 }}>
      <div style={{ position: 'absolute', top: '-25%', left: 0, right: 0, height: '70%', background: 'radial-gradient(closest-side, var(--c-gold-s), transparent 72%)', animation: 'spotlight 7s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--c-gold)' }}>👑 The throne room</div>
          <button onClick={onExit} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: 'var(--ink2)', background: 'var(--surface)' }}>✕ back to site</button>
        </div>
        <div className="serif" style={{ fontSize: 'clamp(32px,7vw,60px)', margin: '20px 0 4px' }}>Judgment day</div>
        <div style={{ fontSize: 15, color: 'var(--ink2)', marginBottom: 8 }}>{pending.length} peasant(s) await your royal verdict, sia.</div>

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
              <button onClick={() => judge('denied')} className="serif" style={{ flex: 1, padding: 20, border: 'none', borderRadius: 16, cursor: 'pointer', fontSize: 'clamp(20px,4vw,28px)', color: '#fff', background: 'var(--c-coral)', boxShadow: 'var(--shadowSm)' }}>👎 Denied</button>
              <button onClick={() => judge('approved')} className="serif" style={{ flex: 1, padding: 20, border: 'none', borderRadius: 16, cursor: 'pointer', fontSize: 'clamp(20px,4vw,28px)', color: '#fff', background: 'var(--c-mint)', boxShadow: 'var(--shadowSm)' }}>👑 Approved</button>
            </div>
            <button onClick={later} style={{ marginTop: 14, padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: 'var(--ink2)', background: 'transparent' }}>
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
