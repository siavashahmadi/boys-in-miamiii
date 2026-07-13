import { useEffect, useState } from 'react';
import { WHEELS_UP } from '../data/trip';

export interface Countdown { days: number; hours: string; mins: string; secs: string }

const pad = (n: number) => String(n).padStart(2, '0');

// Count-up twin of useCountdown, for trip mode ("hours in florida: 37h").
export function useElapsed(since: number): { days: number; hours: number; totalHours: number } {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, now - since);
  const totalHours = Math.floor(diff / 3600000);
  return { days: Math.floor(diff / 86400000), hours: totalHours % 24, totalHours };
}

export function useCountdown(target: number = WHEELS_UP): Countdown {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  let diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const mins = Math.floor(diff / 60000); diff -= mins * 60000;
  const secs = Math.floor(diff / 1000);
  return { days, hours: pad(hours), mins: pad(mins), secs: pad(secs) };
}
