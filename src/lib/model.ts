/** Operator model. Assumptions are labelled; not live evidence. */

export const LEGACY_HOLD = 0.045;
export const APEX_HOLD_BASE = 0.165;
export const NGR_HAIRCUT = 0.1; // bonuses / payment / tax proxy
export const GRNT_NGR_SHARE = 0.15;
export const SAAS_PER_BRAND = 6_000;
export const REVOLUT_LOCK = 50;
export const LEGACY_CAC = 180;
export const APEX_CAC = 95;
export const REVOLUT_CAC = 55;

export type FeatureRow = {
  id: string;
  player: string;
  behaviour: string;
  casino: string;
  kpi: string;
};

export const FEATURES: FeatureRow[] = [
  {
    id: "screener",
    player: "EV screener, true vs market, Kelly bar",
    behaviour: "Builds a book before staking. Stays on the card.",
    casino: "Session 45 s → 12–18 min",
    kpi: "Session / touches",
  },
  {
    id: "leverage",
    player: "1x–20x isolated margin + liquidation band",
    behaviour: "Same deposit, more notional. Ruin is capped to margin.",
    casino: "Volume velocity ~3.5x on unchanged deposits",
    kpi: "Handle / GGR",
  },
  {
    id: "heatmap",
    player: "Live risk band, open position not a coupon",
    behaviour: "Hedges and flash stakes during the fight.",
    casino: "More tx per event, less bounce after one slip",
    kpi: "ARPU",
  },
  {
    id: "copy",
    player: "1-click copy of verified paper books",
    behaviour: "Follows a quant instead of a bonus banner.",
    casino: "Organic invite loop. Lower CPA dependence",
    kpi: "CAC / K-factor",
  },
  {
    id: "route",
    player: "Smart route to best combined price",
    behaviour: "One CTA after the book is built.",
    casino: "Inbound stake on the operator book (Phase 1 CPA / Phase 2 NGR)",
    kpi: "Conversion",
  },
  {
    id: "revolut",
    player: "Revolut Metal: 50 € locked margin + Pay N Play",
    behaviour: "Opens a leveraged seat without a form.",
    casino: "Premium cohort, instant KYC, funded wallet",
    kpi: "FTD / CAC",
  },
  {
    id: "wedge",
    player: "Same 20x UI in Mode A or B",
    behaviour: "No product change when licence rules bite.",
    casino: "Tase 0%. Host of the pool is a config flag",
    kpi: "Variance / capital",
  },
];

export type ScenarioId = "bear" | "base" | "bull";

export const PRESETS: Record<
  ScenarioId,
  { label: string; mau: number; deposit: number; leverage: number; hold: number; revolutShare: number; brands: number }
> = {
  bear: { label: "Bear", mau: 3_000, deposit: 120, leverage: 2, hold: 0.1, revolutShare: 0.08, brands: 1 },
  base: { label: "Base", mau: 10_000, deposit: 200, leverage: 3.5, hold: 0.165, revolutShare: 0.18, brands: 5 },
  bull: { label: "Bull", mau: 40_000, deposit: 280, leverage: 5, hold: 0.18, revolutShare: 0.28, brands: 12 },
};

export type ModelInput = {
  mau: number;
  deposit: number;
  leverage: number;
  hold: number;
  revolutShare: number;
  brands: number;
};

export function runModel(p: ModelInput) {
  const deposits = p.mau * p.deposit;
  const revolutUsers = Math.round(p.mau * p.revolutShare);
  const revolutFloat = revolutUsers * REVOLUT_LOCK;
  const legacyVol = deposits;
  const apexVol = deposits * p.leverage;
  const legacyGgr = legacyVol * LEGACY_HOLD;
  const apexGgr = apexVol * p.hold;
  const legacyNgr = legacyGgr * (1 - NGR_HAIRCUT);
  const apexNgr = apexGgr * (1 - NGR_HAIRCUT);
  const casinoKeep = apexNgr * (1 - GRNT_NGR_SHARE);
  const grntNgr = apexNgr * GRNT_NGR_SHARE;
  const saas = p.brands * SAAS_PER_BRAND;
  const grntMonth = saas + grntNgr;
  const legacyCacCost = p.mau * LEGACY_CAC;
  const apexCacCost = revolutUsers * REVOLUT_CAC + (p.mau - revolutUsers) * APEX_CAC;
  const ltvLegacy = 1;
  const ltvApex = 3.8;
  return {
    ...p,
    deposits,
    revolutUsers,
    revolutFloat,
    legacyVol,
    apexVol,
    legacyGgr,
    apexGgr,
    ggrMultiple: legacyGgr > 0 ? apexGgr / legacyGgr : 0,
    legacyNgr,
    apexNgr,
    casinoKeep,
    grntNgr,
    saas,
    grntMonth,
    grntArr: grntMonth * 12,
    casinoNetLift: casinoKeep - legacyNgr * 0.85,
    legacyCacCost,
    apexCacCost,
    cacSaved: legacyCacCost - apexCacCost,
    ltvLegacy,
    ltvApex,
    sessionLegacy: 45,
    sessionApex: 14,
    churnLegacy: 0.65,
    churnApex: 0.22,
  };
}
