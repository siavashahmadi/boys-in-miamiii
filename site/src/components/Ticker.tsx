import { useMemo } from 'react';
import type { BoardRow } from '../../shared/blackjack';
import { POURERS, type ManifestItem, type Pour, type Tonight } from '../../shared/seeds';
import { DAYS, TICKER, type Day } from '../data/trip';
import { money } from '../lib/settle';
import { useCountdown } from '../lib/useCountdown';
import { tripDayIndex, tripPhase } from '../lib/tripPhase';
import { etDateStr } from '../lib/horoscope';

// The chyron. Live headlines from real data, plus phase-appropriate fillers.
// Content renders twice so the marquee's -50% loop is seamless.
export function Ticker({ casino, pours, days = DAYS, manifest, tonight }: { casino?: BoardRow[]; pours?: Pour[]; days?: Day[]; manifest?: ManifestItem[]; tonight?: Tonight | null }) {
  const cd = useCountdown();
  const phase = tripPhase();
  // computed in the render body (which ticks every second via useCountdown) so
  // the memo recomputes at the midnight ET rollover instead of freezing
  const today = etDateStr();
  const dayIdx = tripDayIndex();

  const line = useMemo(() => {
    const out: string[] = [];
    if (phase === 'pre') out.push(`${cd.days}d ${cd.hours}h to wheels up`);
    if (phase === 'trip') {
      out.push(`day ${dayIdx + 1} of 4 in florida`, `today: ${days[dayIdx].title.toLowerCase()}`, 'hydrate. reapply. repeat', 'the vice booth is open. document responsibly');
    }
    if (tonight && tonight.date === today && Array.isArray(tonight.picks) && tonight.picks.length > 0) {
      tonight.picks.slice(0, 2).forEach((p) => out.push(`tonight: ${p.title} @ ${p.where}`));
    }
    if (phase === 'after') out.push('we survived florida. barely');
    if (casino && casino.some((b) => b.rounds > 0)) {
      const lead = casino[0];
      const bottom = casino[casino.length - 1];
      if (lead.net > 0.005) out.push(`👑 ${lead.name} leads at +${money(lead.net)}`);
      if (bottom.net < -0.005) out.push(`${bottom.name} is down ${money(Math.abs(bottom.net))}. someone check on him`);
      const mk = casino.reduce((s, b) => s + b.markers, 0);
      if (mk > 0) out.push(`${mk} markers issued to date. the shame compounds`);
      casino.filter((b) => b.playing).forEach((b) => out.push(`${b.name} is at the table rn`));
    }
    if (pours && pours.length > 0) out.push(`pour registry: ${pours.length} of ${POURERS.length} declared. tommy is watching`);
    if (phase === 'pre' && manifest) {
      const un = manifest.filter((m) => !m.claimedBy).length;
      if (un > 0) out.push(`manifest: ${un} item${un === 1 ? '' : 's'} unclaimed. the speaker does not pack itself`);
    }
    out.push(...TICKER[phase]);
    return out.join('  ···  ') + '  ···  ';
  }, [casino, pours, days, manifest, tonight, cd.days, cd.hours, phase, today, dayIdx]);

  // slower with more content so it stays readable
  const dur = Math.max(28, Math.round(line.length / 5));

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track" style={{ animationDuration: `${dur}s` }}>
        <span>{line}</span>
        <span>{line}</span>
      </div>
    </div>
  );
}
