import type { View } from '../App';

const TABS: { k: View; label: string; emoji: string }[] = [
  { k: 'home', label: 'Home', emoji: '🏠' },
  { k: 'stay', label: 'Stay', emoji: '🏝️' },
  { k: 'plan', label: 'Plan', emoji: '🗓️' },
  { k: 'map', label: 'Map', emoji: '📍' },
  { k: 'casino', label: 'Casino', emoji: '🃏' },
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
    <nav className="nav">
      <button className="nav-brand" onClick={() => setView('home')}>
        Miami <span className="amp">&amp;</span> Ftl.
      </button>
      <div className="nav-tabs-wrap">
        <div className="nav-tabs">
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
      <button className="nav-toggle" onClick={toggleTheme} title="Toggle theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </nav>
  );
}
