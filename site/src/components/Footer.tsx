import { FOOTER } from '../data/trip';

export function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '44px 22px 58px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div className="serif" style={{ fontSize: 22 }}>
        Miami <span className="amp">&amp;</span> Ftl. '26
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '12px auto 0', maxWidth: 440, lineHeight: 1.65 }}>{FOOTER.tagline}</p>
      <p style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 16 }}>{FOOTER.small}</p>
    </footer>
  );
}
