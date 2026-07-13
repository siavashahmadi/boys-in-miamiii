import { BJ_CUTOFF_MS } from '../../shared/blackjack';

// The site metamorphoses when we land: pre (countdown mode), trip (day N of 4,
// hours-in-florida count-up), after (the epilogue). QA override: set
// localStorage.miami_phase to 'pre' | 'trip' | 'after'.
export type TripPhase = 'pre' | 'trip' | 'after';

export const TRIP_START_MS = BJ_CUTOFF_MS; // wheels down in FLL
export const TRIP_END_MS = Date.parse('2026-07-26T23:59:00-04:00');

export function tripPhase(now: number = Date.now()): TripPhase {
  try {
    const o = localStorage.getItem('miami_phase');
    if (o === 'pre' || o === 'trip' || o === 'after') return o;
  } catch { /* no storage */ }
  if (now >= TRIP_END_MS) return 'after';
  if (now >= TRIP_START_MS) return 'trip';
  return 'pre';
}

// 0-based itinerary day, clamped: jul 23 ET is day 0, jul 26 is day 3.
export function tripDayIndex(now: number = Date.now(), dayCount = 4): number {
  const day1 = Date.parse('2026-07-23T00:00:00-04:00');
  const idx = Math.floor((now - day1) / 86400000);
  return Math.max(0, Math.min(dayCount - 1, idx));
}
