// Blackjack engine for the practice table. Pure logic, no IO: the api route
// feeds it a crypto RNG and persists the record; tests feed it a seeded RNG.
// The deck NEVER leaves the server (see sanitize), so the client can't peek.

export const BJ_MIN_BET = 25;
// There is no table max since jul 12. Your bankroll is the max. Godspeed.
export const BJ_BUYIN = 1000;
// Table closes when we land in FLL (~9:00p, jetblue wifi permitting). After
// this, deals are rejected and the leader is crowned.
export const BJ_CUTOFF_MS = Date.parse('2026-07-23T21:00:00-04:00');

export type Card = string; // rank+suit, e.g. 'AS', 'TH', '9D' (T = 10)
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const SUITS = ['S', 'H', 'D', 'C'];

export type HandResult = 'win' | 'lose' | 'push' | 'blackjack';

export interface BJHand {
  cards: Card[];
  bet: number;
  doubled: boolean;
  done: boolean;
  result?: HandResult;
}

export interface Round {
  deck: Card[];
  hands: BJHand[]; // 1, or 2 after a split
  active: number;  // index of the hand being played
  dealer: Card[];
  phase: 'player' | 'settled';
  isSplit: boolean;
  settledNet?: number; // payout minus staked, set at settle
}

export interface PlayerRecord {
  bankroll: number;
  markers: number;   // $1,000 rebuys taken (public shame counter)
  rounds: number;
  wins: number;      // hands won (incl. blackjacks)
  blackjacks: number;
  biggestWin: number; // best single-round net
  // Deeper counters, added jul 13. Records written before then lack these, so
  // every load must normalize with { ...freshRecord(), ...stored }. When
  // wonRounds+lostRounds+pushRounds < rounds, coverage is partial.
  wonRounds: number;   // settled rounds with net > 0
  lostRounds: number;  // net < 0
  pushRounds: number;  // net === 0
  doubles: number;
  splits: number;
  wagered: number;     // total staked across settled rounds
  biggestLoss: number; // most negative single-round net (0 = none yet)
  bestStreak: number;  // longest run of winning rounds (pushes don't break it)
  curStreak: number;
  round: Round | null;
}

export interface BoardRow {
  name: string;
  net: number;
  bankroll: number;
  markers: number;
  rounds: number;
  wins: number;
  blackjacks: number;
  biggestWin: number;
  wonRounds: number;
  lostRounds: number;
  pushRounds: number;
  doubles: number;
  splits: number;
  wagered: number;
  biggestLoss: number;
  bestStreak: number;
  playing: boolean;
}

export type Rng = (n: number) => number; // returns int in [0, n)

const round2 = (n: number) => Math.round(n * 100) / 100;

export function freshRecord(): PlayerRecord {
  return {
    bankroll: BJ_BUYIN, markers: 0, rounds: 0, wins: 0, blackjacks: 0, biggestWin: 0,
    wonRounds: 0, lostRounds: 0, pushRounds: 0, doubles: 0, splits: 0,
    wagered: 0, biggestLoss: 0, bestStreak: 0, curStreak: 0,
    round: null,
  };
}

export function cardValue(c: Card): number {
  const r = c[0];
  if (r === 'A') return 11;
  if (r === 'T' || r === 'J' || r === 'Q' || r === 'K') return 10;
  return Number(r);
}

export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    const v = cardValue(c);
    total += v;
    if (c[0] === 'A') aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return { total, soft: aces > 0 };
}

export const isBlackjack = (cards: Card[]) => cards.length === 2 && handValue(cards).total === 21;

export function buildDeck(rng: Rng): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) deck.push(r + s);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = rng(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Money currently on the table for an unfinished round.
export function stakeOf(rec: PlayerRecord): number {
  if (!rec.round || rec.round.phase !== 'player') return 0;
  return rec.round.hands.reduce((s, h) => s + h.bet, 0);
}

// Net earnings vs total house money taken. This is what the leaderboard ranks.
export function netOf(rec: PlayerRecord): number {
  return round2(rec.bankroll + stakeOf(rec) - BJ_BUYIN * (1 + rec.markers));
}

const draw = (r: Round): Card => {
  const c = r.deck.pop();
  if (!c) throw new Error('deck ran dry, which should be impossible');
  return c;
};

function settle(rec: PlayerRecord) {
  const r = rec.round!;
  // Dealer only draws if at least one hand is still contesting (no preset
  // result like blackjack, and not busted).
  const contested = r.hands.some((h) => !h.result && handValue(h.cards).total <= 21);
  if (contested) {
    while (handValue(r.dealer).total < 17) r.dealer.push(draw(r));
  }
  const d = handValue(r.dealer).total;
  const dealerBust = d > 21;
  let payout = 0;
  let staked = 0;
  let winsInc = 0;
  for (const h of r.hands) {
    staked += h.bet;
    if (h.result === 'blackjack') { payout += h.bet * 2.5; winsInc++; continue; }
    const p = handValue(h.cards).total;
    if (p > 21) { h.result = 'lose'; continue; }
    if (h.result) continue; // already decided at deal (dealer blackjack)
    if (dealerBust || p > d) { h.result = 'win'; payout += h.bet * 2; winsInc++; }
    else if (p === d) { h.result = 'push'; payout += h.bet; }
    else { h.result = 'lose'; }
  }
  rec.bankroll = round2(rec.bankroll + payout);
  rec.rounds += 1;
  rec.wins += winsInc;
  const net = round2(payout - staked);
  if (net > rec.biggestWin) rec.biggestWin = net;
  if (net < rec.biggestLoss) rec.biggestLoss = net;
  rec.wagered = round2(rec.wagered + staked);
  if (net > 0) {
    rec.wonRounds += 1;
    rec.curStreak += 1;
    if (rec.curStreak > rec.bestStreak) rec.bestStreak = rec.curStreak;
  } else if (net < 0) {
    rec.lostRounds += 1;
    rec.curStreak = 0;
  } else {
    rec.pushRounds += 1; // pushes leave the streak alone
  }
  r.settledNet = net;
  r.phase = 'settled';
}

function advance(rec: PlayerRecord) {
  const r = rec.round!;
  while (r.active < r.hands.length && r.hands[r.active].done) r.active++;
  if (r.active >= r.hands.length) settle(rec);
}

function requireActiveRound(rec: PlayerRecord): Round {
  if (!rec.round || rec.round.phase !== 'player') throw new Error('no hand in play. run it first.');
  return rec.round;
}

export function deal(rec: PlayerRecord, bet: number, rng: Rng, now: number) {
  startRound(rec, bet, buildDeck(rng), now);
}

// Separated from deal() so tests can rig exact decks. deck is consumed via
// pop(), so the LAST element is the first card dealt.
export function startRound(rec: PlayerRecord, bet: number, deck: Card[], now: number) {
  if (now >= BJ_CUTOFF_MS) throw new Error("table's closed. the real one is 30 minutes away.");
  if (rec.round && rec.round.phase === 'player') throw new Error('finish the hand you have.');
  if (!Number.isFinite(bet) || bet !== Math.round(bet)) throw new Error('whole dollars only.');
  if (bet < BJ_MIN_BET) throw new Error(`table minimum is $${BJ_MIN_BET}.`);
  if (bet > rec.bankroll) throw new Error("you don't have it. take a marker.");

  rec.bankroll = round2(rec.bankroll - bet);
  const r: Round = {
    deck,
    hands: [{ cards: [], bet, doubled: false, done: false }],
    active: 0,
    dealer: [],
    phase: 'player',
    isSplit: false,
  };
  rec.round = r;
  const h = r.hands[0];
  h.cards.push(draw(r));
  r.dealer.push(draw(r));
  h.cards.push(draw(r));
  r.dealer.push(draw(r));

  const pBJ = isBlackjack(h.cards);
  const dBJ = isBlackjack(r.dealer);
  if (pBJ || dBJ) {
    h.done = true;
    if (pBJ && !dBJ) { h.result = 'blackjack'; rec.blackjacks += 1; }
    // pBJ && dBJ falls through to settle as a 21-vs-21 push;
    // dBJ alone loses by comparison. Both handled in settle.
    settle(rec);
  }
}

export function hit(rec: PlayerRecord) {
  const r = requireActiveRound(rec);
  const h = r.hands[r.active];
  h.cards.push(draw(r));
  const v = handValue(h.cards).total;
  if (v >= 21) h.done = true; // bust settles as lose; exactly 21 auto-stands
  advance(rec);
}

export function stand(rec: PlayerRecord) {
  const r = requireActiveRound(rec);
  r.hands[r.active].done = true;
  advance(rec);
}

export function doubleDown(rec: PlayerRecord) {
  const r = requireActiveRound(rec);
  const h = r.hands[r.active];
  if (h.cards.length !== 2 || h.doubled) throw new Error('can only double on your first two cards.');
  if (rec.bankroll < h.bet) throw new Error("can't afford the double.");
  rec.bankroll = round2(rec.bankroll - h.bet);
  h.bet = round2(h.bet * 2);
  h.doubled = true;
  rec.doubles += 1;
  h.cards.push(draw(r));
  h.done = true;
  advance(rec);
}

export function split(rec: PlayerRecord) {
  const r = requireActiveRound(rec);
  if (r.isSplit || r.hands.length !== 1) throw new Error('one split per round.');
  const h = r.hands[0];
  if (h.cards.length !== 2 || cardValue(h.cards[0]) !== cardValue(h.cards[1])) {
    throw new Error('you can only split a pair.');
  }
  if (rec.bankroll < h.bet) throw new Error("can't afford the split.");
  rec.bankroll = round2(rec.bankroll - h.bet);
  const isAces = h.cards[0][0] === 'A';
  const second: BJHand = { cards: [h.cards.pop()!], bet: h.bet, doubled: false, done: false };
  r.hands.push(second);
  r.isSplit = true;
  rec.splits += 1;
  h.cards.push(draw(r));
  second.cards.push(draw(r));
  if (isAces) {
    // split aces get one card each, no re-hitting
    h.done = true;
    second.done = true;
  } else {
    if (handValue(h.cards).total === 21) h.done = true;
    if (handValue(second.cards).total === 21) second.done = true;
  }
  r.active = 0;
  advance(rec);
}

export function takeMarker(rec: PlayerRecord) {
  if (rec.round && rec.round.phase === 'player') throw new Error('finish the hand first.');
  if (rec.bankroll >= BJ_MIN_BET) throw new Error("you're not broke yet. sit down.");
  rec.bankroll = round2(rec.bankroll + BJ_BUYIN);
  rec.markers += 1;
}

// What the client is allowed to see. The deck never ships, and the dealer's
// hole card is masked as 'XX' until the round settles.
export function sanitize(rec: PlayerRecord) {
  const r = rec.round;
  return {
    bankroll: rec.bankroll,
    markers: rec.markers,
    rounds: rec.rounds,
    wins: rec.wins,
    blackjacks: rec.blackjacks,
    biggestWin: rec.biggestWin,
    wonRounds: rec.wonRounds,
    lostRounds: rec.lostRounds,
    pushRounds: rec.pushRounds,
    doubles: rec.doubles,
    splits: rec.splits,
    wagered: rec.wagered,
    biggestLoss: rec.biggestLoss,
    bestStreak: rec.bestStreak,
    round: r
      ? {
          hands: r.hands.map((h) => ({ cards: h.cards, bet: h.bet, doubled: h.doubled, done: h.done, result: h.result })),
          active: r.active,
          dealer: r.phase === 'player' ? [r.dealer[0], 'XX'] : r.dealer,
          phase: r.phase,
          isSplit: r.isSplit,
          settledNet: r.settledNet,
        }
      : null,
  };
}

export type SanitizedPlayer = ReturnType<typeof sanitize>;
export type SanitizedRound = NonNullable<SanitizedPlayer['round']>;
