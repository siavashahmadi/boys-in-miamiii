import { useRef, useState } from 'react';
import { BOOTH } from '../data/trip';

// The vice booth: client-side photo filters. No uploads, no storage, no ai.
// Everything happens on a canvas in the phone's own browser.

type FilterKey = 'vice' | 'vhs' | 'polaroid' | 'unc';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'vice', label: '🌴 vice' },
  { key: 'vhs', label: '📼 vhs' },
  { key: 'polaroid', label: '🖼️ polaroid' },
  { key: 'unc', label: '🕶️ unc' },
];

const MAX_SIDE = 1600;

function baseCanvas(img: ImageBitmap | HTMLImageElement | HTMLCanvasElement, maxSide: number): HTMLCanvasElement {
  const w = 'width' in img ? img.width : 0;
  const h = 'height' in img ? img.height : 0;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * scale));
  c.height = Math.max(1, Math.round(h * scale));
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

const lum = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function applyFilter(src: HTMLCanvasElement, key: FilterKey): HTMLCanvasElement {
  const w = src.width;
  const h = src.height;
  const pad = key === 'polaroid' ? Math.round(w * 0.06) : 0;
  const bottom = key === 'polaroid' ? Math.round(w * 0.2) : 0;
  const out = document.createElement('canvas');
  out.width = w + pad * 2;
  out.height = h + pad + bottom + (key === 'polaroid' ? 0 : 0);
  const ctx = out.getContext('2d')!;

  if (key === 'polaroid') {
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, out.width, out.height);
  }
  ctx.drawImage(src, pad, pad);

  // pixel pass over the photo area only
  const data = ctx.getImageData(pad, pad, w, h);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    let r = px[i], g = px[i + 1], b = px[i + 2];
    if (key === 'vice') {
      const L = lum(r, g, b) / 255;
      // shadows toward teal, highlights toward magenta
      const sh = Math.max(0, 1 - L * 1.8);
      const hi = Math.max(0, L * 1.8 - 0.8);
      r = r * (1 - sh * 0.35) + 236 * hi * 0.3;
      g = g * (1 - hi * 0.25) + 165 * sh * 0.3;
      b = b * (1 - hi * 0.1) + 178 * sh * 0.4 + 122 * hi * 0.15;
      // mild contrast
      r = (r - 128) * 1.12 + 128; g = (g - 128) * 1.08 + 128; b = (b - 128) * 1.12 + 128;
    } else if (key === 'vhs') {
      r = Math.min(255, r * 1.1 + 8);
      b = Math.min(255, b * 1.05);
      const n = (Math.random() - 0.5) * 26;
      r += n; g += n; b += n;
    } else if (key === 'polaroid') {
      r = Math.min(255, r * 1.06 + 6); g = Math.min(255, g * 1.02 + 2); b = b * 0.94;
      r = (r - 128) * 0.95 + 132; g = (g - 128) * 0.95 + 130; b = (b - 128) * 0.95 + 126;
    } else if (key === 'unc') {
      const L = lum(r, g, b);
      r = Math.min(255, L * 1.07 + 22); g = Math.min(255, L * 0.92 + 12); b = L * 0.68;
    }
    px[i] = Math.max(0, Math.min(255, r));
    px[i + 1] = Math.max(0, Math.min(255, g));
    px[i + 2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(data, pad, pad);

  // overlays
  if (key === 'vice') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(236,64,122,0.12)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(63,165,178,0.16)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  if (key === 'vhs') {
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    ctx.fillStyle = 'rgba(255,60,60,0.9)';
    ctx.font = `700 ${Math.max(16, Math.round(w / 26))}px Courier, monospace`;
    ctx.fillText('▶ PLAY', Math.round(w * 0.05), Math.round(w * 0.09));
    const d = new Date();
    const stamp = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()} · FLL`;
    ctx.fillText(stamp, Math.round(w * 0.05), h - Math.round(w * 0.05));
  }
  if (key === 'polaroid') {
    ctx.fillStyle = '#2E2840';
    ctx.font = `400 ${Math.max(18, Math.round(out.width / 18))}px 'DM Serif Display', serif`;
    ctx.textAlign = 'center';
    ctx.fillText("casa de los uncs · summer '26", out.width / 2, h + pad + Math.round(bottom * 0.62));
    ctx.textAlign = 'left';
  }
  if (key === 'unc') {
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(20,10,5,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h * 0.86);
    ctx.rotate(-0.08);
    ctx.fillStyle = 'rgba(227,140,116,0.85)';
    ctx.font = `400 ${Math.max(22, Math.round(w / 12))}px 'DM Serif Display', serif`;
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFIED UNC', 0, 0);
    ctx.restore();
  }
  return out;
}

async function loadPhoto(file: File): Promise<HTMLCanvasElement> {
  try {
    // from-image respects EXIF orientation on modern iOS/android browsers
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const c = baseCanvas(bmp, MAX_SIDE);
    bmp.close();
    return c;
  } catch {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(baseCanvas(img, MAX_SIDE)); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('could not read that photo')); };
      img.src = url;
    });
  }
}

export function Booth() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [base, setBase] = useState<HTMLCanvasElement | null>(null);
  const [thumbs, setThumbs] = useState<Partial<Record<FilterKey, string>>>({});
  const [active, setActive] = useState<FilterKey>('vice');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const render = (b: HTMLCanvasElement, key: FilterKey) => {
    const filtered = applyFilter(b, key);
    filtered.toBlob((blob) => {
      if (!blob) { setErr('render failed. try a different photo.'); return; }
      setResultBlob(blob);
      setResultUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
    }, 'image/jpeg', 0.9);
  };

  const onPick = async (f: File | undefined) => {
    if (!f) return;
    setWorking(true);
    setErr(null);
    try {
      const b = await loadPhoto(f);
      setBase(b);
      const small = baseCanvas(b, 240);
      const t: Partial<Record<FilterKey, string>> = {};
      for (const fl of FILTERS) t[fl.key] = applyFilter(small, fl.key).toDataURL('image/jpeg', 0.7);
      setThumbs(t);
      render(b, active);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'could not read that photo');
    } finally {
      setWorking(false);
    }
  };

  const pickFilter = (key: FilterKey) => {
    setActive(key);
    if (base) render(base, key);
  };

  const share = async () => {
    if (!resultBlob) return;
    const file = new File([resultBlob], `vice-booth-${active}.jpg`, { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; } catch { /* user closed the sheet */ }
    } else if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = file.name;
      a.click();
    }
  };

  return (
    <section className="section" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 16 }}>
        <div className="eyebrow">{BOOTH.eyebrow}</div>
        <h1 className="h1">📸 {BOOTH.title}</h1>
        <p className="sub" style={{ maxWidth: 560 }}>{BOOTH.sub}</p>
      </div>

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onPick(e.target.files?.[0])} />

      {!resultUrl && (
        <button className="cta" onClick={() => inputRef.current?.click()} disabled={working} style={{ opacity: working ? 0.6 : 1 }}>
          {working ? 'developing...' : BOOTH.pickBtn}
        </button>
      )}
      {err && <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--c-coral)' }}>{err}</div>}

      {resultUrl && (
        <div>
          <img src={resultUrl} alt="filtered" style={{ width: '100%', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', display: 'block' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => pickFilter(f.key)} style={{ flex: '0 0 auto', padding: 4, borderRadius: 12, border: active === f.key ? '2px solid var(--c-coral)' : '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}>
                {thumbs[f.key] && <img src={thumbs[f.key]} alt={f.label} style={{ height: 62, borderRadius: 8, display: 'block' }} />}
                <div style={{ fontSize: 11, fontWeight: 700, color: active === f.key ? 'var(--c-coral)' : 'var(--ink2)', marginTop: 3 }}>{f.label}</div>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <button className="cta" onClick={share}>{typeof navigator.canShare === 'function' ? BOOTH.shareBtn : BOOTH.downloadBtn}</button>
            <button onClick={() => inputRef.current?.click()} style={{ padding: '13px 20px', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink2)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              {BOOTH.again}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
