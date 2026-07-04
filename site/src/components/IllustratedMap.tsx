import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { CatKey, Pitch } from '../../shared/seeds';
import { CATS, MAP_PINS } from '../data/trip';

// A hand-drawn, zoomable/pannable map of the Fort Lauderdale → Miami stretch.
// No tiles, no keys, no external service — just SVG + a pan/zoom wrapper.
export function IllustratedMap({ pitches, selected, onSelect }: {
  pitches: Pitch[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const pinned = pitches.filter((p) => MAP_PINS[p.id]);

  const btn: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--ink)', cursor: 'pointer',
    fontSize: 18, fontWeight: 700, lineHeight: 1, boxShadow: 'var(--shadowSm)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', background: 'var(--mapOcean)', height: 520 }}>
      <TransformWrapper minScale={1} maxScale={7} doubleClick={{ mode: 'zoomIn' }} wheel={{ step: 0.12 }}>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button aria-label="zoom in" style={btn} onClick={() => zoomIn()}>＋</button>
              <button aria-label="zoom out" style={btn} onClick={() => zoomOut()}>－</button>
              <button aria-label="reset" style={{ ...btn, fontSize: 14 }} onClick={() => resetTransform()}>⤢</button>
            </div>

            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
              <svg viewBox="0 0 100 130" width="100%" height="100%" style={{ display: 'block' }} preserveAspectRatio="xMidYMid meet">
                <rect x="0" y="0" width="100" height="130" fill="var(--mapOcean)" />

                {/* mainland (coast runs north→south, ocean to the east) */}
                <path d="M0,0 L58,0 C61,18 57,34 59,52 C60,70 56,88 59,106 C60,118 54,124 57,130 L0,130 Z" fill="var(--mapLand)" />
                {/* barrier islands */}
                <path d="M60,3 C63,6 63,20 61,30 C60,33 59,20 59,9 Z" fill="var(--mapIsland)" opacity="0.7" />
                <path d="M70,94 C77,95 80,103 79,114 C78,123 73,127 70,125 C67,121 66,104 67,98 Z" fill="var(--mapIsland)" />

                {/* I-95 + a coastal road */}
                <path d="M24,0 L27,130" stroke="var(--mapRoad)" strokeWidth="1.4" strokeDasharray="4 3" fill="none" opacity="0.75" />
                <path d="M57,0 C59,26 56,70 58,112 C58,120 57,124 56,130" stroke="var(--mapRoad)" strokeWidth="0.8" fill="none" opacity="0.55" />

                {/* area labels */}
                <text x="41" y="10" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="2.5" fontWeight="600" letterSpacing="0.2" opacity="0.85">Lauderdale-by-the-Sea</text>
                <text x="6" y="27" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="3.3" fontWeight="700" letterSpacing="0.4" opacity="0.9">FORT LAUDERDALE</text>
                <text x="30" y="44" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="2.4" fontWeight="600" letterSpacing="0.3" opacity="0.8">✈ FLL AIRPORT</text>
                <text x="7" y="52" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="2.9" fontWeight="700" letterSpacing="0.4" opacity="0.85">HOLLYWOOD</text>
                <text x="7" y="77" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="2.7" fontWeight="600" letterSpacing="0.3" opacity="0.8">AVENTURA</text>
                <text x="9" y="94" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="2.6" fontWeight="600" letterSpacing="0.3" opacity="0.8">WYNWOOD</text>
                <text x="7" y="114" fill="var(--mapLabel)" fontFamily="DM Serif Display" fontSize="6.5" opacity="0.6">Miami</text>
                <text x="70" y="120" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="2.3" fontWeight="600" letterSpacing="0.3" opacity="0.8">MIAMI BEACH</text>
                <text x="93" y="66" fill="var(--mapLabel)" fontFamily="Outfit" fontSize="2.8" fontWeight="600" letterSpacing="1.2" opacity="0.6" transform="rotate(90 93 66)">ATLANTIC OCEAN</text>

                {/* pins */}
                {pinned.map((p) => {
                  const c = MAP_PINS[p.id];
                  const cat: { emoji: string; color: string } = CATS[p.category as CatKey] ?? CATS.chaos;
                  const isSel = selected === p.id;
                  const r = isSel ? 4.4 : 3.3;
                  return (
                    <g key={p.id} onClick={() => onSelect(p.id)} style={{ cursor: 'pointer' }}>
                      {isSel && <circle cx={c.x} cy={c.y} r={6.6} fill="none" stroke={cat.color} strokeWidth="0.8" opacity="0.5" />}
                      <circle cx={c.x} cy={c.y} r={r} fill={cat.color} stroke="#ffffff" strokeWidth={isSel ? 1.1 : 0.9} />
                      <text x={c.x} y={c.y + 0.15} fontSize={isSel ? 4 : 3} textAnchor="middle" dominantBaseline="central">{cat.emoji}</text>
                    </g>
                  );
                })}
              </svg>
            </TransformComponent>

            {/* legend */}
            <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '5px 10px', maxWidth: '78%', padding: '9px 12px', borderRadius: 12, background: 'var(--glass)', backdropFilter: 'blur(8px)', border: '1px solid var(--glassBorder)' }}>
              {(Object.keys(CATS) as CatKey[]).map((k) => (
                <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: 'var(--ink)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: CATS[k].color }} />
                  {CATS[k].label[0] + CATS[k].label.slice(1).toLowerCase()}
                </span>
              ))}
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
