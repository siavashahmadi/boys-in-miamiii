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
  specs: '4 bedrooms · 7 beds · 3 baths · ★4.85',
  url: 'https://www.airbnb.com/rooms/613636449757891426',
  blurb:
    "home base. tucked in fort lauderdale, the quieter stretch up by lauderdale-by-the-sea, old-florida low-rise, flip-flops-and-a-tee kind of block, beach a short hop away. heated pool for the unc lifestyle, a pool table for the 2am tournaments nobody remembers, and three full bathrooms so nobody's fighting for the shower before the casino. we paid a little extra for that third bathroom and we'd do it again. the backyard hosts the nightly summit: four regulars, joe once a year, and tommy on lookout duty until further notice.",
  amenities: [
    { emoji: '🏊', label: 'heated pool' },
    { emoji: '🎱', label: 'pool table' },
    { emoji: '🚿', label: '3 full baths' },
    { emoji: '🛏️', label: '7 beds' },
    { emoji: '🎰', label: '~30 min to the casino' },
    { emoji: '🏖️', label: 'near the beach' },
    { emoji: '🌿', label: 'summit-ready backyard' },
  ],
  mapQuery: 'Fort Lauderdale, FL',
  lat: 26.175, // approx (matches "the crib" on the map tab) until we have the street address
  lng: -80.11,
};
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
  p_grill: { lat: 26.175, lng: -80.11 },       // the crib, Fort Lauderdale
  p_hardrock: { lat: 26.0512, lng: -80.2103 }, // Seminole Hard Rock, Hollywood
  p_neon: { lat: 25.801, lng: -80.199 },       // Wynwood, Miami (find neon lol)
  p_drake: { lat: 25.7814, lng: -80.187 },     // downtown Miami (Kaseya Center)
  p_sesh: { lat: 26.1757, lng: -80.1093 },     // the backyard, casa de los uncs
  p_tommy: { lat: 26.05, lng: -80.02 },        // the middle of the atlantic, where tommy's odds live
};

// ---------- itinerary ----------
export interface DayItem { time: string; title: string; note: string }
export interface Day { label: string; title: string; date: string; accent: string; bg: string; items: DayItem[] }
export const DAYS: Day[] = [
  {
    label: 'THURSDAY', title: 'Wheels up', date: 'Jul 23 · leave ATL', accent: 'var(--c-coral)', bg: 'var(--c-coral-s)',
    items: [
      { time: '4:30p', title: 'Get to ATL', note: "it's ATL on a thursday. leave early or get left." },
      { time: '6:40p', title: 'ATL → FLL', note: 'jetblue. aisle seats for the tall ones or there will be words.' },
      { time: '~9:00p', title: 'Land + grab the whip', note: "sia's working the LMco rate at the rental counter. still gotta actually book it." },
      { time: '10:00p', title: 'Check into Casa de los Uncs', note: 'heated pool, pool table, three bathrooms. we made it.' },
      { time: '11:00p', title: 'Hard rock recon?', note: 'joe has been waiting his whole life. something light.' },
      { time: '1:00a', title: 'Backyard summit, session one', note: "quorum convenes: sia, kia, lucas, pete. joe's annual invite stands. tom is welcome to watch and judge." },
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
        <b style={{ color: 'var(--ink)' }}>Out:</b> thu 7/23, 6:40p ATL → FLL, jetblue. all six of us.<br />
        <b style={{ color: 'var(--ink)' }}>Back:</b> sun 7/26, 6:55p. <b style={{ color: 'var(--c-lav)' }}>lucas &amp; tom on the 8:40</b> like it's a residency. everyone's booked.
      </>
    ),
  },
  {
    emoji: '🚗', iconBg: 'var(--c-teal-s)', title: 'The whip',
    body: (
      <>
        <span style={{ color: 'var(--c-coral)', fontWeight: 600 }}>not booked yet.</span> needs to seat 6. sia's got the <b style={{ color: 'var(--c-teal)' }}>LMco rate</b>. kia was gonna ask his manager for a hookup but she's slammed rn, so that's on hold. minivan ~$156 vs explorer ~$206. someone lock it in.
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
  ],
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
    'the hall of lore is open below',
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

// ---------- the hall of lore ----------
export interface LoreExhibit { no: string; title: string; quote: string; attribution: string; note: string }
export const LORE_META = {
  title: 'The hall of lore',
  sub: 'a museum of things we cannot take back.',
  warning: 'please do not touch the exhibits.',
};
export const LORE: LoreExhibit[] = [
  {
    no: '001', title: 'the first era',
    quote: '-$15,500 in 120 hands. fifteen markers deep.',
    attribution: 'joe · jul 10, 2026',
    note: 'he thought the goal was to lose the most. the table believed in him. reset out of mercy.',
  },
  {
    no: '002', title: 'the confession',
    quote: 'I thought it was whoever could lose the most money',
    attribution: 'joe · jul 10, 2026',
    note: 'spoken minutes after his downfall. a new house rule was carved that same night, for one specific person.',
  },
  {
    no: '003', title: 'the market maker incident',
    quote: 'locked the low fare. the price rose $124 for everyone after.',
    attribution: 'tom · booking week',
    note: 'his $80 penance lives in the group pool to this day. jet skis pending.',
  },
  {
    no: '004', title: 'untitled (criticism)',
    quote: 'Bitch ass game',
    attribution: 'lucas · jul 12, 2026',
    note: 'minimalist. devastating. he kept playing.',
  },
  {
    no: '005', title: 'the anvil escalation',
    quote: "this went from pouring something to Joe dropping an anvil on Tommy's head",
    attribution: 'pete · jul 12, 2026',
    note: 'the sentence allowed one poured item each. the definition of pour did not survive the afternoon.',
  },
  {
    no: '006', title: 'the +$0 doctrine',
    quote: "I'm gonna win with +$0 😈",
    attribution: 'pete · jul 10, 2026',
    note: 'a beautiful theory. nineteen markers later it remains a theory.',
  },
  {
    no: '007', title: "tommy's first time (year 4)",
    quote: 'maybe on a trip',
    attribution: 'tommy · a simpler time',
    note: 'the pin is in the ocean because that is where the odds live. this is the year. it is not the year.',
  },
  {
    no: '008', title: 'the h&m playlist affair',
    quote: "I've heard all these songs at H&M",
    attribution: 'pete · jul 10, 2026',
    note: 'the MIA playlist has never recovered. zara declined to comment.',
  },
  {
    no: '009', title: 'the second era',
    quote: 'records are made to be broken.',
    attribution: 'joe · ongoing',
    note: 'the first era took a week. the second took two days. historians are concerned. the table is thrilled.',
  },
];

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
