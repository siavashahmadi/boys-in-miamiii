import { useState } from 'react';
import { FOOTER } from '../data/trip';

// The SPF egg: tap "SPF 50" fifty times. Progress sticks per device.
const SPF_KEY = 'miami_spf';

export function Footer() {
  const [taps, setTaps] = useState<number>(() => {
    try { return Math.min(50, parseInt(localStorage.getItem(SPF_KEY) || '0', 10) || 0); } catch { return 0; }
  });
  const done = taps >= 50;
  const tap = () => {
    if (done) return;
    const n = Math.min(50, taps + 1);
    setTaps(n);
    try { localStorage.setItem(SPF_KEY, String(n)); } catch { /* fine */ }
  };

  return (
    <footer style={{ textAlign: 'center', padding: '44px 22px 58px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div className="serif" style={{ fontSize: 22 }}>
        Miami <span className="amp">&amp;</span> Ftl. '26
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '12px auto 0', maxWidth: 440, lineHeight: 1.65 }}>{FOOTER.tagline}</p>
      <p style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 16, userSelect: 'none' }}>
        no refunds · <span onClick={tap} style={{ cursor: 'pointer' }}>SPF 50</span> minimum
      </p>
      {taps > 0 && !done && (
        <div style={{ marginTop: 8 }}>
          <div style={{ width: 120, height: 5, margin: '0 auto', borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ width: `${(taps / 50) * 100}%`, height: '100%', borderRadius: 999, background: '#FFF4D6', boxShadow: '0 0 6px rgba(255,244,214,.8)', transition: 'width .12s ease' }} />
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--ink3)', marginTop: 4 }}>{taps}/50 {FOOTER.spfProgress}</div>
        </div>
      )}
      {done && (
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-gold)', marginTop: 10, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
          🧴 {FOOTER.spfReveal}
        </p>
      )}
    </footer>
  );
}
