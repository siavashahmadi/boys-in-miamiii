export interface GraveItem { title: string; epitaph: string }

export function Graveyard({ heading, sub, items }: { heading: string; sub: string; items: GraveItem[] }) {
  if (!items.length) return null;
  return (
    <div style={{ marginTop: 26, padding: 24, borderRadius: 20, background: 'var(--surface2)', border: '1px dashed var(--border)' }}>
      <div className="serif" style={{ fontSize: 22, color: 'var(--ink2)' }}>{heading}</div>
      <p style={{ fontSize: 13, color: 'var(--ink3)', margin: '6px 0 16px' }}>{sub}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {items.map((g) => (
          <div key={g.title} style={{ padding: '10px 15px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span style={{ textDecoration: 'line-through', color: 'var(--ink2)', fontWeight: 600, fontSize: 14 }}>{g.title}</span>
            <span style={{ fontSize: 12, color: 'var(--ink3)', marginLeft: 8 }}>— {g.epitaph}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
