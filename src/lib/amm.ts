import { buyYes } from "@/lib/liquidity";

/** Dual-mode AMM (casino-wedge). Same curve; host of the vault changes. */

export type AmmMode = "A" | "B";

export const AMM_COPY: Record<
  AmmMode,
  { title: string; host: string; vault: string; tase: string; who: string }
> = {
  A: {
    title: "Mode A · GRNT-hosted pool",
    host: "GRNT lender line seeds the book. Operator is a broker.",
    vault: "Liquidity sits in the GRNT facility (fintech / crypto rails).",
    tase: "Casino tase risk 0%. Fee split only.",
    who: "Light-touch, Web3, or markets that allow third-party pooling.",
  },
  B: {
    title: "Mode B · Casino-hosted vault",
    host: "Same CPMM, inside the operator’s licensed entity.",
    vault: "Player funds never leave the casino bank / MGA vault. Facility is a hedge line.",
    tase: "Players trade the internal book. House is not the counterparty.",
    who: "MGA / UKGC / any auditor that forbids external pooling.",
  },
};

export function executeBuy(reserveA: number, reserveB: number, stake: number, spread = 0.02) {
  const r = buyYes({ qYes: reserveA, qNo: reserveB }, stake, spread);
  return {
    newReserveA: r.next.qYes,
    newReserveB: r.next.qNo,
    effectiveOdds: Number(r.odds.toFixed(3)),
    slippagePct: r.impact * 100,
    spread,
    pQuote: r.pQuote,
    skew: r.skew,
  };
}

/** Operator impact for a 10 000 monthly-active cohort, same deposits. */
export function operatorImpact(users = 10_000, deposit = 200, leverage = 3.5) {
  const deposits = users * deposit;
  const legacyVol = deposits;
  const apexVol = deposits * leverage;
  const legacyHold = 0.045;
  const apexHold = 0.165;
  const legacyGgr = legacyVol * legacyHold;
  const apexGgr = apexVol * apexHold;
  return {
    users,
    deposits,
    legacyVol,
    apexVol,
    legacyHold,
    apexHold,
    legacyGgr,
    apexGgr,
    ggrMultiple: apexGgr / legacyGgr,
    sessionLegacySec: 45,
    sessionApexMin: 14,
    churnLegacy: 0.65,
    churnApex: 0.22,
  };
}
