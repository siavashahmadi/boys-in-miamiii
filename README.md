# Boys in Miamiii

A trip website for six friends (Sia, Pete, Joe, Lucas, Kia, Tom) going to Fort Lauderdale / Miami, July 23-26, 2026. Built in a few days in July 2026 with Claude Code, from a real group chat to a deployed site with a shared backend.

**Live site:** https://boys-in-miamiii.vercel.app (password-gated, ask the group chat, or check your Vercel env vars if you're reading this years later and forgot)

If you're here in 2028 wondering what this repo even is: this was a real trip, this site was the trip planner/dashboard the group actually used, and it's a decent example of how far a weekend project can go when an AI agent has git, a deploy target, and a database at its disposal.

## What's in here

```
TRIP_SUMMARY.md      human-readable summary of how the trip got planned, pulled from the group chat
trip_data.json       the same info as structured data (participants, flights, lodging options, budget)
WRITING_STYLE.md      a voice guide for the group's texting style, extracted from the chat, used to
                      write the site's copy so it sounds like the six of us instead of a travel brochure
design_handoff_trip_site/   the original AI-generated design mockup (Claude Design) the site was built from
site/                 the actual website: Vite + React + TypeScript, deployed to Vercel
```

The interesting part is `site/`. Everything above it is source material: the real trip data and the
group's voice, both used to seed the site's content so it wasn't full of generic placeholder copy.

## The site (`site/`)

A password-gated single-page app with six tabs (Home, Stay, Plan, Map, Weather, Budget) plus a hidden
`#admin` "Throne Room" for approving/denying activity pitches. Built to look and feel like a real product,
not a slapped-together itinerary doc.

**Stack:**
- Vite + React + TypeScript, no framework beyond that
- Vercel serverless functions (`site/api/`) as the backend
- Upstash Redis (free tier) for shared state — pitches and expenses are real-time shared across everyone,
  not per-browser localStorage
- Leaflet + OpenStreetMap tiles for the map (free, no API key — a real interactive street map of the
  Fort Lauderdale/Miami corridor with the trip's activity pins on it)
- Open-Meteo for live weather (free, no API key)
- A custom cookie-based login gate (`site/middleware.ts` + `site/api/login.ts`) — not Vercel's paid
  password protection, a hand-rolled one so it stayed on the free Hobby tier

**Total running cost: $0/month.** Every third-party piece was deliberately chosen from the free tier
(Vercel Hobby, Upstash free Redis, OpenStreetMap, Open-Meteo). If you're resurrecting this in the future
and something now costs money, that's drift in someone's pricing, not the original design.

### Running it locally

```bash
cd site
npm install
npm run dev
```

Without the env vars below, the app still runs — `site/src/lib/api.ts` falls back to localStorage so you
can poke around solo. To get the real shared-backend behavior locally, pull the env vars from Vercel:

```bash
vercel env pull .env.local
```

### Env vars (set in the Vercel dashboard, not in this repo)

| Var | What it's for |
|---|---|
| `SITE_PASSWORD` | the password everyone types to get in |
| `GATE_TOKEN` | random secret the login cookie is checked against (independent of the password itself) |
| `ADMIN_KEY` | separate password for the `#admin` Throne Room (only the trip organizer should have this) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | injected automatically by the Upstash Vercel integration once it's attached to the project |

None of these are committed. If they're gone (new Vercel project, integration detached, whatever), you'll
need to regenerate them and reattach Upstash. The site fails closed (locks everyone out, including you)
if `SITE_PASSWORD` or `GATE_TOKEN` are unset — see `site/middleware.ts`.

### Deploying

```bash
cd site
vercel --prod
```

That's it — no CI pipeline, this was deployed by hand throughout the build. If you're rebuilding this
years later, `vercel link` first to reconnect to the right project (or create a new one).

### Where the actual trip content lives

`site/src/data/trip.tsx` is the single file with all the real, non-generic content: the squad, the
house that got booked, the itinerary, the weather cities, footer copy, everything. If you ever want to
reuse this whole site for a *different* trip, this is the one file to gut and rewrite — the components
and backend are generic enough to carry over.

`site/shared/seeds.ts` has the seed data for the shared Redis state (activity pitches, starting
expenses) — this is what the database gets populated with the first time it's empty.

## Why this exists / how it got built

Short version: I asked for a trip summary out of the group chat, then a writing-style guide, then had
Claude Design mock up a dashboard, then had Claude Code build the real thing on top of real data in the
group's actual voice, then kept iterating (real map instead of a fake one, cookie gate instead of a
janky basic-auth prompt, running jokes worked into the copy) over a few days of back-and-forth. The whole
build is in the git history if you want to see how it evolved commit by commit.

If you're a future instance of Claude reading this to get oriented: read `WRITING_STYLE.md` before
touching any user-facing copy, and don't regenerate `trip_data.json` from scratch — it's hand-verified
against the real chat, not a first draft.
