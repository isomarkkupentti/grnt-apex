/** vAMM vs real CPMM vs house. Combat binary is a worse vAMM than a perp. */

export type Venue = "house" | "vamm" | "cpmm" | "apex";

export const VENUES: { id: Venue; name: string; oneLiner: string }[] = [
  { id: "house", name: "House book", oneLiner: "Casino is the counterparty. Tase 100%." },
  { id: "vamm", name: "Pure vAMM", oneLiner: "k is virtual. Vault is real. No natural other side. Perp v1 died here." },
  { id: "cpmm", name: "Real CPMM", oneLiner: "Complete set: $1 YES + $1 NO = $1. Solvent if cash = k." },
  { id: "apex", name: "APEX bounded", oneLiner: "CPMM cash layer + isolated lev. OI cap so jump ≤ junior. Not a perp." },
];

export const RISKS: {
  id: string;
  name: string;
  house: string;
  vamm: string;
  cpmm: string;
  apex: string;
}[] = [
  {
    id: "counterparty",
    name: "Counterparty",
    house: "The house",
    vamm: "Insurance fund / protocol. Open interest need not net",
    cpmm: "The other outcome token in the pool",
    apex: "Cash book nets. Lev OI capped to junior",
  },
  {
    id: "depth",
    name: "Depth",
    house: "Limit / liability cap",
    vamm: "Fake. k can exceed vault. Looks liquid, is naked",
    cpmm: "Real. Slippage = cash moved",
    apex: "Event line L ≤ 2% of 500m and L ≤ vault",
  },
  {
    id: "funding",
    name: "Funding",
    house: "None",
    vamm: "Meant to pull skew. Needs hours–days and an other side",
    cpmm: "Not required for solvency",
    apex: "Do not use 8h funding to save a 15 min fight",
  },
  {
    id: "settle",
    name: "Settlement",
    house: "Binary, house pays",
    vamm: "Mark path; cannot unwind without returning to pin",
    cpmm: "YES=1 / NO=0 from cash already in k",
    apex: "Binary official result. Cash layer redeems. Lev ADL if needed",
  },
  {
    id: "oneside",
    name: "One-sided flow",
    house: "Liability spike. Typical sportsbook pain",
    vamm: "Core failure. Fund pays winners. Perp v1 / NFTPerp",
    cpmm: "Price moves, LPs hold inventory, still backed",
    apex: "Spread + halt + group cap. Same UFC = one book",
  },
  {
    id: "oracle",
    name: "Oracle / live",
    house: "Own traders",
    vamm: "Mark = vAMM ⊕ oracle. Lag → bad liquidations",
    cpmm: "Pool is the price. Oracle only to seed",
    apex: "Halt quotes if lag >2s. No fill on stale",
  },
  {
    id: "liq",
    name: "Liquidation",
    house: "Player just loses the stake",
    vamm: "Cascade. Keepers late → bad debt. Luna / CREAM",
    cpmm: "No leverage in the base pool",
    apex: "Isolated only. Queue >30s or gap >2% → reject 10x+",
  },
  {
    id: "backstop",
    name: "Backstop",
    house: "Casino equity",
    vamm: "Insurance, then print token (PERP mint)",
    cpmm: "None if complete-set held",
    apex: "Junior first-loss. Senior freeze. No token to mint",
  },
];

/** Worst-case hole if everyone is YES and the favourite wins. */
export function vammHole(p: {
  notional: number;
  pYes: number;
  lev: number;
  vault: number;
  junior: number;
}) {
  const margin = p.notional / Math.max(p.lev, 1);
  const winPayout = p.notional * (1 - p.pYes);
  const hole = Math.max(0, winPayout);
  const vaultLeft = p.vault - margin;
  const uncovered = Math.max(0, hole - Math.max(0, vaultLeft) - p.junior);
  return { margin, winPayout, hole, uncovered, covered: uncovered <= 0 };
}

export const RULES = [
  "Never set virtual L above the vault on that line.",
  "Never use funding as the solvency tool. Combat is over before the 8h tick.",
  "Net the ten brands. Siloed vAMMs multiply the one-sided hole.",
  "Cap OI so favourite-win payout ≤ junior. Senior does not pay winners.",
  "Complete-set cash for unlevered flow. Leverage is bounded vAMM, not free k.",
];
