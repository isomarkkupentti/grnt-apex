/** Pay N Play / Open Banking rails. Figures as of 2026 public operator briefings — not quotes. */

export type PnpKind = "pnp" | "a2a" | "wallet" | "psp" | "partner";

export type Rail = {
  id: string;
  name: string;
  kind: PnpKind;
  kindLabel: string;
  fit: "primary" | "alt" | "stack" | "partner";
  markets: string;
  banks: string;
  kyc: string;
  inSpeed: string;
  outSpeed: string;
  fee: string;
  contract: string;
  note: string;
  apex: string;
};

export const RAILS: Rail[] = [
  {
    id: "trustly",
    name: "Trustly",
    kind: "pnp",
    kindLabel: "Pay N Play rail",
    fit: "primary",
    markets: "30+ EU. Invented PnP (2016, Ninja). Default on Flutter, Kindred, Entain, bet365 EU.",
    banks: "6 300+ EU / 12 000+ global. FI majors + Revolut as a bank option.",
    kyc: "Bank login / BankID creates the casino file. Pure or hybrid PnP.",
    inSpeed: "< 20 s first session. NextGen target < 10 s.",
    outSpeed: "Seconds–minutes. Operator AML still gates large cash-out.",
    fee: "About 0–1.2% deposit. Player 0%.",
    contract: "High bar: ~$300k/mo, 12 months. Scale, not a test.",
    note: "Trustly quotes 1.7x deposit volume vs form signup. SE/FI: only licensed operators since Spelinspektionen lock.",
    apex: "Do not replace. Phase 1 FTD rides the operator’s Trustly if they already have it.",
  },
  {
    id: "zimpler",
    name: "Zimpler GO",
    kind: "pnp",
    kindLabel: "Pay N Play rail",
    fit: "alt",
    markets: "SE, FI, DE, Baltics, BR Pix. TrueLayer closed the buy March 2026.",
    banks: "Nordic majors. FI: bank + Mobiilivarmenne.",
    kyc: "Same one-step as Trustly. GO provisions the account from bank data.",
    inSpeed: "20–40 s mobile.",
    outSpeed: "Minutes–1 h typical.",
    fee: "About 0.6–1.1%. Player 0%.",
    contract: "Easier mid-market than Trustly. Now a TrueLayer iGaming brand.",
    note: "User-side delta vs Trustly is small in FI. TrueLayer stack is the UK/EU scale path.",
    apex: "Second PnP if the CPO is already on TrueLayer or wants a Trustly alternative.",
  },
  {
    id: "brite",
    name: "Brite Play",
    kind: "pnp",
    kindLabel: "Pay N Play rail",
    fit: "alt",
    markets: "~27 EU. No US.",
    banks: "3 800+.",
    kyc: "Brite Play: Pure (only rail) or alongside others.",
    inSpeed: "Instant A2A.",
    outSpeed: "Quoted 4 s median. Often the fastest cash-out in Nordic tests.",
    fee: "About 0.5–1.5% in / 0.5% out. No setup, no reserve.",
    contract: "~$200k/mo, 6 months. Lowest test bar of the three.",
    note: "Use as a second A2A to pressure Trustly pricing. Smaller casino footprint.",
    apex: "Pricing lever. Not the first PnP unless the operator is mid-market and new to A2A.",
  },
  {
    id: "truelayer",
    name: "TrueLayer",
    kind: "a2a",
    kindLabel: "Pay by Bank infra",
    fit: "stack",
    markets: "UK + EU. Zimpler is the Nordic iGaming face.",
    banks: "UK Open Banking + Zimpler banks.",
    kyc: "Pay by Bank is payment. PnP identity is Zimpler GO, not the raw API.",
    inSpeed: "Instant. bet365 made Pay by Bank the recommended UK deposit.",
    outSpeed: "Instant rails.",
    fee: "Infra pricing. Negotiate with volume.",
    contract: "Platform, not a boutique iGaming PSP.",
    note: "One stack: TrueLayer UK + Zimpler Nordics after the 2026 close.",
    apex: "Relevant if the operator’s UK book is already TrueLayer.",
  },
  {
    id: "nuvei",
    name: "Nuvei",
    kind: "psp",
    kindLabel: "Full PSP",
    fit: "stack",
    markets: "US + EU + LATAM. DraftKings / FanDuel / BetMGM acquiring.",
    banks: "720+ methods. Open banking is one SKU, not the product.",
    kyc: "Not Pay N Play. Cards, APM, payouts, risk.",
    inSpeed: "Card / APM.",
    outSpeed: "Real-time payouts where licensed.",
    fee: "About 1.5–3.5% + rolling reserve typical.",
    contract: "Enterprise. Does not replace a Nordic PnP rail.",
    note: "Right when the CPO needs one contract for cards + crypto + US. Wrong as a Trustly substitute in FI.",
    apex: "Keep for cards. APEX still wants a PnP or Revolut seat for the first book.",
  },
  {
    id: "swish",
    name: "Swish",
    kind: "a2a",
    kindLabel: "SE instant rail",
    fit: "alt",
    markets: "Sweden licensed only.",
    banks: "Swedish banks. Not FI/EU PnP.",
    kyc: "BankID. On SE-licensed sites it behaves like instant cash, not full EU PnP.",
    inSpeed: "Seconds.",
    outSpeed: "Fastest in SE tests (~2 min avg).",
    fee: "Bank scheme. Operator-side varies.",
    contract: "Via Swedish acquiring / bank.",
    note: "Mandatory flavour on Spelinspektionen sites. Useless as the APEX EU story.",
    apex: "Ignore unless the brand is SE-local.",
  },
  {
    id: "viljo",
    name: "Viljo / Trumo",
    kind: "pnp",
    kindLabel: "FI challenger",
    fit: "alt",
    markets: "Finland-heavy, few casinos.",
    banks: "~9 FI banks.",
    kyc: "PnP-style bank login.",
    inSpeed: "Seconds.",
    outSpeed: "Minutes (operator-dependent).",
    fee: "Challenger. Not published at Trustly scale.",
    contract: "Small footprint (Viljo 2025, Trumo ~2019).",
    note: "Do not build APEX on a 5–10 casino rail.",
    apex: "Out. Coverage risk.",
  },
  {
    id: "revolut",
    name: "Revolut Metal",
    kind: "partner",
    kindLabel: "Bank + wallet + cohort",
    fit: "partner",
    markets: "EEA + UK. Player already banked.",
    banks: "Revolut is a bank inside Trustly/TrueLayer lists and a wallet (Revolut Pay).",
    kyc: "Pay N Play it is not. Open Banking / Pay N Play-style seat: Metal KYC reused, 50 € locked margin.",
    inSpeed: "Instant on/off-ramp to Revolut balance.",
    outSpeed: "Instant to the same balance. Needed for leveraged round-trips.",
    fee: "Interchange / FX on rails. Not a 1% PSP take on GGR.",
    contract: "Partnership, not a cashier plugin. Operator still owns the licence file.",
    note: "Two different products: (1) Revolut as a bank in Trustly — already there. (2) Metal hook for APEX — this is the GRNT deal.",
    apex: "Phase 2 on-ramp for leverage users. Never a Trustly replacement.",
  },
];

export const PNP_PICK = {
  ifHasTrustly: "Keep Trustly for FTD. APEX widget on top. Revolut Metal as a second door for the 21–35 leverage cohort.",
  ifNew: "First rail = Trustly for coverage, or Brite if the volume floor is the blocker. Do not start on Viljo/Trumo.",
  never: "Do not sell Revolut as Pay N Play. Do not pull Nuvei as the Nordic identity rail.",
};
