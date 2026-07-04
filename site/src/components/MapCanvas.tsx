import { useEffect, useRef, useState } from 'react';
import type { Pitch } from '../../shared/seeds';
import { AREA_MAP_EMBED, CATS, CAT_HEX, PIN_COORDS } from '../data/trip';

// Loads the Google Maps JS API once (needs VITE_GOOGLE_MAPS_KEY at build time).
let loaderPromise: Promise<void> | null = null;
function loadGoogle(key: string): Promise<void> {
  const w = window as unknown as { google?: { maps?: unknown } };
  if (w.google?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('maps failed to load'));
    document.head.appendChild(s);
  });
  return loaderPromise;
}

const KEY = (import.meta.env as Record<string, string | undefined>).VITE_GOOGLE_MAPS_KEY;

// Muted map styling so the pins pop; roughly neutral in light or dark.
const MAP_STYLE = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

export function MapCanvas({ pitches, selected, onSelect }: {
  pitches: Pitch[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const pinned = pitches.filter((p) => PIN_COORDS[p.id]);
  const pinnedSig = pinned.map((p) => p.id).sort().join(',');

  // create the map once
  useEffect(() => {
    if (!KEY) return;
    let cancelled = false;
    loadGoogle(KEY)
      .then(() => {
        if (cancelled || !ref.current || mapRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = (window as any).google;
        mapRef.current = new g.maps.Map(ref.current, {
          center: { lat: 25.98, lng: -80.16 },
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: MAP_STYLE,
        });
        setReady(true);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  // (re)build markers when the pinned set or map readiness changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    const map = mapRef.current;
    if (!g || !map) return;
    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    markersRef.current = {};
    const bounds = new g.maps.LatLngBounds();
    pinned.forEach((p) => {
      const c = PIN_COORDS[p.id];
      const cat = CATS[p.category] ?? CATS.chaos;
      const marker = new g.maps.Marker({
        position: c,
        map,
        title: p.title,
        label: { text: cat.emoji, fontSize: '15px' },
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: CAT_HEX[p.category] ?? CAT_HEX.chaos,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
      });
      marker.addListener('click', () => onSelect(p.id));
      markersRef.current[p.id] = marker;
      bounds.extend(c);
    });
    if (!bounds.isEmpty()) map.fitBounds(bounds, 56);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedSig, ready]);

  // pan to + bounce the selected marker
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    const map = mapRef.current;
    if (!g || !map || !selected) return;
    const m = markersRef.current[selected];
    if (!m) return;
    map.panTo(m.getPosition());
    m.setAnimation(g.maps.Animation.BOUNCE);
    const t = setTimeout(() => m.setAnimation(null), 700);
    return () => clearTimeout(t);
  }, [selected]);

  // Fallback: no key configured yet, or the script failed → keyless area map.
  if (!KEY || failed) {
    return (
      <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', lineHeight: 0 }}>
        <iframe
          title="Fort Lauderdale to Miami"
          src={AREA_MAP_EMBED}
          width="100%"
          height="520"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{ height: 520, borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', background: 'var(--surface2)' }}
    />
  );
}
