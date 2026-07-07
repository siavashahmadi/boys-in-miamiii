# site

The actual trip website. See the [repo root README](../README.md) for the full picture — this file is
just the quick reference for working in this folder.

```bash
npm install
npm run dev      # local dev server; falls back to localStorage without env vars
npm run build    # tsc -b && vite build
```

Real content: `src/data/trip.tsx`. Backend: `api/` (Vercel functions) + Upstash Redis. Login gate:
`middleware.ts` + `api/login.ts`. Map: Leaflet + OpenStreetMap (`src/components/RealMap.tsx`).

Deploy with `vercel --prod` from this directory.
