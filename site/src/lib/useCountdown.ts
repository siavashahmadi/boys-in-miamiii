import { useEffect, useState } from 'react';
import { WHEELS_UP } from '../data/trip';

export interface Countdown { days: number; hours: string; mins: string; secs: string }

const pad = (n: number) => String(n).padStart(2, '0');

export function useCountdown(): Countdown {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  let diff = Math.max(0, WHEELS_UP - now);
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const mins = Math.floor(diff / 60000); diff -= mins * 60000;
  const secs = Math.floor(diff / 1000);
  return { days, hours: pad(hours), mins: pad(mins), secs: pad(secs) };
}
