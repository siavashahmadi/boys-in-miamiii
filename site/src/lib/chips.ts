// Chip denominations shared by the blackjack felt and the roulette board.
export const CHIPS: { v: number; color: string }[] = [
  { v: 25, color: 'var(--c-mint)' },
  { v: 50, color: 'var(--c-teal)' },
  { v: 100, color: 'var(--c-gold)' },
  { v: 250, color: 'var(--c-lav)' },
  { v: 500, color: 'var(--c-pink)' },
  { v: 1000, color: 'var(--c-coral)' },
  { v: 5000, color: '#2E2840' },
];

export const chipLabel = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v));
