import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CatKey } from '../../shared/seeds';
import { CATS } from '../data/trip';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  emoji: string;
  color: string;
  title?: string;
}

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

const draftIcon = (): L.DivIcon => L.divIcon({
  className: '',
  html: '<div style="width:34px;height:34px;border-radius:50%;background:var(--c-coral);border:2.5px dashed #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:16px;">📍</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Real interactive street map (OpenStreetMap tiles via Leaflet: free, no key).
// Shared by the Map tab (the six spots), the Stay tab (one house pin), and the
// admin pin-drop (onMapClick + draft).
export function RealMap({ markers, selected, onSelect, legend, singleZoom, height, onMapClick, draft }: {
  markers: MapMarker[];
  selected?: string | null;
  onSelect?: (id: string) => void;
  legend?: boolean;
  singleZoom?: number; // when set (single marker), center at this zoom instead of fitBounds
  height?: number;
  onMapClick?: (lat: number, lng: number) => void;
  draft?: { lat: number; lng: number } | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const draftRef = useRef<L.Marker | null>(null);
  const clickRef = useRef(onMapClick);
  clickRef.current = onMapClick;
  const [ready, setReady] = useState(false);

  const sig = markers.map((m) => `${m.id}:${m.lat}:${m.lng}`).join('|');

  // create the map once
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { center: [26.0, -80.16], zoom: 10, scrollWheelZoom: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => clickRef.current?.(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    setReady(true);
    return () => { map.remove(); mapRef.current = null; setReady(false); };
  }, []);

  // the admin's draft pin (distinct dashed marker, no refit)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (draftRef.current) { draftRef.current.remove(); draftRef.current = null; }
    if (draft) draftRef.current = L.marker([draft.lat, draft.lng], { icon: draftIcon() }).addTo(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.lat, draft?.lng, ready]);

  // (re)build markers when the set changes or the map becomes ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    const latlngs: L.LatLngExpression[] = [];
    markers.forEach((mk) => {
      const marker = L.marker([mk.lat, mk.lng], {
        icon: makeIcon(mk.emoji, mk.color, selected === mk.id),
        title: mk.title,
      }).addTo(map);
      if (onSelect) marker.on('click', () => onSelect(mk.id));
      markersRef.current[mk.id] = marker;
      latlngs.push([mk.lat, mk.lng]);
    });
    if (latlngs.length === 1 && singleZoom) {
      map.setView(latlngs[0], singleZoom);
    } else if (latlngs.length) {
      map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, ready]);

  // reflect selection: swap icons + pan to the chosen marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markers.forEach((mk) => {
      const m = markersRef.current[mk.id];
      if (m) m.setIcon(makeIcon(mk.emoji, mk.color, selected === mk.id));
    });
    const s = markers.find((mk) => mk.id === selected);
    if (s) map.panTo([s.lat, s.lng]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={ref}
        style={{ height: height ?? 520, borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', background: 'var(--surface2)' }}
      />
      {legend && (
        <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 500, display: 'flex', flexWrap: 'wrap', gap: '5px 10px', maxWidth: '70%', padding: '9px 12px', borderRadius: 12, background: 'var(--glass)', backdropFilter: 'blur(8px)', border: '1px solid var(--glassBorder)' }}>
          {(Object.keys(CATS) as CatKey[]).map((k) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: 'var(--ink)' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: CATS[k].color }} />
              {CATS[k].label[0] + CATS[k].label.slice(1).toLowerCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
