import { DAYS, type Day } from '../data/trip';
import type { ItinDayOverride } from '../../shared/seeds';

// Overlay the admin's itinerary override onto the static DAYS. Colors, labels,
// and dates always come from the static data; titles and items follow the
// override when one exists for that day.
export function mergeDays(remote?: ItinDayOverride[] | null): Day[] {
  if (!remote || !Array.isArray(remote)) return DAYS;
  return DAYS.map((d, i) => {
    const o = remote[i];
    if (!o) return d;
    return {
      ...d,
      title: o.title || d.title,
      items: o.items && o.items.length ? o.items : d.items,
    };
  });
}
