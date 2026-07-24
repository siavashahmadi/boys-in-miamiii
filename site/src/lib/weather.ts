import { WEATHER_CITIES, type WxCity, type WxDay, type WxHour } from '../data/trip';

export interface CityWx { key: string; now: string | null; nowFeels: string | null; days: WxDay[] | null }

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const TRIP_START = '2026-07-23';
const TRIP_END = '2026-07-26';

function wmoToIconCond(code: number): { icon: string; cond: string } {
  if (code === 0) return { icon: '☀️', cond: 'clear. hot.' };
  if (code <= 2) return { icon: '⛅', cond: 'partly cloudy' };
  if (code === 3) return { icon: '☁️', cond: 'overcast-ish' };
  if (code === 45 || code === 48) return { icon: '🌫️', cond: 'fog??' };
  if (code <= 57) return { icon: '🌦️', cond: 'drizzle' };
  if (code <= 67) return { icon: '🌧️', cond: 'rain' };
  if (code <= 82) return { icon: '🌦️', cond: 'pop-up showers' };
  if (code >= 95) return { icon: '⛈️', cond: '3pm violence' };
  return { icon: '🌤️', cond: 'florida stuff' };
}

// '2026-07-23T15:00' -> '3p'
function hourLabel(iso: string): string {
  const h = Number(iso.slice(11, 13));
  if (h === 0) return '12a';
  if (h < 12) return `${h}a`;
  if (h === 12) return '12p';
  return `${h - 12}p`;
}

async function fetchCity(c: WxCity): Promise<CityWx> {
  let now: string | null = null;
  let nowFeels: string | null = null;
  let days: WxDay[] | null = null;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&temperature_unit=fahrenheit&timezone=America%2FNew_York`
      + '&current=temperature_2m,apparent_temperature'
      + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,apparent_temperature_max'
      + '&hourly=weather_code,apparent_temperature,precipitation_probability'
      + `&start_date=${TRIP_START}&end_date=${TRIP_END}`;
    const r = await fetch(url);
    if (r.ok) {
      const j = await r.json();
      const t = j?.current?.temperature_2m;
      if (typeof t === 'number') now = `${Math.round(t)}°`;
      const f = j?.current?.apparent_temperature;
      if (typeof f === 'number') nowFeels = `${Math.round(f)}°`;

      // hourly, grouped by calendar date ('YYYY-MM-DDTHH:00')
      const hoursByDate: Record<string, WxHour[]> = {};
      const h = j?.hourly;
      if (h?.time?.length) {
        h.time.forEach((iso: string, i: number) => {
          const date = iso.slice(0, 10);
          (hoursByDate[date] ??= []).push({
            time: hourLabel(iso),
            icon: wmoToIconCond(h.weather_code[i]).icon,
            feels: typeof h.apparent_temperature[i] === 'number' ? `${Math.round(h.apparent_temperature[i])}°` : '?',
            rain: `${h.precipitation_probability[i] ?? '?'}%`,
          });
        });
      }

      const d = j?.daily;
      if (d?.time?.length) {
        days = d.time.map((iso: string, i: number) => {
          const dt = new Date(`${iso}T12:00:00-04:00`);
          const { icon, cond } = wmoToIconCond(d.weather_code[i]);
          return {
            day: DAY_LABELS[dt.getDay()],
            date: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            icon,
            hi: `${Math.round(d.temperature_2m_max[i])}°`,
            lo: `${Math.round(d.temperature_2m_min[i])}°`,
            cond,
            rain: `${d.precipitation_probability_max[i] ?? '?'}%`,
            feels: typeof d.apparent_temperature_max?.[i] === 'number' ? `${Math.round(d.apparent_temperature_max[i])}°` : undefined,
            hours: hoursByDate[iso],
          } as WxDay;
        });
      }
    }
  } catch { /* trip dates outside the 16-day window, or offline; fallback renders */ }
  return { key: c.key, now, nowFeels, days };
}

export async function fetchWeather(): Promise<Record<string, CityWx>> {
  const results = await Promise.all(WEATHER_CITIES.map(fetchCity));
  return Object.fromEntries(results.map((r) => [r.key, r]));
}
