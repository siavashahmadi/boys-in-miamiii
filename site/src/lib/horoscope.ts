// Daily degen horoscope: deterministic per ET day + name, so every device
// shows the same six lines with zero server involvement.

const hash = (s: string): number => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0;
  return h;
};

// en-CA locale gives YYYY-MM-DD, which is exactly the seed shape we want.
export const etDateStr = (d = new Date()): string =>
  d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const GENERIC = [
  'the cards owe you nothing and will prove it.',
  'a small win is coming. you will immediately give it back.',
  'today is a 17. do not hit. you will hit.',
  'mercury is in retrograde and so is your bankroll.',
  'someone will say one more hand. it will not be one more hand.',
  'the shoe is warm. this means nothing. play anyway.',
  'an unexpected push will feel like a win. take it.',
  'your lucky number is whatever the dealer is showing.',
  'hydrate before you donate.',
  'the group chat will humble you before noon.',
  'a marker is not a personality trait. today it might be.',
  'trust your gut. not with money though.',
];

const PERSONAL: Record<string, string[]> = {
  Joe: [
    'the first era ended. the second era is going worse. a third era is possible.',
    'you will look at the marker button. the marker button will look back.',
    'the memorial plaque is watching you play. make it proud or make it longer.',
    'your church is 30 minutes from the crib. pace yourself accordingly.',
  ],
  Pete: [
    'the +$0 doctrine was abandoned 19 markers ago. today it whispers again.',
    'the buttons no longer move. the misclick era is over. no excuses left.',
    'a historic comeback requires a historic hole. congratulations on step one.',
    'bet 500. you were going to anyway.',
  ],
  Tom: [
    'something is coming. it is pourable. do not look up.',
    'the registry grows. your umbrella budget should too.',
    'you chose this sentence. the appeal was denied.',
    'good wifi finds you wherever you go. so will they.',
  ],
  Kia: [
    'the anchovies are marinating. tommy knows fear.',
    'the grill respects you. the cards do not.',
    'someone will ask for a hookup today. your manager is still stressed.',
    'pool first. everything else is negotiable.',
  ],
  Lucas: [
    'the playlist is immaculate. the bankroll is not.',
    'you called it a bitch ass game. the game heard you.',
    'neon is out there. so is your money. one of them can be found.',
    'the residency flight boards at 8:40. the terminal is your stage.',
  ],
  Sia: [
    'you built the casino. the casino does not know who you are.',
    'the house always wins. you are not the house. you just work here.',
    'you will say you are testing a feature. you will be down $500.',
    'somewhere a ticker scrolls your name. keep it positive.',
  ],
};

export function horoscopeFor(name: string, dateStr: string): string {
  const pool = [...(PERSONAL[name] ?? []), ...GENERIC];
  return pool[hash(`${dateStr}:${name}`) % pool.length];
}
