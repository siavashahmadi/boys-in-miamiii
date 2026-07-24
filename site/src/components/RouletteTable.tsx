import { useEffect, useMemo, useRef, useState } from 'react';
import { BJ_MIN_BET } from '../../shared/blackjack';
import { AMERICAN_ORDER, RED, STEP, colorOf, type Pocket } from '../../shared/roulette';
import { CASINO, ROULETTE } from '../data/trip';
import { rouletteSpin, type RouletteBetInput, type RouletteResponse } from '../lib/api';
import { money } from '../lib/settle';
import { CHIPS, chipLabel } from '../lib/chips';
import { GOOD_BURST, JACKPOT_BURST, makeBurst, type BurstParticle } from '../lib/burst';

// ---------- wheel geometry (from the animation research) ----------
const CX = 230, CY = 230;
const R_OUT = 200, R_IN = 128, R_LABEL = 172, R_HUB = 120, R_RIM = 228, R_TRACK = 214;

const pt = (aDeg: number, r: number): [number, number] => {
  const a = (aDeg * Math.PI) / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
};

function wedgePath(i: number): string {
  const a0 = i * STEP - STEP / 2;
  const a1 = i * STEP + STEP / 2;
  const [x0, y0] = pt(a0, R_OUT);
  const [x1, y1] = pt(a1, R_OUT);
  const [x2, y2] = pt(a1, R_IN);
  const [x3, y3] = pt(a0, R_IN);
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3} Z`;
}

const POCKET_FILL: Record<string, string> = { green: '#5AA57E', red: '#E38C74', black: '#233240' };
const POCKETS = AMERICAN_ORDER.map((n, i) => ({ n, i, fill: POCKET_FILL[colorOf(n)] }));

// ---------- betting board layout ----------
const ROWS = Array.from({ length: 12 }, (_, r) => [r * 3 + 1, r * 3 + 2, r * 3 + 3]);
const cellColor = (n: number) => (RED.has(n) ? 'var(--c-coral)' : '#233240');

type BetMap = Record<string, number>;

function betsToApi(bets: BetMap): RouletteBetInput[] {
  return Object.entries(bets).map(([id, amount]) => {
    if (id.startsWith('n')) return { kind: 'straight', pocket: id.slice(1), amount };
    if (id.startsWith('dozen')) return { kind: 'dozen', target: Number(id.slice(5)), amount };
    if (id.startsWith('col')) return { kind: 'column', target: Number(id.slice(3)), amount };
    return { kind: id, amount };
  });
}

const totalOf = (bets: BetMap) => Object.values(bets).reduce((s, v) => s + v, 0);

export function RouletteTable({ who, bankroll, initialHistory, onResult, onBusyChange, onMarker }: {
  who: string;
  bankroll: number;
  initialHistory?: string[];
  onResult: (r: RouletteResponse) => void;
  onBusyChange?: (busy: boolean) => void;
  onMarker: () => Promise<void>;
}) {
  const [chip, setChip] = useState(25);
  const [bets, setBets] = useState<BetMap>({});
  const [stack, setStack] = useState<{ id: string; amount: number }[]>([]); // action stack for undo
  const [lastBets, setLastBets] = useState<BetMap | null>(null);
  const [phase, setPhase] = useState<'bet' | 'spinning' | 'settling' | 'reveal'>('bet');
  const [ballDeg, setBallDeg] = useState(0);
  const [history, setHistory] = useState<Pocket[]>(initialHistory ?? []);
  const [err, setErr] = useState<string | null>(null);
  const [stamp, setStamp] = useState<{ label: string; color: string; glow: string; burst: BurstParticle[]; sub?: string } | null>(null);
  const resRef = useRef<RouletteResponse | null>(null);
  const longPress = useRef<{ id: string; t: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useEffect(() => () => { if (longPress.current) clearTimeout(longPress.current.t); }, []);

  const total = totalOf(bets);
  const busy = phase !== 'bet';

  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);

  const addBet = (id: string) => {
    if (busy) return;
    setErr(null);
    setBets((b) => ({ ...b, [id]: (b[id] ?? 0) + chip }));
    setStack((s) => [...s, { id, amount: chip }]);
  };
  const undo = () => {
    if (busy || stack.length === 0) return;
    const entry = stack[stack.length - 1];
    setStack((s) => s.slice(0, -1));
    setBets((b) => {
      const v = (b[entry.id] ?? 0) - entry.amount;
      const next = { ...b };
      if (v > 0) next[entry.id] = v; else delete next[entry.id];
      return next;
    });
  };
  const clear = () => { if (!busy) { setBets({}); setStack([]); } };
  const rebet = () => { if (!busy && lastBets) { setBets({ ...lastBets }); setStack([]); } };
  const clearCell = (id: string) => {
    if (busy) return;
    setBets((b) => { const next = { ...b }; delete next[id]; return next; });
    setStack((s) => s.filter((x) => x.id !== id));
  };

  // long-press to clear a cell (cancel on >10px movement)
  const pressStart = (id: string, e: React.PointerEvent) => {
    if (busy) return;
    const t = setTimeout(() => { clearCell(id); longPress.current = null; }, 500);
    longPress.current = { id, t, x: e.clientX, y: e.clientY };
  };
  const pressMove = (e: React.PointerEvent) => {
    const lp = longPress.current;
    if (lp && (Math.abs(e.clientX - lp.x) > 10 || Math.abs(e.clientY - lp.y) > 10)) {
      clearTimeout(lp.t);
      longPress.current = null;
    }
  };
  const pressEnd = (id: string) => {
    const lp = longPress.current;
    if (lp && lp.id === id) {
      clearTimeout(lp.t);
      longPress.current = null;
      addBet(id); // it was a tap, not a hold
    }
  };

  const reveal = () => {
    const res = resRef.current;
    if (!res) return;
    const straightHit = res.net > 0 && Object.keys(lastBetsAtSpin.current ?? {}).some((id) => id === `n${res.pocket}`);
    setStamp(
      res.net > 0
        ? straightHit
          ? { label: ROULETTE.straightHit, color: 'var(--c-gold)', glow: 'rgba(214,169,78,.6)', burst: makeBurst(JACKPOT_BURST), sub: `${res.pocket} ${res.color}. +${money(res.net)}.` }
          : { label: ROULETTE.winStamp, color: 'var(--c-mint)', glow: 'rgba(90,165,126,.5)', burst: makeBurst(GOOD_BURST, 12), sub: `${res.pocket} ${res.color}. +${money(res.net)}.` }
        : { label: ROULETTE.loseStamp, color: 'var(--c-coral)', glow: 'rgba(227,140,116,.5)', burst: [], sub: `${res.pocket} ${res.color}. -${money(Math.abs(res.net))}.` }
    );
    setHistory(res.history);
    onResult(res);
    setPhase('reveal');
    setTimeout(() => { setStamp(null); setPhase('bet'); }, res.net > 0 ? 4000 : 2500);
  };

  const lastBetsAtSpin = useRef<BetMap | null>(null);

  const sendIt = async () => {
    if (busy || total < BJ_MIN_BET) return;
    setErr(null);
    setPhase('spinning');
    resRef.current = null; // a stale result must never reveal for a new spin
    lastBetsAtSpin.current = { ...bets };
    try {
      const res = await rouletteSpin(who, betsToApi(bets));
      resRef.current = res;
      setLastBets({ ...bets });
      setBets({});
      setStack([]);
      if (reduced) { reveal(); return; }
      // 8 revolutions counter to the wheel, landing on the pocket's angle
      const idx = AMERICAN_ORDER.indexOf(res.pocket);
      const jitter = (Math.random() - 0.5) * STEP * 0.7;
      setBallDeg((prev) => prev - 360 * 8 + ((idx * STEP + jitter) - (((prev % 360) + 360) % 360)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'the wheel says no');
      setPhase('bet');
    }
  };

  const onBallStop = (e: React.TransitionEvent) => {
    // the ball circle's own settle transition bubbles up; only the arm counts
    if (e.target !== e.currentTarget) return;
    if (phase !== 'spinning') return;
    setPhase('settling');
    setTimeout(reveal, 550);
  };

  const cellBase: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: '#fff', fontWeight: 700, position: 'relative', cursor: 'pointer', border: '1px solid rgba(255,255,255,.25)' };

  const chipOn = (id: string) => bets[id] ? (
    <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 26, height: 26, padding: '0 4px', borderRadius: 999, background: '#FFFDF8', color: '#2E2840', border: '2px dashed var(--c-gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800, boxShadow: '0 2px 6px rgba(0,0,0,.35)', zIndex: 2 }}>
      {bets[id] >= 1000 ? `${Math.round(bets[id] / 100) / 10}k` : bets[id]}
    </span>
  ) : null;

  const bettable = (id: string, style: React.CSSProperties, label: React.ReactNode) => (
    <div
      key={id}
      onPointerDown={(e) => pressStart(id, e)}
      onPointerMove={pressMove}
      onPointerUp={() => pressEnd(id)}
      onPointerCancel={() => { if (longPress.current) { clearTimeout(longPress.current.t); longPress.current = null; } }}
      style={{ ...cellBase, ...style, opacity: busy ? 0.55 : 1 }}
    >
      {label}
      {chipOn(id)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      {/* last spins */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,.65)' }}>{ROULETTE.historyTitle}</span>
        {history.length === 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontStyle: 'italic' }}>the wheel remembers nothing yet.</span>}
        {history.slice().reverse().map((p, i) => (
          <span key={`${p}-${i}`} style={{ minWidth: 24, height: 24, padding: '0 3px', borderRadius: 999, background: POCKET_FILL[colorOf(p)], color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, opacity: i === 0 ? 1 : 0.75 }}>
            {p}
          </span>
        ))}
      </div>

      {/* the wheel */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 460 460" style={{ width: 'min(320px, 82vw)', height: 'auto', display: 'block' }} aria-hidden="true">
          <defs>
            <radialGradient id="rimGrad" cx="50%" cy="50%">
              <stop offset="70%" stopColor="#2b1e14" />
              <stop offset="100%" stopColor="#4a331e" />
            </radialGradient>
            <radialGradient id="hubGrad" cx="50%" cy="42%">
              <stop offset="0%" stopColor="#1b2733" />
              <stop offset="100%" stopColor="#101820" />
            </radialGradient>
          </defs>
          <circle cx={CX} cy={CY} r={R_RIM} fill="url(#rimGrad)" stroke="#D6A94E" strokeWidth="2" />
          <circle cx={CX} cy={CY} r={206} fill="none" stroke="#D6A94E" strokeWidth="1" opacity="0.6" />
          <g className="wheel-head">
            <g shapeRendering="geometricPrecision">
              {POCKETS.map((p) => (
                <path key={`w${p.i}`} d={wedgePath(p.i)} fill={p.fill} stroke="#D6A94E" strokeWidth="1.5" strokeLinejoin="round" />
              ))}
              {POCKETS.map((p) => (
                <text key={`t${p.i}`} x={CX} y={CY - R_LABEL} textAnchor="middle" dominantBaseline="middle" fontFamily="'DM Serif Display',serif" fontSize="16" fill="#fff" transform={`rotate(${p.i * STEP} ${CX} ${CY})`}>
                  {p.n}
                </text>
              ))}
            </g>
            <circle cx={CX} cy={CY} r={R_HUB} fill="url(#hubGrad)" stroke="#D6A94E" strokeWidth="2" />
            {[0, 45, 90, 135].map((a) => (
              <rect key={a} x={CX - 4} y={CY - 74} width="8" height="148" rx="4" fill="#D6A94E" transform={`rotate(${a} ${CX} ${CY})`} opacity="0.9" />
            ))}
            <circle cx={CX} cy={CY} r={16} fill="#D6A94E" />
            {/* ball rides inside the rotating frame so index math lands it */}
            <g className={`wheel-ball-arm${phase === 'spinning' ? ' spinning' : ''}`} style={{ transform: `rotate(${ballDeg}deg)` }} onTransitionEnd={onBallStop}>
              <circle className="wheel-ball" cx={CX} cy={CY - R_TRACK} r="9" fill="#FFFDF8" style={{ transform: phase === 'settling' || phase === 'reveal' ? 'translateY(50px)' : 'translateY(0px)' }} />
            </g>
          </g>
          {/* marker at 12 o'clock */}
          <path d={`M${CX - 9} 6 L${CX + 9} 6 L${CX} 26 Z`} fill="#D6A94E" />
        </svg>
      </div>

      {/* chip tray */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        {CHIPS.map((c) => {
          const active = chip === c.v;
          return (
            <button key={c.v} onClick={() => setChip(c.v)} disabled={busy} style={{ width: 46, height: 46, borderRadius: '50%', border: active ? '3px solid #D6A94E' : '3px dashed rgba(255,255,255,.7)', background: c.color, color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', transform: active ? 'scale(1.12)' : 'none', transition: 'transform .12s ease', opacity: busy ? 0.55 : 1 }}>
              {chipLabel(c.v)}
            </button>
          );
        })}
      </div>

      {/* betting board */}
      <div className="roulette-board" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr', gap: 4 }}>
          <div />
          {bettable('n0', { height: 44, background: POCKET_FILL.green, fontFamily: "'DM Serif Display',serif", fontSize: 17 }, '0')}
          {bettable('n00', { height: 44, background: POCKET_FILL.green, fontFamily: "'DM Serif Display',serif", fontSize: 17 }, '00')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr 1fr', gridAutoRows: '40px', gap: 4 }}>
          {[1, 2, 3].flatMap((doz) => [
            <div key={`dz${doz}`} style={{ gridRow: 'span 4', display: 'flex' }}>
              {bettable(`dozen${doz}`, { flex: 1, background: 'rgba(0,0,0,.3)', fontSize: 12, writingMode: 'vertical-rl' }, `${doz === 1 ? '1st' : doz === 2 ? '2nd' : '3rd'} 12`)}
            </div>,
            ...ROWS.slice((doz - 1) * 4, (doz - 1) * 4 + 4).flatMap((row) =>
              row.map((n) => bettable(`n${n}`, { background: cellColor(n), fontFamily: "'DM Serif Display',serif", fontSize: 17 }, n))
            ),
          ])}
          {/* column bets under the three number columns */}
          <div />
          {[1, 2, 3].map((col) => bettable(`col${col}`, { background: 'rgba(0,0,0,.3)', fontSize: 12 }, '2:1'))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridAutoRows: '46px', gap: 4 }}>
          {bettable('low', { background: 'rgba(0,0,0,.3)', fontSize: 12 }, '1-18')}
          {bettable('even', { background: 'rgba(0,0,0,.3)', fontSize: 12 }, 'EVEN')}
          {bettable('red', { background: POCKET_FILL.red, fontSize: 12 }, 'RED')}
          {bettable('black', { background: POCKET_FILL.black, fontSize: 12 }, 'BLACK')}
          {bettable('odd', { background: 'rgba(0,0,0,.3)', fontSize: 12 }, 'ODD')}
          {bettable('high', { background: 'rgba(0,0,0,.3)', fontSize: 12 }, '19-36')}
        </div>
      </div>

      {/* HUD */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{ROULETTE.atStake}: {money(total)}</span>
        <button onClick={sendIt} disabled={busy || total < BJ_MIN_BET} className="felt-btn" style={{ background: 'var(--c-gold)', cursor: busy || total < BJ_MIN_BET ? 'default' : 'pointer', opacity: busy || total < BJ_MIN_BET ? 0.5 : 1 }}>
          {phase === 'spinning' || phase === 'settling' ? '. . .' : ROULETTE.spinBtn}
        </button>
        <button onClick={undo} disabled={busy || stack.length === 0} style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.7)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>{ROULETTE.undoBtn}</button>
        <button onClick={clear} disabled={busy || total === 0} style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.7)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>{ROULETTE.clearBtn}</button>
        <button onClick={rebet} disabled={busy || !lastBets} style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.7)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>{ROULETTE.rebetBtn}</button>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>{ROULETTE.minNote} {ROULETTE.zerosNote} bankroll: {money(bankroll)}</div>
      {bankroll < BJ_MIN_BET && !busy && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>{CASINO.brokeLine}</span>
          <button onClick={() => { setErr(null); onMarker(); }} className="felt-btn" style={{ background: 'var(--c-pink)', cursor: 'pointer', alignSelf: 'flex-start' }}>
            {CASINO.markerBtn}
          </button>
        </div>
      )}
      {err && <div style={{ fontSize: 13, fontWeight: 600, color: '#FFD9CC' }}>{err}</div>}

      {/* result stamp */}
      {stamp && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
          <div className="serif" style={{ position: 'absolute', top: '30%', left: '50%', fontSize: 'clamp(30px,6vw,52px)', color: stamp.color, textShadow: `0 6px 30px ${stamp.glow}`, border: `6px solid ${stamp.color}`, padding: '8px 24px', borderRadius: 16, animation: 'stampSlam .6s cubic-bezier(.2,1.4,.4,1) forwards', background: 'rgba(0,0,0,.45)', whiteSpace: 'nowrap', textAlign: 'center' }}>
            {stamp.label}
            {stamp.sub && <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 6, whiteSpace: 'normal' }}>{stamp.sub}</div>}
          </div>
          {stamp.burst.map((p, i) => <span key={i} style={p.style}>{p.emoji}</span>)}
        </div>
      )}
    </div>
  );
}
