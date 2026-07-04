import { BNBS, STAY_BUDGET_LINE, STAY_GRAVEYARD, STAY_STATUS_LINE } from '../data/trip';
import { Graveyard } from '../components/Graveyard';

export function Stay() {
  const booked = BNBS.find((b) => b.status === 'booked');
  return (
    <section className="section">
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">HOME BASE</div>
        <h1 className="h1">Where we crashing?</h1>
        <p className="sub" style={{ maxWidth: 560 }}>
          {booked ? (
            <>it's done. pete pulled the trigger. everyone act like you voted.</>
          ) : (
            <>{STAY_STATUS_LINE}</>
          )}
        </p>
        <div style={{ marginTop: 12, display: 'inline-block', padding: '8px 14px', borderRadius: 999, background: 'var(--c-gold-s)', border: '1px solid var(--border)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink2)' }}>
          💸 {STAY_BUDGET_LINE}
        </div>
      </div>

      <div className="grid-250" style={{ marginTop: 28 }}>
        {BNBS.map((b) => {
          const isBooked = b.status === 'booked';
          const highlight = isBooked || (!booked && b.id === 'bnb_lbts');
          return (
            <div key={b.id} style={{ display: 'flex', flexDirection: 'column', borderRadius: 22, overflow: 'hidden', background: 'var(--surface)', border: `2px solid ${highlight ? 'var(--c-gold)' : 'var(--border)'}`, boxShadow: 'var(--shadowSm)' }}>
              <div style={{ height: 118, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
                {b.icon}
                <span style={{ position: 'absolute', top: 10, right: 10, background: 'var(--surface)', padding: '5px 11px', borderRadius: 999, fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{b.price}</span>
              </div>
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{b.name}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.5px', padding: '3px 9px', borderRadius: 999, background: 'var(--surface2)', color: isBooked ? 'var(--c-mint)' : b.tagColor, border: '1px solid var(--border)' }}>
                    {isBooked ? '✅ BOOKED' : b.tag}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink3)', margin: '4px 0 9px' }}>{b.beds}</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink2)', lineHeight: 1.55, flex: 1 }}>{b.blurb}</div>
                <a href={b.url} target="_blank" rel="noreferrer" style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 16px', borderRadius: 13, fontWeight: 600, fontSize: 14, background: 'var(--surface2)', color: 'var(--ink)', textDecoration: 'none', border: '1px solid var(--border)' }}>
                  <span>peep the listing</span>
                  <span style={{ fontWeight: 700 }}>↗</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <Graveyard heading="⚰️ dead options" sub="they were beautiful. they are gone. rest in pieces." items={STAY_GRAVEYARD} />
    </section>
  );
}
