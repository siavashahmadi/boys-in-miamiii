import type { ReactNode } from 'react';
import type { CatKey } from '../../shared/seeds';

// ---------- the squad ----------
export interface Member { name: string; color: string; soft: string }
export const SQUAD: Member[] = [
  { name: 'Sia',   color: 'var(--c-coral)', soft: 'var(--c-coral-s)' },
  { name: 'Pete',  color: 'var(--c-teal)',  soft: 'var(--c-teal-s)' },
  { name: 'Joe',   color: 'var(--c-gold)',  soft: 'var(--c-gold-s)' },
  { name: 'Lucas', color: 'var(--c-lav)',   soft: 'var(--c-lav-s)' },
  { name: 'Kia',   color: 'var(--c-mint)',  soft: 'var(--c-mint-s)' },
  { name: 'Tom',   color: 'var(--c-pink)',  soft: 'var(--c-pink-s)' },
];
export const squadMeta = Object.fromEntries(SQUAD.map((s) => [s.name, s])) as Record<string, Member>;

// ---------- trip constants ----------
export const WHEELS_UP = new Date('2026-07-23T21:40:00-04:00').getTime(); // B6 1697, the real one
export const TRIP_META = 'Jul 23–26, 2026 · fort lauderdale · 6 mfers confirmed';

// ---------- categories / map ----------
export interface Cat { label: string; emoji: string; color: string; soft: string }
export const CATS: Record<CatKey, Cat> = {
  eats:    { label: 'EATS',      emoji: '🍽️', color: 'var(--c-coral)', soft: 'var(--c-coral-s)' },
  water:   { label: 'WATER',     emoji: '🌊', color: 'var(--c-teal)',  soft: 'var(--c-teal-s)' },
  beach:   { label: 'BEACH',     emoji: '🏖️', color: 'var(--c-gold)',  soft: 'var(--c-gold-s)' },
  night:   { label: 'NIGHTLIFE', emoji: '🕺', color: 'var(--c-lav)',   soft: 'var(--c-lav-s)' },
  culture: { label: 'CULTURE',   emoji: '🎨', color: 'var(--c-mint)',  soft: 'var(--c-mint-s)' },
  chaos:   { label: 'CHAOS',     emoji: '🎲', color: 'var(--c-pink)',  soft: 'var(--c-pink-s)' },
};

export const ANCHORS = [
  { emoji: '⭐', label: 'Casa de los Uncs', mx: 56, my: 15, tint: 'var(--c-gold)' },
  { emoji: '✈️', label: 'FLL airport', mx: 44, my: 26, tint: 'var(--c-teal)' },
];

// ---------- lodging: the one we locked in ----------
export interface House {
  name: string;
  area: string;
  price: string;
  specs: string;
  url: string;
  blurb: string;
  amenities: { emoji: string; label: string }[];
  mapQuery: string; // swap for the exact street address once we have it
  lat: number;
  lng: number;
}
export const HOUSE: House = {
  name: 'Casa de los Uncs',
  area: 'Fort Lauderdale, FL',
  price: '$2,073 for the long weekend',
  specs: '4 bedrooms · 7 beds · 3 baths · ★4.85 (119 reviews)',
  url: 'https://www.airbnb.com/rooms/613636449757891426',
  blurb:
    "home base, verified pin and all. one flat mile from the lauderdale-by-the-sea sand, 19 minutes from las olas. heated pool (we are not paying $100 a night to heat water in july), a pool table for the 2am tournaments nobody remembers, an outdoor bar, corn hole, a giant connect 4, and a chef's kitchen with four different ways to make coffee. beach gear included down to the wagon, plus two bikes for whoever loses the minivan seat argument. three full bathrooms so nobody fights before the casino. the backyard hosts the nightly summit: four regulars, joe once a year, and tommy on lookout duty until further notice.",
  amenities: [
    { emoji: '🏊', label: 'heated pool' },
    { emoji: '🎱', label: 'pool table' },
    { emoji: '🍹', label: 'outdoor bar' },
    { emoji: '🎯', label: 'corn hole + giant connect 4' },
    { emoji: '🚿', label: '3 full baths' },
    { emoji: '🛏️', label: '7 beds' },
    { emoji: '📺', label: '75" tv' },
    { emoji: '🚲', label: '2 bikes included' },
    { emoji: '🏖️', label: 'beach gear + wagon' },
    { emoji: '🎰', label: '20 min to live tables' },
    { emoji: '🌿', label: 'summit-ready backyard' },
  ],
  mapQuery: '4710 NE 27th Ave, Fort Lauderdale, FL 33308',
  lat: 26.18604, // the actual front door, from michael's check-in email
  lng: -80.10954,
};

// The check-in email intel, jul 19, from michael. Day-of essentials.
export const HOUSE_INTEL = {
  title: 'House intel',
  sub: "straight from michael's check-in email. screenshot this before boarding.",
  items: [
    { emoji: '📍', label: 'address', value: '4710 NE 27th Ave, Fort Lauderdale, FL 33308', href: 'https://www.google.com/maps/search/?api=1&query=4710%20NE%2027th%20Ave%2C%20Fort%20Lauderdale%2C%20FL%2033308' },
    { emoji: '🔑', label: 'front door code', value: '2895' },
    { emoji: '🚪', label: 'garage code', value: '7951' },
    { emoji: '📶', label: 'wifi', value: 'Soflobnb · Soflofun!' },
    { emoji: '📲', label: 'host line', value: '(904) 650-5854', href: 'tel:+19046505854' },
    { emoji: '🕓', label: 'check-in / out', value: 'from 4:00p jul 23 · out by 10:00a jul 26' },
    { emoji: '🚗', label: 'parking', value: '2 in the garage + 3 in the driveway. NO street parking, HOA is watching. garage clears 81 inches, the minivan fits.' },
    { emoji: '📖', label: 'guidebook', value: 'the official house guide', href: 'https://guide.breezeway.io/1IQ0-i9rJ34' },
  ],
};

// The deeper listing intel, straight from the airbnb page.
export const HOUSE_DETAIL = {
  galleryNote: 'actual photos. the pool is real. the pool table is real. the loungers are already claimed.',
  sleepsTitle: 'Who sleeps where',
  sleepsSub: 'seven beds, four rooms, six uncs. the draft will be televised.',
  sleeps: [
    { emoji: '👑', name: 'bedroom 1', beds: 'king + twin', perk: 'ensuite bathroom AND its own door to the pool. the power suite. expect bloodshed in the draft.' },
    { emoji: '💼', name: 'bedroom 2', beds: 'queen + twin w/ trundle', perk: 'the only dedicated workspace, for whoever pretends to work remote on friday.' },
    { emoji: '🛏️', name: 'bedroom 3', beds: 'queen', perk: 'no frills, has a mirror. the humble room builds character.' },
    { emoji: '🚪', name: 'bedroom 4', beds: 'king', perk: 'king bed plus direct outdoor access for discreet summit attendance.' },
  ],
  rulesTitle: 'The fine print',
  rules: [
    'check-in 4pm · checkout 10am. the sunday walk of shame ends at 9:45.',
    'quiet hours 10pm to 8am. the summit convenes at library volume.',
    'no smoking on the premises. the summit acknowledges this rule exists.',
    'no parties. detection means cancellation with no refund. a gathering of six respectful uncs remains not a party.',
    'no extra guests without approval. neon waits outside.',
    'no glass near the pool. decant like a professional.',
    'do not touch the pool equipment. there is a skimmer by the gate for leaf emergencies.',
    'do not mix colors with the white linens. this is a laundry rule and a lifestyle.',
    'trash goes out monday and thursday. a service handles it. our job is nothing.',
    'exterior camera out front. wave to michael.',
    'pool heating is $100 a night. declined. it is july, the sun works for free.',
  ],
  hostLine: 'hosted by michael the superhost and his wife jill. 1,345 reviews, responds within the hour. do not test him.',
  reviewsLine: '★4.85 across 119 reviews. location scores 4.9. the people love it here.',
  mapCaption: 'the pin is the actual front door. 4710 NE 27th Ave.',
};

// The essentials: researched and verified jul 13. Feeds the Stay guide AND the
// muted pins on the Map tab (top pick per category).
export interface EssentialPick { name: string; lat: number; lng: number; distMi: number; driveMin: number; link: string; why: string; top?: boolean }
export interface Essential { key: string; emoji: string; label: string; picks: EssentialPick[] }
export const ESSENTIALS: Essential[] = [
  {
    key: 'grocery', emoji: '🛒', label: 'the grocery run',
    picks: [
      { name: 'Publix at Sea Ranch Village', lat: 26.197, lng: -80.097, distMi: 1.5, driveMin: 5, top: true, link: 'https://www.google.com/maps/search/?api=1&query=Publix%20Sea%20Ranch%20Village%204703%20N%20Ocean%20Dr%20Lauderdale-by-the-Sea%20FL', why: 'the grill-run store. full deli and meat counter, straight over the commercial blvd bridge. open til 10, 11 on weekends.' },
      { name: 'Total Wine & More', lat: 26.145, lng: -80.119, distMi: 3.7, driveMin: 11, link: 'https://www.google.com/maps/search/?api=1&query=Total%20Wine%201740%20N%20Federal%20Hwy%20Fort%20Lauderdale%20FL', why: 'a warehouse of beverages with case pricing, and it shares a plaza with another publix. one combined run.' },
      { name: "BJ's Wholesale Club", lat: 26.19, lng: -80.155, distMi: 3.3, driveMin: 10, link: 'https://www.google.com/maps/search/?api=1&query=BJs%20Wholesale%205100%20NW%209th%20Ave%20Fort%20Lauderdale%20FL', why: "bulk meat, ice, and paper goods plus a gas station. membership required, someone's mom has one." },
    ],
  },
  {
    key: 'food', emoji: '🍽️', label: 'eating out',
    picks: [
      { name: 'Aruba Beach Cafe', lat: 26.189, lng: -80.096, distMi: 1.2, driveMin: 5, top: true, link: 'https://www.google.com/maps/search/?api=1&query=Aruba%20Beach%20Cafe%201%20Commercial%20Blvd%20Lauderdale-By-The-Sea%20FL', why: 'on the actual sand at the end of our street. live music every night, open past midnight on weekends. the default.' },
      { name: 'Greek Islands Taverna', lat: 26.169, lng: -80.101, distMi: 2, driveMin: 7, link: 'https://www.google.com/maps/search/?api=1&query=Greek%20Islands%20Taverna%203300%20N%20Ocean%20Blvd%20Fort%20Lauderdale%20FL', why: 'host rec and the best-rated plates around. lamb chops, octopus, no reservations, the line wraps the building. send a scout.' },
      { name: 'Shooters Waterfront', lat: 26.166, lng: -80.113, distMi: 2.3, driveMin: 8, link: 'https://www.google.com/maps/search/?api=1&query=Shooters%20Waterfront%203033%20NE%2032nd%20Ave%20Fort%20Lauderdale%20FL', why: 'dockside on the intracoastal since 1982. burgers and boat watching.' },
    ],
  },
  {
    key: 'fun', emoji: '🎉', label: 'non-beach fun',
    picks: [
      { name: 'Topgolf Pompano Beach', lat: 26.225, lng: -80.152, distMi: 6, driveMin: 15, top: true, link: 'https://www.google.com/maps/search/?api=1&query=Topgolf%20Pompano%20Beach%20400%20Lucky%20Ln%20Pompano%20Beach%20FL', why: 'one bay fits all six. half off mon-thu, $30/hr after 10pm weekends, open til 1am fri-sat. loser funds the publix run.' },
      { name: 'Funky Buddha Brewery', lat: 26.168, lng: -80.137, distMi: 3, driveMin: 9, link: 'https://www.google.com/maps/search/?api=1&query=Funky%20Buddha%20Brewery%201201%20NE%2038th%20St%20Oakland%20Park%20FL', why: '25+ house drafts, a real kitchen, cornhole and giant jenga. nine minutes from the crib.' },
      { name: 'Glitch Bar & Arcade', lat: 26.143, lng: -80.141, distMi: 4.5, driveMin: 14, link: 'https://www.google.com/maps/search/?api=1&query=Glitch%20Bar%20905%20NE%205th%20Ave%20Fort%20Lauderdale%20FL', why: 'retro arcade cabinets and skee-ball, game pass free with any drink, open til 3am on weekends.' },
    ],
  },
  {
    key: 'beach', emoji: '🏖️', label: 'the sand',
    picks: [
      { name: 'Lauderdale-by-the-Sea Beach', lat: 26.189, lng: -80.096, distMi: 1.2, driveMin: 6, top: true, link: 'https://www.google.com/maps/search/?api=1&query=Lauderdale-by-the-Sea%20Beach%20El%20Mar%20Dr%20%26%20Commercial%20Blvd%20FL', why: 'our beach. one flat mile down commercial blvd, so walk the wagon or ride the bikes and skip parking entirely. bars right on the sand.' },
      { name: 'Fort Lauderdale Beach (Las Olas)', lat: 26.119, lng: -80.104, distMi: 6.2, driveMin: 20, link: 'https://www.google.com/maps/search/?api=1&query=Las%20Olas%20Oceanside%20Park%20Fort%20Lauderdale%20FL', why: 'the classic strip with the wave wall. 650-space garage one block from the sand when we want the scene.' },
      { name: 'Pompano Beach Pier', lat: 26.235, lng: -80.089, distMi: 4.8, driveMin: 13, link: 'https://www.google.com/maps/search/?api=1&query=Pompano%20Beach%20Pier%20222%20N%20Pompano%20Beach%20Blvd%20FL', why: 'quieter, wider sand with the rebuilt 900ft pier and a proper garage. good for a six-man wagon convoy.' },
    ],
  },
  {
    key: 'casino', emoji: '🎰', label: 'joe containment',
    picks: [
      { name: 'Seminole Casino Coconut Creek', lat: 26.278, lng: -80.175, distMi: 11, driveMin: 20, top: true, link: 'https://www.google.com/maps/search/?api=1&query=Seminole%20Casino%20Coconut%20Creek%205550%20NW%2040th%20St%20Coconut%20Creek%20FL', why: 'the discovery: 80 REAL live tables (blackjack, craps, roulette) running 24/7 at half the drive of the church. the chapel of ease.' },
      { name: "Harrah's Pompano Beach", lat: 26.226, lng: -80.156, distMi: 6, driveMin: 13, link: 'https://www.google.com/maps/search/?api=1&query=Harrahs%20Pompano%20Beach%20777%20Isle%20of%20Capri%20Cir%20FL', why: 'closest casino overall at 13 minutes, but the table games are electronic only. slots, a WSOP poker room, and topgolf next door.' },
      { name: 'Gulfstream Park Casino', lat: 25.98, lng: -80.139, distMi: 17, driveMin: 26, link: 'https://www.google.com/maps/search/?api=1&query=Gulfstream%20Park%20Casino%20Hallandale%20Beach%20FL', why: 'slots plus live horse racing in hallandale. no closer than the church, skip unless the ponies call.' },
    ],
  },
  {
    key: 'jetski', emoji: '🌊', label: 'jet skis',
    picks: [
      { name: 'KC Jet Ski & Watersports', lat: 26.232, lng: -80.091, distMi: 5, driveMin: 14, top: true, link: 'https://www.google.com/maps/search/?api=1&query=KC%20Jet%20Ski%20125%20N%20Riverside%20Dr%20Pompano%20Beach%20FL', why: 'family-run, launches straight onto the intracoastal from sands harbor marina. $110/hr, $70 half hour, $20 extra rider. 10am-6pm daily.' },
      { name: 'American Watersports', lat: 26.239, lng: -80.089, distMi: 4.7, driveMin: 14, link: 'https://www.google.com/maps/search/?api=1&query=American%20Watersports%20615%20N%20Ocean%20Blvd%20Pompano%20Beach%20FL', why: 'cheapest at $100/hr with a beach launch right off pompano sand. groupon deals float around $86.' },
      { name: 'Prime Watersports', lat: 26.114, lng: -80.104, distMi: 6.5, driveMin: 18, link: 'https://www.google.com/maps/search/?api=1&query=Prime%20Watersports%20301%20Seabreeze%20Blvd%20Fort%20Lauderdale%20FL', why: 'bahia mar launch on lauderdale beach, $135/hr plus $30 fuel, and they throw in a scenic boat ride.' },
    ],
  },
];
export const HOUSE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOUSE.mapQuery)}`;

// Convenience link (opens the phone's maps app to the area for directions).
export const AREA_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Fort+Lauderdale%2C+FL';

// Hex versions of the category colors, for the Leaflet marker pins.
export const CAT_HEX: Record<CatKey, string> = {
  eats: '#E38C74', water: '#3FA5B2', beach: '#D6A94E',
  night: '#987FCF', culture: '#5AA57E', chaos: '#CE86A6',
};

// Real lat/lng for the six seeded spots on the OpenStreetMap map. Some are real
// places, some are jokes dropped roughly where they'd happen. Keyed by pitch id.
export const MAP_PINS: Record<string, { lat: number; lng: number }> = {
  p_beach: { lat: 26.192, lng: -80.0955 },     // Lauderdale-by-the-Sea beach
  p_soccer: { lat: 26.188, lng: -80.098 },     // beach / backyard
  p_grill: { lat: 26.18604, lng: -80.10954 },  // the crib (actual front door)
  p_hardrock: { lat: 26.0512, lng: -80.2103 }, // Seminole Hard Rock, Hollywood
  p_neon: { lat: 25.801, lng: -80.199 },       // Wynwood, Miami (find neon lol)
  p_drake: { lat: 25.7814, lng: -80.187 },     // downtown Miami (Kaseya Center)
  p_sesh: { lat: 26.18624, lng: -80.10934 },   // the backyard, casa de los uncs
  p_tommy: { lat: 26.05, lng: -80.02 },        // the middle of the atlantic, where tommy's odds live
};

// ---------- itinerary ----------
export interface DayItem { time: string; title: string; note: string }
export interface Day { label: string; title: string; date: string; accent: string; bg: string; items: DayItem[] }
export const DAYS: Day[] = [
  {
    label: 'THURSDAY', title: 'Wheels up', date: 'Jul 23 · leave ATL', accent: 'var(--c-coral)', bg: 'var(--c-coral-s)',
    items: [
      { time: '7:30p', title: 'Get to ATL', note: "it's ATL on a thursday. leave early or get left." },
      { time: '9:40p', title: 'ATL → FLL · B6 1697', note: 'the 6:40 is dead, long live the 9:40. aisle seats for the tall ones or there will be words.' },
      { time: '~11:45p', title: 'Land + grab the whip', note: 'the minivan awaits. LMco rate, booked and done. six uncs, one van, zero shame.' },
      { time: '12:30a', title: 'Check into Casa de los Uncs', note: 'smartlock self check-in. michael sleeps, we do not.' },
      { time: '1:30a', title: 'Backyard summit, session one', note: "quorum convenes: sia, kia, lucas, pete. joe's annual invite stands. tom is welcome to watch and judge." },
    ],
  },
  {
    label: 'FRIDAY', title: 'Beach & the grill', date: 'Jul 24', accent: 'var(--c-teal)', bg: 'var(--c-teal-s)',
    items: [
      { time: '10:00a', title: 'Recovery breakfast', note: 'grease. electrolytes. no regrets yet, too early.' },
      { time: '12:00p', title: 'Beach', note: "short hop from the house. 'lol a block away is nothing.'" },
      { time: '4:00p', title: 'Pool', note: 'unc status activates. wife beaters optional but encouraged.' },
      { time: '7:00p', title: 'Kia on the grill', note: "'gimme a pool and a grill.' dinner: solved." },
      { time: '11:00p', title: 'Night moves TBD', note: 'pitch it on the map ↓ sia is judging.' },
      { time: '1:00a', title: 'Summit, session two', note: "same four. joe went to bed at 10:15. tommy says he's 'thinking about it.' he is not." },
    ],
  },
  {
    label: 'SATURDAY', title: 'Full send (gently)', date: 'Jul 25', accent: 'var(--c-mint)', bg: 'var(--c-mint-s)',
    items: [
      { time: '11:00a', title: 'Pool + soccer ball action', note: 'a lil touch in the yard. loser does the dishes.' },
      { time: '2:00p', title: 'Find Neon?', note: "he's out there somewhere. lucas has a feeling." },
      { time: '6:00p', title: 'Dinner TBD', note: 'map ↓. funny pitches get approved faster.' },
      { time: '9:00p', title: "JOE'S CHURCH", note: "hard rock casino, ~30 min south. tom's just watching. lucas is betting rent money." },
      { time: '2:00a', title: 'Leave the casino', note: 'this is a lie and we all know it.' },
    ],
  },
  {
    label: 'SUNDAY', title: 'The long goodbye', date: 'Jul 26 · fly home', accent: 'var(--c-gold)', bg: 'var(--c-gold-s)',
    items: [
      { time: '10:00a', title: 'Checkout', note: "find your other shoe (it's in the pool), open every window, febreze the whole crib. deposit protection protocol." },
      { time: '11:00a', title: 'Last beach hang', note: 'one final aggressive tan.' },
      { time: '4:00p', title: 'Return the whip + airport', note: 'gas it up or pete files a formal complaint.' },
      { time: '6:55p', title: 'Flight home ×4', note: 'sia, pete, joe, kia. jetblue back to reality.' },
      { time: '8:40p', title: 'The residency flight', note: 'lucas & tom close out the terminal like it’s a set.' },
    ],
  },
];

// ---------- weather ----------
export interface WxHour { time: string; icon: string; feels: string; rain: string }
export interface WxDay { day: string; date: string; icon: string; hi: string; lo: string; cond: string; rain: string; feels?: string; hours?: WxHour[] }
export interface WxCity { key: string; label: string; accent: string; soft: string; lat: number; lon: number; fallbackNow: string; note: string; fallbackDays: WxDay[] }
export const WEATHER_CITIES: WxCity[] = [
  {
    key: 'fll', label: 'FORT LAUDERDALE', accent: 'var(--c-coral)', soft: 'var(--c-coral-s)',
    lat: 26.1224, lon: -80.1373,
    fallbackNow: '~90°', note: 'humidity: soup. feels like 104.',
    fallbackDays: [
      { day: 'THU', date: 'Jul 23', icon: '☀️', hi: '90°', lo: '79°', cond: 'hot. obviously', rain: '20%' },
      { day: 'FRI', date: 'Jul 24', icon: '⛅', hi: '89°', lo: '78°', cond: 'hot again', rain: '35%' },
      { day: 'SAT', date: 'Jul 25', icon: '🌦️', hi: '88°', lo: '78°', cond: '3pm violence', rain: '55%' },
      { day: 'SUN', date: 'Jul 26', icon: '☀️', hi: '90°', lo: '79°', cond: 'hot farewell', rain: '25%' },
    ],
  },
  {
    key: 'mia', label: 'MIAMI', accent: 'var(--c-teal)', soft: 'var(--c-teal-s)',
    lat: 25.7617, lon: -80.1918,
    fallbackNow: '~91°', note: 'daily 3pm downpour, then instantly sunny like nothing happened.',
    fallbackDays: [
      { day: 'THU', date: 'Jul 23', icon: '⛅', hi: '91°', lo: '80°', cond: 'humid', rain: '25%' },
      { day: 'FRI', date: 'Jul 24', icon: '🌦️', hi: '90°', lo: '79°', cond: 'pop-up storms', rain: '45%' },
      { day: 'SAT', date: 'Jul 25', icon: '⛈️', hi: '89°', lo: '79°', cond: 'pm thunder', rain: '60%' },
      { day: 'SUN', date: 'Jul 26', icon: '☀️', hi: '91°', lo: '80°', cond: 'sunny', rain: '25%' },
    ],
  },
];
export const WEATHER_SUB = "it's july in south florida. sun, one violent 20-minute storm at 3pm, then sun again like nothing happened.";
export const WEATHER_FALLBACK_NOTE = 'real forecast unlocks ~jul 10 when the trip enters the 16-day window. until then: educated guesses.';
export const WEATHER_HOURLY_HINT = 'tap a day for the hour-by-hour';
export const WEATHER_FEELS_NOTE = 'temps are feels-like. the humidity is priced in.';
export const WEATHER_HOURLY_OFFLINE = "hourly needs the live feed. it's florida in july, assume soup with a 3pm storm.";
export const PACKING = {
  title: '🧳 what to actually pack',
  body: 'SPF 50 minimum (it’s literally in the footer), one dry shirt per day because you WILL sweat through the first, a wife beater for kia, the soccer ball, sunglasses you can afford to lose at the casino, eye drops for four of us, a blanket for joe’s annual 10pm curtain call, and a lighter for tommy (manifesting).',
};

// ---------- budget ----------
export const BUDGET_SUB = "who fronted what, so nobody's holding a grudge on the flight home. flights were every-man-for-himself (ask tom), so the tab starts here.";
export const TOM_CALLOUT = {
  title: '🧾 the market maker owes us',
  body: "the flights were dirt cheap, so naturally we called tom the market maker. then tom bought his ticket first, locked his low price, and the second sia hit purchase jetblue jacked it +$124. everybody after tom paid up. classic pump and dump. tom felt bad and put $80 in the pool for a group dinner or jet skis. we're holding him to it.",
};
export const BUDGET_EMPTY = "nothing logged yet. the airbnb deposit is coming for one of us. probably pete.";

// ---------- home page cards ----------
export interface InfoCard { emoji: string; iconBg: string; title: string; body: ReactNode }
export const INFO_CARDS: InfoCard[] = [
  {
    emoji: '✈️', iconBg: 'var(--c-coral-s)', title: 'Flights',
    body: (
      <>
        <b style={{ color: 'var(--ink)' }}>Out:</b> thu 7/23, 9:40p ATL → FLL, jetblue B6 1697. all six of us, landing ~11:45p.<br />
        <b style={{ color: 'var(--ink)' }}>Back:</b> sun 7/26, 6:55p. <b style={{ color: 'var(--c-lav)' }}>lucas &amp; tom on the 8:40</b> like it's a residency. everyone's booked.
      </>
    ),
  },
  {
    emoji: '🚗', iconBg: 'var(--c-teal-s)', title: 'The whip',
    body: (
      <>
        <span style={{ color: 'var(--c-mint)', fontWeight: 600 }}>booked.</span> it's a <b style={{ color: 'var(--c-teal)' }}>minivan</b> on the LMco rate. yes, a minivan. sliding doors, six seats, room for the durian. the explorer was $50 more to look 10% cooler and we are not those guys.
      </>
    ),
  },
  {
    emoji: '🏠', iconBg: 'var(--c-mint-s)', title: 'Home base',
    body: (
      <>
        we're locked in at <b style={{ color: 'var(--c-mint)' }}>Casa de los Uncs</b> in fort lauderdale. heated pool, pool table, and enough bathrooms to keep the peace. <a href="#stay" style={{ color: 'var(--c-mint)', fontWeight: 600 }}>see the spot →</a>
      </>
    ),
  },
  {
    emoji: '💸', iconBg: 'var(--c-gold-s)', title: 'The kitty',
    body: (
      <>
        <b style={{ color: 'var(--c-gold)' }}>tom's $80</b> is in the pool for a group dinner or jet skis, his penance for pumping the flight price on us. venmo logistics TBD. <a href="#budget" style={{ color: 'var(--c-gold)', fontWeight: 600 }}>the tab →</a>
      </>
    ),
  },
];

// ---------- the practice table ----------
export const CASINO = {
  eyebrow: 'THE DEGEN OLYMPICS',
  h1: 'The practice table',
  sub: "warm up before the real church. everyone starts with a grand of house money. dealer's a machine and shows no mercy.",
  stakesTitle: '🏆 the stakes',
  stakes: 'most winnings by the time we land in FLL gets dinner paid for by the rest of the group. table stays open on the plane. jetblue wifi, no excuses.',
  closesPrefix: 'table closes in',
  feltCaption: 'CASA DE LOS UNCS · BLACKJACK PAYS 3:2',
  dealBtn: 'run it.',
  clearBtn: 'clear',
  markerBtn: 'take a marker (+$1,000. everyone will know.)',
  brokeLine: "you're broke. the table doesn't do sympathy.",
  closedTitle: "table's closed.",
  closedSub: 'we have landed. the real church is 30 minutes from the crib.',
  winnerPrefix: '👑 biggest earner:',
  winnerSuffix: 'their dinner is on the rest of us. a deal is a deal.',
  rulesTitle: '🃏 house rules',
  rules: [
    'blackjack pays 3:2',
    'dealer stands on all 17s',
    'double any first two cards',
    'split once (aces get one card each)',
    '$25 min · no max as of jul 12. joe asked, the house listened.',
    'continuous shuffle. no counting. this WAS a family casino.',
    'markers are $1,000 and the count is public. the shame is the interest.',
    'the goal is to WIN the money. this rule was added jul 10 for one specific person.',
    'roulette: straight 35:1 · dozens and columns 2:1 · colors 1:1',
    'the wheel has two zeros. the house needed a second one for joe.',
  ],
  exhibitionCaption: 'EXHIBITION ERA · PRIDE ONLY',
  contestOverTitle: '👑 dinner is decided',
  contestOverBody: '{name} finished on top when we landed. the rest of us are buying. the table stays open for pride.',
  memorialTitle: '🕯️ in memoriam',
  memorialBody: "joe's first era: -$15,500 in 120 hands. fifteen markers deep. eight blackjacks and none of them helped. he thought the goal was to lose the most. he was at -$12,400 when we started carving this plaque and lost another $3,100 before it was finished. the table believed in him. reset to $1,000 out of mercy, jul 10, 2026.",
  boardTitle: 'THE BOARD',
  boardEmpty: "nobody's sat down yet. $1,000 house money waiting.",
  statsHint: 'tap a name for the full damage report',
  statsSinceNote: '* the deeper stats started counting jul 13. everything before that is lost to history, which is probably for the best.',
  houseTitle: 'the house',
  houseSub: 'undefeated since jul 10',
  houseLine: "the house doesn't gamble. the house collects.",
  prophecyFresh: 'the black jacks have chosen you. screenshot this. sia owes you $10 cash.',
  prophecyStale: 'the black jacks already chose {name}. you are late.',
  niceEgg: 'the 69 special pays out. sia owes you $10. screenshot it.',
  crownSub: '{name} eats free. a deal is a deal.',
  localNote: 'the table needs the real backend. open the live site to play.',
};

// ---------- the ticker ----------
// Static chyron fillers; live headlines get built from real data in Ticker.tsx.
export const TICKER = {
  pre: [
    'the house is undefeated',
    'the black jacks are watching',
    'SPF 50 minimum',
    'this WAS a family casino',
    'dinner stakes: most winnings at landing eats free',
  ],
  trip: [
    'the house is undefeated',
    'the black jacks are watching',
    'SPF 50: reapply now',
    'the pool is heated. the cards are not',
  ],
  after: [
    'the table is closed forever',
    'SPF 50 was a suggestion apparently',
  ],
};

// ---------- trip phases ----------
export const PHASE = {
  tripEyebrow: 'WE ARE SO BACK',
  afterEyebrow: 'IT HAPPENED',
  hoursLabel: 'HOURS IN FLORIDA',
  overLabel: "IT'S OVER",
  overSub: 'we survived. pour one out for the bankrolls.',
  todayTitle: 'today at a glance',
  horoscopeTitle: '🔮 Daily degen horoscope',
  horoscopeFoot: 'renews at midnight. the stars are not liable for losses.',
};

// ---------- the pouring of tommy ----------
export const POUR = {
  title: '🫗 The pouring of tommy',
  lore: "tommy lost fantasy football. the sentence, chosen by the man himself: each of us gets to pour one (1) thing on his head in florida. his only rule, quote, \"no poop, piss, or nut doe.\" he announced this like it was a ridiculous request.",
  statementLabel: 'official statement from the defendant:',
  statement: '"nah let\'s just get this over with"',
  worry: '"I\'m most worried about Joseph... this will be the hardest joseph ever laughs gurantee"',
  undeclared: 'undeclared. cooking something.',
  inputPlaceholder: 'declare your pour. 140 characters of malice.',
  saveBtn: 'declare it',
  editBtn: 'revise',
  tomLine: "you're the pouree. sit down.",
};

// ---------- the wheel ----------
export const ROULETTE = {
  title: 'the wheel',
  spinBtn: 'send it.',
  clearBtn: 'clear',
  undoBtn: 'undo',
  rebetBtn: 'rebet',
  atStake: 'at stake',
  minNote: '$25 minimum across your bets. tap a chip, then tap the board.',
  zerosNote: '0 and 00 are green. they are also inevitable.',
  historyTitle: 'LAST SPINS',
  straightHit: '35 TO 1.',
  winStamp: 'WIN.',
  pushStamp: 'a wash.',
  loseStamp: 'the house thanks you.',
};

// ---------- the landing ceremony ----------
export const CEREMONY = {
  title: 'WE ARE SO BACK',
  subWinner: 'day {n} of 4. the table is closed. {name} eats free.',
  subNoWinner: 'day {n} of 4. we are actually here.',
  enter: 'enter the trip →',
};

// ---------- tonight in the 954 ----------
export const TONIGHT = {
  title: '🔦 tonight in the 954',
  foot: 'curated fresh daily. weather considered. attendance optional.',
};

// ---------- the vice booth ----------
export const BOOTH = {
  eyebrow: 'DOCUMENT RESPONSIBLY',
  title: 'The vice booth',
  sub: 'pick a photo, pick a filter, send it to the chat. no cloud, no ai, no evidence retained.',
  pickBtn: '📸 choose or take a photo',
  shareBtn: 'share it',
  downloadBtn: 'download',
  again: 'new photo',
  homeCard: 'turn trip photos into miami vice frames, vhs tapes, and certified unc portraits.',
  homeCta: 'open the booth →',
};

// ---------- the manifest ----------
export const MANIFEST = {
  title: 'The manifest',
  sub: 'what michael does not provide. beach gear, wagon, boogie boards, coolers, and two bikes are already at the house.',
  claimBtn: 'i got it',
  claimedSuffix: "'s got it",
  addLabelPh: 'what are we forgetting?',
  addNotePh: 'why it matters (optional)',
  addEmojiPh: '🧳',
  addBtn: 'add to the load',
  unclaimedSuffix: 'unclaimed',
  allClaimed: 'everything is claimed. the uncs are prepared. suspicious.',
};

export const FOOTER = {
  tagline: (
    <>
      built for the boys. six of us, one house, one long weekend. let's not lose anybody. <a href="#admin" style={{ color: 'var(--ink3)', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>·</a>
    </>
  ),
  small: 'no refunds · SPF 50 minimum',
  spfProgress: 'applied',
  spfReveal: "fully protected. SPF 50 achieved. kia owes you $50. he doesn't know yet. screenshot this.",
};
