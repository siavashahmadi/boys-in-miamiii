import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CatKey, Pitch } from '../../shared/seeds';
import { CATS, CAT_HEX, MAP_PINS } from '../data/trip';

function makeIcon(emoji: string, color: string, selected: boolean): L.DivIcon {
  const size = selected ? 40 : 30;
  const ring = selected ? `box-shadow:0 0 0 5px ${color}44, 0 2px 8px rgba(0,0,0,.35);` : 'box-shadow:0 2px 6px rgba(0,0,0,.35);';
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid #fff;${ring}display:flex;align-items:center;justify-content:center;font-size:${selected ? 19 : 15}px;">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Real interactive street map of the Fort Lauderdale → Miami area via
// OpenStreetMap tiles. Free, no API key. Our six spots are the markers.
export function RealMap({ pitches, selected, onSelect }: {
  pitches: Pitch[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [ready, setReady] = useState(false);

  const pinned = pitches.filter((p) => MAP_PINS[p.id]);
  const pinnedSig = pinned.map((p) => p.id).sort().join(',');

  // create the map once
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { center: [26.0, -80.16], zoom: 10, scrollWheelZoom: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    mapRef.current = map;
    setReady(true);
    return () => { map.remove(); mapRef.current = null; setReady(false); };
  }, []);

  // (re)build markers when the pinned set changes or map becomes ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    const latlngs: L.LatLngExpression[] = [];
    pinned.forEach((p) => {
      const c = MAP_PINS[p.id];
      const cat = CATS[p.category as CatKey] ?? CATS.chaos;
      const color = CAT_HEX[p.category as CatKey] ?? CAT_HEX.chaos;
      const marker = L.marker([c.lat, c.lng], {
        icon: makeIcon(cat.emoji, color, selected === p.id),
        title: p.title,
      }).addTo(map);
      marker.on('click', () => onSelect(p.id));
      markersRef.current[p.id] = marker;
      latlngs.push([c.lat, c.lng]);
    });
    if (latlngs.length) map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedSig, ready]);

  // reflect selection: swap icons + pan to the chosen marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    pinned.forEach((p) => {
      const m = markersRef.current[p.id];
      if (!m) return;
      const cat = CATS[p.category as CatKey] ?? CATS.chaos;
      const color = CAT_HEX[p.category as CatKey] ?? CAT_HEX.chaos;
      m.setIcon(makeIcon(cat.emoji, color, selected === p.id));
    });
    if (selected && MAP_PINS[selected]) {
      const c = MAP_PINS[selected];
      map.panTo([c.lat, c.lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={ref}
        style={{ height: 520, borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', background: 'var(--surface2)' }}
      />
      <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 500, display: 'flex', flexWrap: 'wrap', gap: '5px 10px', maxWidth: '70%', padding: '9px 12px', borderRadius: 12, background: 'var(--glass)', backdropFilter: 'blur(8px)', border: '1px solid var(--glassBorder)' }}>
        {(Object.keys(CATS) as CatKey[]).map((k) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: 'var(--ink)' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: CATS[k].color }} />
            {CATS[k].label[0] + CATS[k].label.slice(1).toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
