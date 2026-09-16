import { buyYes, mid, seedBook, sizeForImpact } from "@/lib/liquidity";

/** Kyle λ at seed for a YES buy: dp/da = 2(1−p)/L. Exact fill uses the CPMM, not λ. */
export function ammLambda(L: number, p: number) {
  return (2 * (1 - p)) / Math.max(L, 1);
}

/** Square-root law (Almgren): impact ≈ Y · σ · √(Q / ADV). Return, not bps. */
export function sqrtImpact(Q: number, adv: number, sigma: number, Y = 0.5) {
  if (adv <= 0 || Q <= 0) return 0;
  return Y * sigma * Math.sqrt(Q / adv);
}

export function compareClip(p: {
  L: number;
  pYes: number;
  clip: number;
  spread: number;
  adv: number;
  sigma: number;
  Y: number;
}) {
  const book = seedBook(p.L, p.pYes);
  const fill = buyYes(book, p.clip, p.spread);
  const m0 = mid(book);
  const lambda = ammLambda(p.L, p.pYes);
  const linearMid = lambda * p.clip;
  const sqrt = sqrtImpact(p.clip, p.adv, p.sigma, p.Y);
  const depth2 = sizeForImpact(book, 0.02);
  const equity2 = impactToClip(0.02, p.adv, p.sigma, p.Y);
  return {
    pExec: fill.pExec,
    ammFill: fill.impact,
    ammMid: fill.after.pYes - m0.pYes,
    ammMidPct: m0.pYes > 0 ? fill.after.pYes / m0.pYes - 1 : 0,
    lambda,
    linearMid,
    sqrt,
    depth2,
    equity2,
    ratio: sqrt > 0 ? fill.impact / sqrt : Infinity,
  };
}

function impactToClip(i: number, adv: number, sigma: number, Y: number) {
  if (Y <= 0 || sigma <= 0) return 0;
  const x = i / (Y * sigma);
  return adv * x * x;
}

/** Side-by-side of the actual formulae a desk uses. */
export const FORMULAS: { item: string; xchg: string; amm: string }[] = [
  { item: "Mid", xchg: "(bid + ask) / 2, last, or index", amm: "p = q_no / (q_yes + q_no)" },
  { item: "Kyle λ", xchg: "dP/dQ estimated from flow. Unstable", amm: "λ = 2(1−p)/L at seed. Public, state-dependent" },
  { item: "Impact", xchg: "I ≈ Y · σ · √(Q / ADV)  (Almgren)", amm: "p_exec = a / YES_out. Closed form, then convex" },
  { item: "Depth", xchg: "Shares inside 1 / 5 / 10 bps of mid", amm: "a(i) = q_no′ − q_no, p′ = p(1+i)" },
  { item: "VWAP", xchg: "Σ P_t Q_t / Σ Q_t vs the tape", amm: "The curve is the tape. No hidden size" },
  { item: "Reservation", xchg: "Avellaneda: r = s − q γ σ² τ", amm: "s = s0 + κ|skew|. Same job, no time-to-close" },
  { item: "Spread", xchg: "Quoted + maker rebate", amm: "Base 2% + inventory. Not a tick grid" },
  { item: "Margin", xchg: "SPAN / portfolio. Cross-net, VM daily", amm: "Isolated m = N / lev. No SPAN" },
  { item: "Clearing", xchg: "CCP novation, IM + VM", amm: "Complete set YES+NO = €1. Self-clears" },
  { item: "Close", xchg: "Auction, then T+1 / T+2", amm: "Binary 0/1 at the bell. No unwind to pin" },
];

export const VENUES = [
  {
    id: "omx",
    name: "Equity CLOB",
    one: "Nasdaq / OMX. Continuous book, CCP, T+1.",
  },
  {
    id: "betfair",
    name: "Betting exchange",
    one: "Betfair back/lay. Matching, not a curve. Commission on net win.",
  },
  {
    id: "house",
    name: "Sportsbook",
    one: "House is the counterparty. Limits, not slippage. Overround is the edge.",
  },
  {
    id: "apex",
    name: "APEX CPMM",
    one: "Bonding curve + isolated lev. GRNT nets ten brands into one book.",
  },
] as const;

export const VENUE_ROWS: { item: string; omx: string; betfair: string; house: string; apex: string }[] = [
  {
    item: "Who is the book",
    omx: "Market makers + the crowd",
    betfair: "Back vs lay. You need the other side",
    house: "The operator",
    apex: "The pool. House is not the taker",
  },
  {
    item: "Price",
    omx: "Best bid/ask",
    betfair: "Best back/lay",
    house: "Posted odds + overround",
    apex: "p from k, plus s",
  },
  {
    item: "A large clip",
    omx: "Walks the book. Temporary + permanent impact",
    betfair: "Walks unmatched lays. May rest",
    house: "Limit or reject. Price does not move",
    apex: "Always fills. Price must move. Known a priori",
  },
  {
    item: "Edge",
    omx: "Spread − adverse selection",
    betfair: "2–5% commission",
    house: "Hold ~4.5–8%",
    apex: "Spread + IL + 70 bps LP skim",
  },
  {
    item: "Capital",
    omx: "MM inventory + CCP IM",
    betfair: "Liability on lays",
    house: "Full tase on the book",
    apex: "Line L ≤ vault. Junior eats jump",
  },
  {
    item: "Leverage",
    omx: "Broker margin / futures",
    betfair: "None in the match",
    house: "None (stake is max loss)",
    apex: "Isolated 1–20x. Bounded vAMM",
  },
  {
    item: "Clock",
    omx: "Hours, then T+1",
    betfair: "Until the event, in-play matched",
    house: "Until the event",
    apex: "Minutes. Funding cannot save it",
  },
];

export const EX_DEFAULT = {
  L: 10_000_000,
  pYes: 0.62,
  clip: 1_250_000,
  spread: 0.02,
  adv: 80_000_000,
  sigma: 0.02,
  Y: 0.5,
};
