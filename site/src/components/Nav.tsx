import type { View } from '../App';

const TABS: { k: View; label: string; emoji: string }[] = [
  { k: 'home', label: 'Home', emoji: '🏠' },
  { k: 'stay', label: 'Stay', emoji: '🏝️' },
  { k: 'plan', label: 'Plan', emoji: '🗓️' },
  { k: 'map', label: 'Map', emoji: '📍' },
  { k: 'weather', label: 'Weather', emoji: '🌤️' },
  { k: 'budget', label: 'Budget', emoji: '💸' },
];

export function Nav({ view, setView, theme, toggleTheme }: {
  view: View;
  setView: (v: View) => void;
  theme: string;
  toggleTheme: () => void;
}) {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'var(--navBg)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => setView('home')} style={{ flex: '0 0 auto', fontFamily: "'DM Serif Display',serif", fontSize: 19, letterSpacing: '.3px', color: 'var(--ink)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
        Miami <span className="amp">&amp;</span> Ftl.
      </button>
      <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', padding: 4, borderRadius: 13, background: 'var(--surface2)', border: '1px solid var(--border)', overflowX: 'auto', maxWidth: '100%' }}>
          {TABS.map((t) => {
            const active = view === t.k;
            return (
              <button key={t.k} onClick={() => setView(t.k)} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500, background: active ? 'var(--surface)' : 'transparent', color: active ? 'var(--c-coral)' : 'var(--ink2)', whiteSpace: 'nowrap' }}>
                {t.emoji} {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <button onClick={toggleTheme} title="Toggle theme" style={{ flex: '0 0 auto', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)', color: 'var(--ink)', cursor: 'pointer', fontSize: 15 }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </nav>
  );
}
