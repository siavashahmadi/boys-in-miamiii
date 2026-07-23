import { SQUAD } from '../data/trip';

export function IdentityPicker({ onPick }: { onPick: (name: string) => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center', padding: '38px 28px', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: 44 }}>🕶️</div>
        <div className="serif" style={{ fontSize: 32, marginTop: 10 }}>who are you?</div>
        <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '10px 0 22px', lineHeight: 1.5 }}>
          so your votes and pitches have your name on them. no take-backs.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
          {SQUAD.map((s) => (
            <button key={s.name} onClick={() => onPick(s.name)} style={{ padding: '14px 10px', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: 16, color: '#fff', background: s.color, border: 'none', boxShadow: 'var(--shadowSm)' }}>
              {s.name}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 18 }}>picking someone else's name is a chat-ban offense.</p>
      </div>
    </div>
  );
}
