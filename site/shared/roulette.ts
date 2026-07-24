// Roulette engine for the practice table. Pure logic, no IO: the api route
// feeds it a crypto RNG and the shared PlayerRecord; tests rig the pocket via
// resolveSpin. American double-zero wheel: the house needed a second zero.
import { BJ_MIN_BET, type PlayerRecord, type Rng } from './blackjack.js';

export type Pocket = string; // '0' | '00' | '1'..'36'

// Physical clockwise pocket order on an American wheel, verified. 0 and 00
// sit on opposite sides. Index i renders at angle i * STEP from 12 o'clock.
export const AMERICAN_ORDER: Pocket[] = [
  '0', '28', '9', '26', '30', '11', '7', '20', '32', '17', '5', '22', '34',
  '15', '3', '24', '36', '13', '1', '00', '27', '10', '25', '29', '12', '8',
  '19', '31', '18', '6', '21', '33', '16', '4', '23', '35', '14', '2',
];
export const POCKET_COUNT = 38;
export const STEP = 360 / POCKET_COUNT;

// Red is a lookup, not a formula. Everything 1-36 not in here is black.
export const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export type PocketColor = 'green' | 'red' | 'black';
export function colorOf(p: Pocket): PocketColor {
  if (p === '0' || p === '00') return 'green';
  return RED.has(Number(p)) ? 'red' : 'black';
}

export type BetKind = 'straight' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high' | 'dozen' | 'column';
export interface RouletteBet {
  kind: BetKind;
  pocket?: Pocket;  // straight only
  target?: number;  // dozen/column only: 1..3
  amount: number;   // whole dollars
}

// Multiplier applied to the stake for a winning bet (stake included in credit).
const CREDIT: Record<BetKind, number> = {
  straight: 36, // 35:1
  red: 2, black: 2, odd: 2, even: 2, low: 2, high: 2, // 1:1
  dozen: 3, column: 3, // 2:1
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function totalStake(bets: RouletteBet[]): number {
  return bets.reduce((s, b) => s + b.amount, 0);
}

export function validateBets(bets: RouletteBet[], bankroll: number): void {
  if (!Array.isArray(bets) || bets.length === 0) throw new Error('put some chips down first.');
  if (bets.length > 40) throw new Error('that is too many bets. this is a practice table.');
  for (const b of bets) {
    if (!Number.isFinite(b.amount) || b.amount !== Math.round(b.amount) || b.amount < 1) {
      throw new Error('whole dollars only.');
    }
    if (!Object.prototype.hasOwnProperty.call(CREDIT, b.kind)) throw new Error('unknown bet. the wheel is confused.');
    if (b.kind === 'straight') {
      if (!b.pocket || !AMERICAN_ORDER.includes(b.pocket)) throw new Error('that number is not on this wheel.');
    }
    if ((b.kind === 'dozen' || b.kind === 'column') && (b.target !== 1 && b.target !== 2 && b.target !== 3)) {
      throw new Error('dozens and columns come in 1, 2, or 3.');
    }
  }
  const total = totalStake(bets);
  if (total < BJ_MIN_BET) throw new Error(`table minimum is $${BJ_MIN_BET} across your bets.`);
  if (total > bankroll) throw new Error("you don't have it. take a marker.");
}

export function betWins(bet: RouletteBet, pocket: Pocket): boolean {
  if (bet.kind === 'straight') return bet.pocket === pocket;
  if (pocket === '0' || pocket === '00') return false; // the zeros eat everything outside
  const n = Number(pocket);
  switch (bet.kind) {
    case 'red': return RED.has(n);
    case 'black': return !RED.has(n);
    case 'odd': return n % 2 === 1;
    case 'even': return n % 2 === 0;
    case 'low': return n <= 18;
    case 'high': return n >= 19;
    case 'dozen': return Math.ceil(n / 12) === bet.target;
    case 'column': return ((n - 1) % 3) + 1 === bet.target;
    default: return false;
  }
}

export interface SpinResult { pocket: Pocket; color: PocketColor; net: number; payout: number; staked: number }

// The rig seam: tests pass the pocket explicitly.
export function resolveSpin(rec: PlayerRecord, bets: RouletteBet[], pocket: Pocket): SpinResult {
  const staked = totalStake(bets);
  rec.bankroll = round2(rec.bankroll - staked);
  let payout = 0;
  for (const b of bets) {
    if (betWins(b, pocket)) payout += b.amount * CREDIT[b.kind];
  }
  payout = round2(payout);
  rec.bankroll = round2(rec.bankroll + payout);
  const net = round2(payout - staked);

  rec.rounds += 1;
  rec.spins = (rec.spins ?? 0) + 1;
  rec.wagered = round2(rec.wagered + staked);
  if (net > 0) {
    rec.wins += 1;
    rec.wonRounds += 1;
    rec.curStreak += 1;
    if (rec.curStreak > rec.bestStreak) rec.bestStreak = rec.curStreak;
    if (net > rec.biggestWin) rec.biggestWin = net;
  } else if (net < 0) {
    rec.lostRounds += 1;
    rec.curStreak = 0;
    if (net < rec.biggestLoss) rec.biggestLoss = net;
  } else {
    rec.pushRounds += 1; // unreachable on this wheel, kept for symmetry
  }

  return { pocket, color: colorOf(pocket), net, payout, staked };
}

export function spin(rec: PlayerRecord, bets: RouletteBet[], rng: Rng): SpinResult {
  return resolveSpin(rec, bets, AMERICAN_ORDER[rng(POCKET_COUNT)]);
}
