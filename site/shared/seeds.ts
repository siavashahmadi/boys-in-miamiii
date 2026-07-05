// Shared between the client (dev/localStorage fallback) and the api functions
// (first-run seeding). Names only, no contact info.

export type PitchStatus = 'pending' | 'approved' | 'denied';
export type CatKey = 'eats' | 'water' | 'beach' | 'night' | 'culture' | 'chaos';

export interface Pitch {
  id: string;
  title: string;
  category: CatKey;
  place: string;
  mx: number; // percent x on the stylized map, 0 = not pinned
  my: number;
  link: string;
  note: string;
  who: string[];
  requester: string;
  voters: string[];
  status: PitchStatus;
}

export interface Expense {
  id: string;
  desc: string;
  amount: number;
  payer: string;
  participants: string[];
}

export const SQUAD_NAMES = ['Sia', 'Pete', 'Joe', 'Lucas', 'Kia', 'Tom'] as const;
export type SquadName = (typeof SQUAD_NAMES)[number];

// The real plans, straight from the group chat.
export const SEED_PITCHES: Pitch[] = [
  {
    id: 'p_hardrock',
    title: "Joe's Church (Hard Rock)",
    category: 'chaos',
    place: 'Seminole Hard Rock, Hollywood',
    mx: 40, my: 52,
    link: 'https://www.seminolehardrockhollywood.com',
    note: "will there be a casino. i'm down for anything as long as i have my casino.",
    who: ['Joe', 'Pete', 'Lucas', 'Sia', 'Kia', 'Tom'],
    requester: 'Joe',
    voters: ['Joe', 'Pete', 'Lucas', 'Sia', 'Kia'],
    status: 'approved',
  },
  {
    id: 'p_drake',
    title: 'Drake in Miami',
    category: 'night',
    place: 'somewhere loud, Miami',
    mx: 48, my: 86,
    link: '',
    note: "sorry for being annoying but look at this. it's the universe giving us one last chance to listen to drake in miami.",
    who: ['Pete', 'Lucas'],
    requester: 'Pete',
    voters: ['Pete', 'Lucas', 'Sia'],
    status: 'pending',
  },
  {
    id: 'p_beach',
    title: 'Beach day',
    category: 'beach',
    place: 'Lauderdale-by-the-Sea',
    mx: 61, my: 11,
    link: '',
    note: "lol a block away is nothing. if it's that close why not.",
    who: ['Tom', 'Kia', 'Sia', 'Pete', 'Joe', 'Lucas'],
    requester: 'Tom',
    voters: ['Tom', 'Kia', 'Sia', 'Pete'],
    status: 'approved',
  },
  {
    id: 'p_grill',
    title: 'Pool + grill night',
    category: 'eats',
    place: 'the crib',
    mx: 57, my: 16,
    link: '',
    note: 'gimme a pool and a grill. something light.',
    who: ['Kia', 'Sia', 'Tom'],
    requester: 'Kia',
    voters: ['Kia', 'Sia', 'Joe', 'Tom'],
    status: 'approved',
  },
  {
    id: 'p_neon',
    title: 'Find Neon',
    category: 'chaos',
    place: 'somewhere in Miami',
    mx: 52, my: 78,
    link: '',
    note: 'we gonna see neon.',
    who: ['Lucas'],
    requester: 'Lucas',
    voters: ['Lucas', 'Sia'],
    status: 'pending',
  },
  {
    id: 'p_soccer',
    title: 'Lil soccer ball action',
    category: 'beach',
    place: 'beach or backyard',
    mx: 59, my: 13,
    link: '',
    note: 'get a lil soccer ball action going.',
    who: ['Sia', 'Kia'],
    requester: 'Sia',
    voters: ['Sia', 'Kia'],
    status: 'approved',
  },
  {
    id: 'p_sesh',
    title: 'The Backyard Summit (nightly)',
    category: 'culture',
    place: 'the backyard, casa de los uncs',
    mx: 0, my: 0,
    link: '',
    note: "something light. something botanical. quorum is sia, kia, lucas, pete. joe's annual guest appearance ends the moment he falls asleep mid-sentence. we love him.",
    who: ['Kia', 'Sia', 'Lucas', 'Pete'],
    requester: 'Kia',
    voters: ['Kia', 'Sia', 'Lucas', 'Pete'],
    status: 'approved',
  },
  {
    id: 'p_tommy',
    title: "Tommy's First Time (year 4)",
    category: 'chaos',
    place: 'the atlantic ocean (see pin)',
    mx: 0, my: 0,
    link: '',
    note: "he said 'maybe on a trip' once and we never let it go. the pin is in the ocean because that's where the odds are. this is the year. it is not the year.",
    who: ['Tom'],
    requester: 'Lucas',
    voters: ['Lucas', 'Sia', 'Kia', 'Pete', 'Joe'],
    status: 'pending',
  },
];

// Real ideas that already died in the chat, pre-denied for the graveyard.
export const SEED_GRAVEYARD: Pitch[] = [
  {
    id: 'p_hotel_scheme',
    title: "Pete's thursday casino-hotel scheme",
    category: 'chaos',
    place: 'next to the casino',
    mx: 0, my: 0,
    link: '',
    note: "2 cheap hotel rooms thursday night, nobody unpacks, luggage lives in the rental. tom: 'nah wtf too much.'",
    who: ['Pete'],
    requester: 'Pete',
    voters: ['Pete'],
    status: 'denied',
  },
  {
    id: 'p_sprinter',
    title: 'The $315 sprinter van',
    category: 'chaos',
    place: 'FLL airport',
    mx: 0, my: 0,
    link: '',
    note: "sia found it. sia also said 'start streaming on kick' to pay for it. denied by reality.",
    who: ['Sia'],
    requester: 'Sia',
    voters: ['Sia'],
    status: 'denied',
  },
];

export const ALL_SEED_PITCHES: Pitch[] = [...SEED_PITCHES, ...SEED_GRAVEYARD];

// Tracker starts empty on purpose: flights were every-man-for-himself.
export const SEED_EXPENSES: Expense[] = [];
