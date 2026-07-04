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
export const WHEELS_UP = new Date('2026-07-23T18:40:00-04:00').getTime();
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
  { emoji: '⭐', label: 'Home base (probably)', mx: 56, my: 15, tint: 'var(--c-gold)' },
  { emoji: '✈️', label: 'FLL airport', mx: 44, my: 26, tint: 'var(--c-teal)' },
];

// ---------- lodging: the final four ----------
export interface Bnb {
  id: string;
  name: string;
  price: string;
  beds: string;
  blurb: string;
  icon: string;
  bg: string;
  url: string;
  tag: string;
  tagColor: string;
  status: 'candidate' | 'booked';
}
// When one gets booked: flip its status to 'booked' and redeploy. That's it.
export const BNBS: Bnb[] = [
  {
    id: 'bnb_lbts',
    name: 'The Normal Ass House',
    price: '$1,828 total',
    beds: '3 bd · 7 beds · 2 ba (be mindful lucas)',
    blurb: "walkable beach AND a private pool AND a grill. sia's vote, kia co-signed 'if it's not in the ghetto.' only sin: 30 min from the casino.",
    icon: '🏖️',
    bg: 'linear-gradient(135deg,#A8DDC5,#9FC7E8)',
    url: 'https://www.airbnb.com/rooms/38513885',
    tag: '⭐ the presumptive one',
    tagColor: 'var(--c-gold)',
    status: 'candidate',
  },
  {
    id: 'bnb_extra_bath',
    name: 'The Extra Bathroom House',
    price: '$2,073 total',
    beds: '4 bd · 7 beds · 3 ba',
    blurb: "heated pool + pool table. joe and lucas are 'down to pay extra,' which is rich coming from the casino caucus. most expensive of the four.",
    icon: '🎱',
    bg: 'linear-gradient(135deg,#F5C6D3,#F5D9A8)',
    url: 'https://www.airbnb.com/rooms/613636449757891426',
    tag: 'the bougie pick',
    tagColor: 'var(--c-lav)',
    status: 'candidate',
  },
  {
    id: 'bnb_penthouse',
    name: 'The Penthouse',
    price: '~$1,808 all-in',
    beds: '3 bd · 8 beds · 3 ba · ★5.0',
    blurb: "south FL penthouse GOES HARD (lucas, twice). closest to joe's church. no private pool, and $58/day of fees hiding in the fine print like roaches.",
    icon: '🏙️',
    bg: 'linear-gradient(135deg,#9FD3E0,#C4B4E4)',
    url: 'https://www.airbnb.com/rooms/1639960090219590758',
    tag: "lucas's dream",
    tagColor: 'var(--c-teal)',
    status: 'candidate',
  },
  {
    id: 'bnb_vrbo',
    name: 'The Janky One',
    price: '$1,602 total',
    beds: '6 beds · walkable to everything',
    blurb: "pete's own listing copy: 'looks old and janky but walkable to a lot of stores.' tom's pick because it's the cheapest and tom is the only honest man here.",
    icon: '🛖',
    bg: 'linear-gradient(135deg,#F5D9A8,#EBB59A)',
    url: 'https://www.vrbo.com/9682046ha',
    tag: "tom's budget king",
    tagColor: 'var(--c-pink)',
    status: 'candidate',
  },
];

export const STAY_BUDGET_LINE = 'budget was $100/night per person, $1,600 total (allegedly). every finalist blew past it. nobody cares anymore.';
export const STAY_STATUS_LINE = "the vote died. everybody has preferences and nobody's saying shit, so pete's booking one that works and isn't too pricey. objections close when he hits book.";

export interface DeadOption { title: string; epitaph: string }
export const STAY_GRAVEYARD: DeadOption[] = [
  { title: 'the 6-bed steal', epitaph: "got sniped mid-deliberation. pete: 'omg…. this one got booked… WTFFF'" },
  { title: 'the $1,900 beach condo', epitaph: 'right on the beach, zero private pool. next.' },
  { title: 'the rookie paycheck house', epitaph: "sia posted it. pete: 'HOW MUCH?!? sia is that rookie that gets his first paycheck and buys a nice ass car'" },
  { title: 'south beach townhouse', epitaph: '3 beds for 6 grown men. character-building denied.' },
  { title: 'the OG villa', epitaph: 'everyone loved it. 4 beds though. RIP to a real one.' },
];

// ---------- itinerary ----------
export interface DayItem { time: string; title: string; note: string }
export interface Day { label: string; title: string; date: string; accent: string; bg: string; items: DayItem[] }
export const DAYS: Day[] = [
  {
    label: 'THURSDAY', title: 'Wheels up', date: 'Jul 23 · leave ATL', accent: 'var(--c-coral)', bg: 'var(--c-coral-s)',
    items: [
      { time: '4:30p', title: 'Get to ATL', note: "it's ATL on a thursday. leave early or get left." },
      { time: '6:40p', title: 'ATL → FLL', note: 'jetblue. $208 a head. aisle seats for the tall ones or there will be words.' },
      { time: '~9:00p', title: 'Land + grab the whip', note: "kia's LMco rate or pete's discount, whoever's manager replies first." },
      { time: '10:00p', title: 'Check into the house', note: 'whichever one pete picked. act surprised.' },
      { time: '11:00p', title: 'Hard rock recon?', note: 'joe has been waiting his whole life. something light.' },
    ],
  },
  {
    label: 'FRIDAY', title: 'Beach & the grill', date: 'Jul 24', accent: 'var(--c-teal)', bg: 'var(--c-teal-s)',
    items: [
      { time: '10:00a', title: 'Recovery breakfast', note: 'grease. electrolytes. no regrets yet, too early.' },
      { time: '12:00p', title: 'Beach', note: "walkable if the right house won. 'lol a block away is nothing.'" },
      { time: '4:00p', title: 'Pool', note: 'unc status activates. wife beaters optional but encouraged.' },
      { time: '7:00p', title: 'Kia on the grill', note: "'gimme a pool and a grill.' dinner: solved." },
      { time: '11:00p', title: 'Night moves TBD', note: 'pitch it on the map ↓ sia is judging.' },
    ],
  },
  {
    label: 'SATURDAY', title: 'Full send (gently)', date: 'Jul 25', accent: 'var(--c-mint)', bg: 'var(--c-mint-s)',
    items: [
      { time: '11:00a', title: 'Pool + soccer ball action', note: 'a lil touch in the yard. loser does the dishes.' },
      { time: '2:00p', title: 'Find Neon?', note: "he's out there somewhere. lucas has a feeling." },
      { time: '6:00p', title: 'Dinner TBD', note: 'map ↓. funny pitches get approved faster.' },
      { time: '9:00p', title: "JOE'S CHURCH", note: "hard rock casino. tom's just watching. lucas is betting the airbnb refund." },
      { time: '2:00a', title: 'Leave the casino', note: 'this is a lie and we all know it.' },
    ],
  },
  {
    label: 'SUNDAY', title: 'The long goodbye', date: 'Jul 26 · fly home', accent: 'var(--c-gold)', bg: 'var(--c-gold-s)',
    items: [
      { time: '10:00a', title: 'Checkout', note: "find your other shoe. it's in the pool." },
      { time: '11:00a', title: 'Last beach hang', note: 'one final aggressive tan.' },
      { time: '4:00p', title: 'Return the whip + airport', note: 'gas it up or pete files a formal complaint.' },
      { time: '6:55p', title: 'Flight home ×4', note: 'sia, pete, joe, kia. jetblue back to reality.' },
      { time: '8:40p', title: 'The residency flight', note: 'lucas & tom close out the terminal like it’s a set.' },
    ],
  },
];

// ---------- weather ----------
export interface WxDay { day: string; date: string; icon: string; hi: string; lo: string; cond: string; rain: string }
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
export const PACKING = {
  title: '🧳 what to actually pack',
  body: 'SPF 30 minimum (it’s literally in the footer), one dry shirt per day because you WILL sweat through the first, a wife beater for kia, the soccer ball, and sunglasses you can afford to lose at the casino.',
};

// ---------- budget ----------
export const BUDGET_SUB = "who fronted what, so nobody's holding a grudge on the flight home. flights ($208) were every-man-for-himself, so the tab starts here.";
export const TOM_CALLOUT = {
  title: '🧾 standing debts',
  body: "tom owes the group $80 for the markers incident. his words: 'i will subsidize $80 towards abnb or dinner.' it WILL be collected.",
};
export const BUDGET_EMPTY = "nothing logged yet. the airbnb deposit is coming for one of us. probably pete.";

// ---------- home page cards ----------
export interface InfoCard { emoji: string; iconBg: string; title: string; body: ReactNode }
export const INFO_CARDS: InfoCard[] = [
  {
    emoji: '✈️', iconBg: 'var(--c-coral-s)', title: 'Flights',
    body: (
      <>
        <b style={{ color: 'var(--ink)' }}>Out:</b> thu 7/23, 6:40p ATL → FLL, jetblue. all six of us.<br />
        <b style={{ color: 'var(--ink)' }}>Back:</b> sun 7/26, 6:55p — except <b style={{ color: 'var(--c-lav)' }}>lucas &amp; tom on the 8:40</b> like it's a residency. ~$208 a head, paid.
      </>
    ),
  },
  {
    emoji: '🚗', iconBg: 'var(--c-teal-s)', title: 'The whip',
    body: (
      <>
        <span style={{ color: 'var(--c-coral)', fontWeight: 600 }}>not booked.</span> needs to seat 6. kia's <b style={{ color: 'var(--c-teal)' }}>LMco benefit</b> pending since jun 29 (his manager is 'dealing with some stress rn'). minivan $156 vs explorer $206. somebody lock in.
      </>
    ),
  },
  {
    emoji: '🏠', iconBg: 'var(--c-mint-s)', title: 'Home base',
    body: (
      <>
        fort lauderdale. which house? nobody voted — democracy is dead. <b style={{ color: 'var(--c-mint)' }}>pete's picking one that works and isn't too pricey.</b> <a href="#stay" style={{ color: 'var(--c-mint)', fontWeight: 600 }}>the final four →</a>
      </>
    ),
  },
  {
    emoji: '💸', iconBg: 'var(--c-gold-s)', title: 'The kitty',
    body: (
      <>
        current balance: <b style={{ color: 'var(--c-gold)' }}>tom's $80</b> from the markers incident. venmo situation TBD. fronting money for grown men is a mistake someone makes exactly once.
      </>
    ),
  },
];

export const FOOTER = {
  tagline: (
    <>
      built for the boys. all pitches subject to the whims, mood, and blood-alcohol level of <a href="#admin" style={{ color: 'var(--ink2)', fontWeight: 600, cursor: 'pointer' }}>management</a>. tapback energy only.
    </>
  ),
  small: 'no refunds · no crying · SPF 30 minimum',
};
