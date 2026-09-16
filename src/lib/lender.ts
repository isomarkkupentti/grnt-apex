/** GRNT lender pool vs 10-operator AMM. Model, not a term sheet. */

export type LenderInput = {
  casinos: number;
  monthlyHandleEach: number;
  peakWeeklyShare: number;
  maxSlippage: number;
  targetUtil: number;
  facility: number;
  rate: number;
  commitment: number;
  avgDrawn: number;
  lpTake: number;
};

export const LENDER_DEFAULT: LenderInput = {
  casinos: 10,
  monthlyHandleEach: 40_000_000,
  peakWeeklyShare: 0.08,
  maxSlippage: 0.02,
  targetUtil: 0.72,
  facility: 500_000_000,
  rate: 0.065,
  commitment: 0.0075,
  avgDrawn: 0.4,
  lpTake: 0.007,
};

export type Alert = { level: "ok" | "watch" | "halt"; code: string; text: string };

export function sizePool(p: LenderInput) {
  const monthlyHandle = p.casinos * p.monthlyHandleEach;
  const annualHandle = monthlyHandle * 12;
  const weeklyHandle = monthlyHandle / (365 / 7 / 12);
  const peakOneSided = weeklyHandle * p.peakWeeklyShare;
  const reserveAtImpact = p.maxSlippage > 0 ? (peakOneSided * (1 - p.maxSlippage)) / p.maxSlippage : peakOneSided;
  const poolNeed = p.targetUtil > 0 ? reserveAtImpact / p.targetUtil : reserveAtImpact;
  const gap = p.facility - poolNeed;
  const drawnAvg = p.facility * p.avgDrawn;
  const undrawnAvg = p.facility - drawnAvg;
  const interest = drawnAvg * p.rate;
  const commitFee = undrawnAvg * p.commitment;
  const annualCost = interest + commitFee;
  const lpRev = annualHandle * p.lpTake;
  const coverage = annualCost > 0 ? lpRev / annualCost : 0;
  const peakUtilIfFacility = p.facility > 0 ? reserveAtImpact / p.facility : 1;
  const impliedSlippageAtFacility =
    p.facility > 0 ? peakOneSided / (p.facility + peakOneSided) : 1;
  const durationHours = 4;
  const turnsPerYear = (365 * 24) / durationHours;
  const capitalVelocity = annualHandle / Math.max(drawnAvg, 1);

  const alerts: Alert[] = [];
  if (poolNeed > p.facility * 1.05) {
    alerts.push({
      level: "halt",
      code: "CAPACITY",
      text: `Need ${fmt(poolNeed)} vs ${fmt(p.facility)} facility. Widen spread, cut leverage, or add junior first-loss.`,
    });
  } else if (peakUtilIfFacility > 0.8) {
    alerts.push({
      level: "watch",
      code: "UTIL",
      text: `Peak inventory would use ${(peakUtilIfFacility * 100).toFixed(0)}% of the facility. Funding rate and halt must be live.`,
    });
  }
  if (coverage < 1) {
    alerts.push({
      level: "halt",
      code: "CARRY",
      text: `LP take does not cover 6.5% carry (${coverage.toFixed(2)}x). Raise skim or cut undrawn.`,
    });
  } else if (coverage < 1.3) {
    alerts.push({
      level: "watch",
      code: "CARRY",
      text: `Coverage ${coverage.toFixed(2)}x is thin after ops and first-loss.`,
    });
  }
  if (impliedSlippageAtFacility > p.maxSlippage * 1.5) {
    alerts.push({
      level: "watch",
      code: "IMPACT",
      text: `If the whole 500m sits as one book, peak impact is ${(impliedSlippageAtFacility * 100).toFixed(1)}%. Allocate per event, never one pool.`,
    });
  }
  if (p.peakWeeklyShare >= 0.12) {
    alerts.push({
      level: "watch",
      code: "CORR",
      text: "Peak share ≥12% of weekly: UFC PPV / Derby correlation. Cap per-event inventory.",
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      level: "ok",
      code: "OK",
      text: "Facility covers peak one-sided flow at target impact. Alerts stay on: skew, NAV, oracle, liquidation backlog.",
    });
  }

  return {
    monthlyHandle,
    annualHandle,
    weeklyHandle,
    peakOneSided,
    reserveAtImpact,
    poolNeed,
    gap,
    drawnAvg,
    undrawnAvg,
    interest,
    commitFee,
    annualCost,
    lpRev,
    coverage,
    peakUtilIfFacility,
    impliedSlippageAtFacility,
    capitalVelocity,
    turnsPerYear,
    alerts,
  };
}

function fmt(n: number) {
  const m = n / 1e6;
  return `${m.toFixed(0)}m`;
}

export const WATCH: { code: string; trigger: string; action: string }[] = [
  { code: "SKEW", trigger: "One side >70% of a market book", action: "Widen spread, hike funding, invite the other side" },
  { code: "UTIL", trigger: "Inventory >80% of allocated line", action: "Halt new leverage on that event" },
  { code: "NAV", trigger: "Pool NAV −5% day or −8% event", action: "Kill switch. Junior absorbs. Senior frozen" },
  { code: "LIQ", trigger: "Liquidation queue >30s or gap >2%", action: "Auto-deleverage, reject new 10x+" },
  { code: "ORACLE", trigger: "Odds lag >2s vs feed", action: "Quote only, no fill" },
  { code: "CORR", trigger: "Same-direction flow across ≥4 brands", action: "Group cap. Treat as one book" },
  { code: "TENOR", trigger: "Position open >24h (not short combat)", action: "Force funding or close — facility is short" },
];
