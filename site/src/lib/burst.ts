import type { CSSProperties } from 'react';

export interface BurstParticle { emoji: string; style: CSSProperties }

// Emoji particle burst used by the Throne Room verdicts and blackjack wins.
// Pairs with the global `fling` keyframe.
export function makeBurst(set: string[], count = 22): BurstParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    emoji: set[i % set.length],
    style: {
      position: 'fixed', left: '50%', top: '48%',
      fontSize: `${26 + Math.random() * 32}px`,
      ['--tx' as string]: `${(Math.random() * 2 - 1) * 600}px`,
      ['--ty' as string]: `${(Math.random() * 2 - 1) * 430}px`,
      ['--r' as string]: `${(Math.random() * 2 - 1) * 360}deg`,
      animation: 'fling 1.7s cubic-bezier(.15,.7,.3,1) forwards',
      animationDelay: `${Math.random() * 260}ms`,
    },
  }));
}

export const GOOD_BURST = ['💸', '🛥️', '🎉', '🍹', '🌴', '✅', '🤑', '👑', '🥂'];
export const BAD_BURST = ['❌', '🚫', '💀', '😂', '👎', '🗑️', '🙅', '💔'];
export const JACKPOT_BURST = ['🃏', '💰', '💸', '🤑', '👑', '🎰', '🌴', '🥂'];
