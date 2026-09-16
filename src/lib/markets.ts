export type Market = {
  id: string;
  fighterA: string;
  fighterB: string;
  weightClass: string;
  market: string;
  startLabel: string;
  books: { name: string; odds: number; affiliate: string }[];
  trueProb: number;
};

export const MARKETS: Market[] = [
  {
    id: "u1",
    fighterA: "Islam Makhachev",
    fighterB: "Arman Tsarukyan",
    weightClass: "Lightweight",
    market: "Makhachev by decision",
    startLabel: "Main · Sat 22:00",
    books: [
      { name: "Unibet", odds: 2.15, affiliate: "https://www.unibet.com" },
      { name: "Pinnacle", odds: 2.08, affiliate: "https://www.pinnacle.com" },
      { name: "Bet365", odds: 2.1, affiliate: "https://www.bet365.com" },
    ],
    trueProb: 0.51,
  },
  {
    id: "u2",
    fighterA: "Alex Pereira",
    fighterB: "Khalil Rountree",
    weightClass: "Light Heavyweight",
    market: "Under 2.5 rounds",
    startLabel: "Co-main · Sat 21:10",
    books: [
      { name: "Unibet", odds: 1.72, affiliate: "https://www.unibet.com" },
      { name: "Pinnacle", odds: 1.78, affiliate: "https://www.pinnacle.com" },
      { name: "Stake", odds: 1.74, affiliate: "https://stake.com" },
    ],
    trueProb: 0.64,
  },
  {
    id: "u3",
    fighterA: "Ilia Topuria",
    fighterB: "Max Holloway",
    weightClass: "Featherweight",
    market: "Topuria KO / TKO",
    startLabel: "Main · next card",
    books: [
      { name: "Unibet", odds: 2.45, affiliate: "https://www.unibet.com" },
      { name: "Pinnacle", odds: 2.38, affiliate: "https://www.pinnacle.com" },
      { name: "Bet365", odds: 2.4, affiliate: "https://www.bet365.com" },
    ],
    trueProb: 0.46,
  },
  {
    id: "u4",
    fighterA: "Zhang Weili",
    fighterB: "Tatiana Suarez",
    weightClass: "Strawweight",
    market: "Goes the distance",
    startLabel: "Prelims · Sat 19:30",
    books: [
      { name: "Unibet", odds: 1.91, affiliate: "https://www.unibet.com" },
      { name: "Pinnacle", odds: 1.95, affiliate: "https://www.pinnacle.com" },
      { name: "Bet365", odds: 1.88, affiliate: "https://www.bet365.com" },
    ],
    trueProb: 0.58,
  },
  {
    id: "u5",
    fighterA: "Dricus du Plessis",
    fighterB: "Khamzat Chimaev",
    weightClass: "Middleweight",
    market: "Chimaev inside distance",
    startLabel: "Main · next card",
    books: [
      { name: "Unibet", odds: 2.05, affiliate: "https://www.unibet.com" },
      { name: "Pinnacle", odds: 2.12, affiliate: "https://www.pinnacle.com" },
      { name: "Stake", odds: 2.08, affiliate: "https://stake.com" },
    ],
    trueProb: 0.53,
  },
];

export function bestBook(m: Market) {
  return [...m.books].sort((a, b) => b.odds - a.odds)[0];
}

export function avgOdds(m: Market) {
  return m.books.reduce((s, b) => s + b.odds, 0) / m.books.length;
}
