import { useCallback, useEffect, useRef, useState } from 'react';
import { BJ_CUTOFF_MS, BJ_MIN_BET, cardValue, handValue, type BoardRow, type SanitizedRound } from '../../shared/blackjack';
import { CASINO, SQUAD, squadMeta } from '../data/trip';
import { bj, type BJResponse } from '../lib/api';
import { money } from '../lib/settle';
import { useCountdown } from '../lib/useCountdown';
import { JACKPOT_BURST, GOOD_BURST, makeBurst, type BurstParticle } from '../lib/burst';

const CHIPS: { v: number; color: string }[] = [
  { v: 25, color: 'var(--c-mint)' },
  { v: 50, color: 'var(--c-teal)' },
  { v: 100, color: 'var(--c-gold)' },
  { v: 250, color: 'var(--c-lav)' },
  { v: 500, color: 'var(--c-pink)' },
  { v: 1000, color: 'var(--c-coral)' },
  { v: 5000, color: '#2E2840' },
];

const chipLabel = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v));

const SUIT_GLYPH: Record<string, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };

function PlayingCard({ card, small }: { card: string; small?: boolean }) {
  const w = small ? 46 : 58;
  const h = small ? 64 : 82;
  if (card === 'XX') {
    return (
      <div style={{ width: w, height: h, borderRadius: 9, background: 'var(--heroGrad)', border: '2px solid rgba(255,255,255,.8)', boxShadow: '0 2px 8px rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: small ? 18 : 22, animation: 'cardPop .18s ease-out' }}>
        🌴
      </div>
    );
  }
  const rank = card[0] === 'T' ? '10' : card[0];
  const suit = SUIT_GLYPH[card[1]] ?? '?';
  const red = card[1] === 'H' || card[1] === 'D';
  const col = red ? '#D96A4E' : '#2E2840';
  return (
    <div style={{ width: w, height: h, borderRadius: 9, background: '#FFFDF8', border: '1px solid rgba(0,0,0,.12)', boxShadow: '0 2px 8px rgba(0,0,0,.28)', position: 'relative', animation: 'cardPop .18s ease-out', flex: '0 0 auto' }}>
      <div style={{ position: 'absolute', top: 4, left: 6, fontFamily: "'DM Serif Display',serif", fontSize: small ? 14 : 17, lineHeight: 1, color: col }}>
        {rank}
        <div style={{ fontSize: small ? 10 : 12 }}>{suit}</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: small ? 20 : 26, color: col, paddingTop: 6 }}>{suit}</div>
    </div>
  );
}

function HandRow({ label, cards, total, active, result, bet }: {
  label?: string;
  cards: string[];
  total: string | null;
  active?: boolean;
  result?: string;
  bet?: number;
}) {
  const resultCol = result === 'blackjack' ? 'var(--c-gold)' : result === 'win' ? 'var(--c-mint)' : result === 'push' ? 'var(--c-gold)' : 'var(--c-coral)';
  // Per-hand net rides inside the pill so settling never shifts the layout.
  const resultNet = bet === undefined ? 0 : result === 'blackjack' ? bet * 1.5 : result === 'win' ? bet : result === 'lose' ? -bet : 0;
  const netStr = result && result !== 'push' && bet !== undefined ? ` ${resultNet >= 0 ? '+' : '-'}${money(Math.abs(resultNet))}` : '';
  const resultLabel = result === 'blackjack' ? `BLACKJACK${netStr}` : result === 'win' ? `WIN${netStr}` : result === 'push' ? 'PUSH' : result === 'lose' ? `LOSE${netStr}` : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: active ? 8 : 0, borderRadius: 14, outline: active ? '2px dashed rgba(255,255,255,.6)' : 'none' }}>
      {label && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,.65)', minWidth: 46 }}>{label}</span>}
      <div style={{ display: 'flex', gap: 6 }}>
        {cards.map((c, i) => <PlayingCard key={`${c}-${i}`} card={c} />)}
      </div>
      {total && (
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.28)', padding: '3px 10px', borderRadius: 999 }}>{total}</span>
      )}
      {bet !== undefined && (
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,.85)', border: '1px dashed rgba(255,255,255,.5)', padding: '3px 9px', borderRadius: 999 }}>{money(bet)}</span>
      )}
      {result && resultLabel && (
        <span className="serif" style={{ fontSize: 15, color: resultCol, background: 'rgba(0,0,0,.35)', padding: '2px 10px', borderRadius: 8 }}>{resultLabel}</span>
      )}
    </div>
  );
}

// The full damage report. New counters only cover rounds since jul 13; when
// they haven't caught up to the lifetime hand count, flag them with a *.
function StatSheet({ b }: { b: BoardRow }) {
  const counted = b.wonRounds + b.lostRounds + b.pushRounds;
  const partial = counted < b.rounds;
  const star = (label: string) => (partial ? `${label} *` : label);
  const pct = (n: number, d: number) => (d > 0 ? ` (${Math.round((n / d) * 100)}%)` : '');
  const avg = b.rounds > 0 ? b.net / b.rounds : 0;
  const stats: { label: string; value: string }[] = [
    { label: 'hands', value: String(b.rounds) },
    { label: 'hands won', value: b.rounds > 0 ? `${b.wins}${pct(b.wins, b.rounds)}` : '-' },
    { label: 'blackjacks', value: b.rounds > 0 ? `${b.blackjacks}${pct(b.blackjacks, b.rounds)}` : '-' },
    { label: 'biggest win', value: b.biggestWin > 0 ? `+${money(b.biggestWin)}` : '-' },
    { label: 'avg net / hand', value: b.rounds > 0 ? `${avg < -0.005 ? '-' : avg > 0.005 ? '+' : ''}${money(Math.abs(avg))}` : '-' },
    { label: 'markers', value: String(b.markers) },
    { label: 'house money drawn', value: money(1000 * (1 + b.markers)) },
    { label: star('record'), value: counted > 0 ? `${b.wonRounds}W ${b.lostRounds}L ${b.pushRounds}P` : '-' },
    { label: star('best streak'), value: b.bestStreak > 0 ? `${b.bestStreak}W` : '-' },
    { label: star('biggest L'), value: b.biggestLoss < 0 ? `-${money(Math.abs(b.biggestLoss))}` : '-' },
    { label: star('wagered'), value: counted > 0 ? money(b.wagered) : '-' },
    { label: star('avg bet'), value: counted > 0 ? money(b.wagered / counted) : '-' },
    { label: star('doubles'), value: counted > 0 ? String(b.doubles) : '-' },
    { label: star('splits'), value: counted > 0 ? String(b.splits) : '-' },
  ];
  return (
    <div style={{ padding: '2px 18px 14px 44px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 10 }}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink3)', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>
      {partial && (
        <div style={{ fontSize: 10.5, color: 'var(--ink3)', marginTop: 10, fontStyle: 'italic', lineHeight: 1.5 }}>{CASINO.statsSinceNote}</div>
      )}
    </div>
  );
}

export function Casino({ whoami }: { whoami: string | null }) {
  const [data, setData] = useState<BJResponse | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [bet, setBet] = useState(0);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [stamp, setStamp] = useState<{ label: string; color: string; glow: string; burst: BurstParticle[]; sub?: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const stampTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busyRef = useRef(false);
  const crownedRef = useRef(false);
  const cd = useCountdown(BJ_CUTOFF_MS);

  const who = whoami;

  useEffect(() => {
    if (!who) return;
    bj('state', who).then(setData).catch(() => setUnavailable(true));
  }, [who]);

  // keep the leaderboard fresh while people grind
  useEffect(() => {
    if (!who || unavailable) return;
    const t = setInterval(() => {
      if (!busyRef.current && document.visibilityState === 'visible') {
        bj('state', who).then(setData).catch(() => { /* transient */ });
      }
    }, 30000);
    return () => clearInterval(t);
  }, [who, unavailable]);

  // coronation: when the table is first seen closed, crown the winner once
  useEffect(() => {
    if (crownedRef.current || !data?.closed) return;
    const lead = data.board?.[0];
    if (!lead || lead.net <= 0) return;
    crownedRef.current = true;
    setStamp({ label: '👑', color: 'var(--c-gold)', glow: 'rgba(214,169,78,.6)', burst: makeBurst(JACKPOT_BURST), sub: CASINO.crownSub.replace('{name}', lead.name) });
    const t = setTimeout(() => setStamp(null), 6000);
    return () => clearTimeout(t);
  }, [data]);

  const fireStamp = useCallback((round: SanitizedRound) => {
    const net = round.settledNet ?? 0;
    const hasBJ = round.hands.some((h) => h.result === 'blackjack');
    const allBust = round.hands.every((h) => handValue(h.cards).total > 21);
    const nice69 = net > 0 && round.hands.some((h) => h.bet === 69 && !h.doubled);
    const s = nice69
      ? { label: 'nice.', color: 'var(--c-mint)', glow: 'rgba(90,165,126,.55)', burst: makeBurst(GOOD_BURST, 14), sub: CASINO.niceEgg }
      : hasBJ
        ? { label: 'BLACKJACK.', color: 'var(--c-gold)', glow: 'rgba(214,169,78,.55)', burst: makeBurst(JACKPOT_BURST) }
        : net > 0
          ? { label: 'WIN.', color: 'var(--c-mint)', glow: 'rgba(90,165,126,.5)', burst: makeBurst(GOOD_BURST, 12) }
          : net === 0
            ? { label: 'PUSH.', color: 'var(--c-gold)', glow: 'rgba(214,169,78,.4)', burst: [] }
            : { label: allBust ? 'BUST.' : 'dealer wins.', color: 'var(--c-coral)', glow: 'rgba(227,140,116,.5)', burst: [] };
    setStamp(s);
    if (stampTimer.current) clearTimeout(stampTimer.current);
    // egg stamps stay up long enough to screenshot
    stampTimer.current = setTimeout(() => setStamp(null), nice69 ? 6000 : 1100);
  }, []);

  const act = useCallback(async (action: 'deal' | 'hit' | 'stand' | 'double' | 'split' | 'marker', betArg?: number) => {
    if (!who || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setPending(action);
    setErr(null);
    try {
      const res = await bj(action, who, betArg);
      // mid-hand actions skip the board rebuild server-side; keep the old one
      setData((prev) => (res.board ? res : { ...res, board: prev?.board ?? null }));
      const r = res.me.round;
      if (res.prophecy) {
        // the black jacks. outranks everything, stays up long enough to frame.
        setStamp({
          label: 'THE PROPHECY.',
          color: 'var(--c-gold)',
          glow: 'rgba(214,169,78,.6)',
          burst: makeBurst(JACKPOT_BURST),
          sub: res.prophecy.fresh ? CASINO.prophecyFresh : CASINO.prophecyStale.replace('{name}', res.prophecy.by),
        });
        if (stampTimer.current) clearTimeout(stampTimer.current);
        stampTimer.current = setTimeout(() => setStamp(null), 8000);
      } else if (r && r.phase === 'settled' && action !== 'marker') fireStamp(r);
      // the standing bet persists round to round but never above the bankroll
      if (!r || r.phase !== 'player') setBet((b) => Math.min(b, Math.floor(res.me.bankroll)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'table says no');
    } finally {
      busyRef.current = false;
      setBusy(false);
      setPending(null);
    }
  }, [who, fireStamp]);

  if (!who) return null;

  if (unavailable) {
    return (
      <section className="section">
        <div className="eyebrow">{CASINO.eyebrow}</div>
        <h1 className="h1">{CASINO.h1}</h1>
        <p className="sub">{CASINO.localNote}</p>
      </section>
    );
  }

  const me = data?.me;
  const board = data?.board ?? [];
  const closed = !!data?.closed;
  const round = me?.round ?? null;
  const playing = round?.phase === 'player';
  const settled = round?.phase === 'settled';
  const hand = playing ? round.hands[round.active] : null;
  const bankroll = me?.bankroll ?? 0;
  const broke = !!me && !playing && bankroll < BJ_MIN_BET;
  const maxStage = Math.floor(bankroll); // no table max. the bankroll is the max.
  const canDouble = !!hand && hand.cards.length === 2 && !hand.doubled && bankroll >= hand.bet;
  const canSplit = !!hand && !!round && !round.isSplit && round.hands.length === 1 && hand.cards.length === 2
    && cardValue(hand.cards[0]) === cardValue(hand.cards[1]) && bankroll >= hand.bet;
  const dealerRevealed = !!round && round.dealer.every((c) => c !== 'XX');
  const leader = board[0];

  const feltBtn = (label: string, onClick: () => void, color: string, disabled = false, actionKey?: string) => (
    <button key={label} className="felt-btn" onClick={onClick} disabled={disabled || busy} style={{ cursor: disabled || busy ? 'default' : 'pointer', background: color, opacity: disabled || busy ? 0.45 : 1 }}>
      {busy && actionKey && pending === actionKey ? '. . .' : label}
    </button>
  );

  return (
    <section className="section-wide">
      <div style={{ marginBottom: 18 }}>
        <div className="eyebrow">{CASINO.eyebrow}</div>
        <h1 className="h1">{CASINO.h1}</h1>
        <p className="sub" style={{ maxWidth: 620 }}>{CASINO.sub}</p>
      </div>

      <div className="grid-2col">
        {/* THE FELT */}
        <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', background: 'linear-gradient(165deg,#31909B 0%,#1E5D68 55%,#174B55 100%)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: 460 }}>
          <div style={{ textAlign: 'center', fontSize: 10, letterSpacing: 2.5, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{CASINO.feltCaption}</div>

          {closed ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10, color: '#fff' }}>
              <div style={{ fontSize: 44 }}>⛔</div>
              <div className="serif" style={{ fontSize: 34 }}>{CASINO.closedTitle}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', maxWidth: 380 }}>{CASINO.closedSub}</div>
              {leader && leader.net > 0 && (
                <div style={{ marginTop: 14, padding: '12px 20px', borderRadius: 14, background: 'rgba(0,0,0,.3)', fontSize: 15, fontWeight: 700 }}>
                  {CASINO.winnerPrefix} {leader.name}, up {money(leader.net)}. {CASINO.winnerSuffix}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* dealer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,.65)' }}>DEALER</span>
                {round ? (
                  <HandRow
                    cards={round.dealer}
                    total={dealerRevealed ? String(handValue(round.dealer).total) : null}
                  />
                ) : (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontStyle: 'italic' }}>the machine is shuffling. it is always shuffling.</div>
                )}
              </div>

              {/* player hands */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,.65)' }}>{who.toUpperCase()}</span>
                {round ? (
                  round.hands.map((h, i) => (
                    <HandRow
                      key={i}
                      label={round.isSplit ? `HAND ${i + 1}` : undefined}
                      cards={h.cards}
                      total={String(handValue(h.cards).total) + (handValue(h.cards).soft ? ' soft' : '')}
                      active={playing && round.active === i && round.isSplit}
                      result={settled ? h.result : undefined}
                      bet={h.bet}
                    />
                  ))
                ) : (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontStyle: 'italic' }}>stack your chips and run it.</div>
                )}
              </div>

              {/* controls */}
              <div style={{ borderTop: '1px dashed rgba(255,255,255,.25)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>bankroll: {money(bankroll)}</span>
                  {me && me.markers > 0 && (
                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.7)' }}>{me.markers} marker{me.markers === 1 ? '' : 's'} taken</span>
                  )}
                </div>

                {/* both rows always render in the same spot, so fast fingers
                    hit a disabled button instead of the wrong action */}
                <div className="felt-actions">
                  {feltBtn('HIT', () => act('hit'), 'var(--c-mint)', !playing, 'hit')}
                  {feltBtn('STAND', () => act('stand'), 'var(--c-coral)', !playing, 'stand')}
                  {feltBtn('DOUBLE', () => act('double'), 'var(--c-gold)', !playing || !canDouble, 'double')}
                  {feltBtn('SPLIT', () => act('split'), 'var(--c-lav)', !playing || !canSplit, 'split')}
                </div>
                <div className="bj-chips">
                  {CHIPS.map((c) => {
                    const off = busy || playing || c.v > maxStage;
                    return (
                      <button key={c.v} className="bj-chip" onClick={() => setBet((b) => Math.min(b + c.v, maxStage))} disabled={off} style={{ background: c.color, cursor: off ? 'default' : 'pointer', opacity: off ? 0.35 : 1 }}>
                        {chipLabel(c.v)}
                      </button>
                    );
                  })}
                </div>
                <div className="bj-betrow">
                  <span className="bj-bet-label">bet: {money(bet)}</span>
                  {feltBtn(CASINO.dealBtn, () => { act('deal', bet); }, 'var(--c-coral)', playing || bet < BJ_MIN_BET || bet > maxStage, 'deal')}
                  <button className="bj-allin" onClick={() => setBet(maxStage)} disabled={busy || playing || maxStage < BJ_MIN_BET} style={{ cursor: busy || playing || maxStage < BJ_MIN_BET ? 'default' : 'pointer', opacity: busy || playing || maxStage < BJ_MIN_BET ? 0.45 : 1 }}>
                    ALL IN
                  </button>
                  <button className="bj-clear" onClick={() => setBet(0)} disabled={busy || playing || bet === 0} style={{ cursor: 'pointer' }}>
                    {CASINO.clearBtn}
                  </button>
                </div>
                {broke && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>{CASINO.brokeLine}</span>
                    {feltBtn(CASINO.markerBtn, () => act('marker'), 'var(--c-pink)', false, 'marker')}
                  </div>
                )}
                {err && <div style={{ fontSize: 13, fontWeight: 600, color: '#FFD9CC' }}>{err}</div>}
              </div>
            </>
          )}

          {/* result stamp */}
          {stamp && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
              <div className="serif" style={{ position: 'absolute', top: '46%', left: '50%', fontSize: 'clamp(34px,7vw,64px)', color: stamp.color, textShadow: `0 6px 30px ${stamp.glow}`, border: `6px solid ${stamp.color}`, padding: '8px 28px', borderRadius: 16, animation: 'stampSlam .6s cubic-bezier(.2,1.4,.4,1) forwards', background: 'rgba(0,0,0,.35)', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {stamp.label}
                {stamp.sub && (
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 6, maxWidth: 300, whiteSpace: 'normal', lineHeight: 1.45 }}>{stamp.sub}</div>
                )}
              </div>
              {stamp.burst.map((p, i) => <span key={i} style={p.style}>{p.emoji}</span>)}
            </div>
          )}
        </div>

        {/* SIDE COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div style={{ padding: '16px 20px', borderRadius: 16, background: 'var(--c-gold-s)', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{CASINO.stakesTitle}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink2)', lineHeight: 1.55 }}>{CASINO.stakes}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--c-gold)', marginTop: 8 }}>
              {closed ? 'table closed.' : `${CASINO.closesPrefix} ${cd.days}d ${cd.hours}h ${cd.mins}m`}
            </div>
          </div>

          <div style={{ borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadowSm)' }}>
            <div className="list-head">{CASINO.boardTitle}</div>
            <div style={{ padding: '8px 18px 0', fontSize: 11, color: 'var(--ink3)' }}>{CASINO.statsHint}</div>
            {board.every((b) => b.rounds === 0) && (
              <div style={{ padding: '18px', fontSize: 13, color: 'var(--ink2)' }}>{CASINO.boardEmpty}</div>
            )}
            {board.map((b: BoardRow, i: number) => {
              const m = squadMeta[b.name] ?? SQUAD[0];
              const up = b.net > 0.005;
              const down = b.net < -0.005;
              const open = expanded === b.name;
              return (
                <div key={b.name} style={{ borderBottom: '1px solid var(--border)', background: b.name === who ? 'var(--surface2)' : 'transparent' }}>
                  <div onClick={() => setExpanded(open ? null : b.name)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', cursor: 'pointer' }}>
                    <span style={{ fontSize: 12, color: 'var(--ink3)', width: 14, fontWeight: 700 }}>{i + 1}</span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', flex: '0 0 auto', background: m.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{b.name[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {b.name} {i === 0 && up ? '👑' : ''} {b.playing ? <span title="at the table rn" style={{ fontSize: 10, color: 'var(--c-mint)' }}>● live</span> : null}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)' }}>
                        {money(b.bankroll)} · {b.markers} marker{b.markers === 1 ? '' : 's'} · {b.rounds} hand{b.rounds === 1 ? '' : 's'}{b.blackjacks ? ` · ${b.blackjacks} BJ` : ''}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: up ? 'var(--c-mint)' : down ? 'var(--c-coral)' : 'var(--ink3)' }}>
                      {up ? '+' : down ? '-' : ''}{money(b.net)}
                    </div>
                    <span style={{ fontSize: 9, color: 'var(--ink3)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s ease' }}>▶</span>
                  </div>
                  {open && <StatSheet b={b} />}
                </div>
              );
            })}
            {board.length > 0 && (() => {
              const houseNet = -board.reduce((s, x) => s + x.net, 0);
              const hHands = board.reduce((s, x) => s + x.rounds, 0);
              const hMarkers = board.reduce((s, x) => s + x.markers, 0);
              const hBJ = board.reduce((s, x) => s + x.blackjacks, 0);
              const hWagered = board.reduce((s, x) => s + x.wagered, 0);
              const counted = board.reduce((s, x) => s + x.wonRounds + x.lostRounds + x.pushRounds, 0);
              const partial = counted < hHands;
              const open = expanded === '__house__';
              const hStats = [
                { label: 'house net', value: `${houseNet > 0.005 ? '+' : houseNet < -0.005 ? '-' : ''}${money(Math.abs(houseNet))}` },
                { label: 'hands dealt', value: String(hHands) },
                { label: 'markers issued', value: String(hMarkers) },
                { label: 'house money loaned', value: money(1000 * (board.length + hMarkers)) },
                { label: 'blackjacks paid out', value: String(hBJ) },
                { label: partial ? 'wagered against *' : 'wagered against', value: counted > 0 ? money(hWagered) : '-' },
              ];
              return (
                <div style={{ background: 'var(--surface2)' }}>
                  <div onClick={() => setExpanded(open ? null : '__house__')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', cursor: 'pointer' }}>
                    <span style={{ width: 14 }} />
                    <div style={{ width: 32, height: 32, borderRadius: 8, flex: '0 0 auto', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🏦</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{CASINO.houseTitle}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{CASINO.houseSub}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: open ? (houseNet > 0.005 ? 'var(--c-mint)' : 'var(--ink3)') : 'var(--ink3)' }}>
                      {open ? `${houseNet > 0.005 ? '+' : houseNet < -0.005 ? '-' : ''}${money(Math.abs(houseNet))}` : '██████'}
                    </div>
                    <span style={{ fontSize: 9, color: 'var(--ink3)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s ease' }}>▶</span>
                  </div>
                  {open && (
                    <div style={{ padding: '2px 18px 14px 44px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 10 }}>
                        {hStats.map((s) => (
                          <div key={s.label}>
                            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink3)', textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink2)', marginTop: 10, fontStyle: 'italic' }}>{CASINO.houseLine}</div>
                      {partial && (
                        <div style={{ fontSize: 10.5, color: 'var(--ink3)', marginTop: 6, fontStyle: 'italic', lineHeight: 1.5 }}>{CASINO.statsSinceNote}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div style={{ padding: '16px 20px', borderRadius: 16, background: 'var(--surface2)', border: '1px dashed var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{CASINO.rulesTitle}</div>
            {CASINO.rules.map((r) => (
              <div key={r} style={{ fontSize: 12, color: 'var(--ink3)', lineHeight: 1.7 }}>· {r}</div>
            ))}
          </div>

          <div style={{ padding: '16px 20px', borderRadius: 16, background: 'var(--c-pink-s)', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{CASINO.memorialTitle}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6, fontStyle: 'italic' }}>{CASINO.memorialBody}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
