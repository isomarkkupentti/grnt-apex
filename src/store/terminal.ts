import { create } from "zustand";
import { MARKETS, type Market, bestBook } from "@/lib/markets";
import { expectedValue, fractionalKelly, liquidationOdds, requiredMargin } from "@/lib/quant";
import type { AmmMode } from "@/lib/amm";


export type Position = {
  id: string;
  marketId: string;
  label: string;
  odds: number;
  stake: number;
  leverage: number;
  margin: number;
  liq: number;
  status: "open" | "closed";
  pnl: number;
};

export type CopyTick = {
  id: string;
  handle: string;
  roi: number;
  text: string;
  leverage: number;
  at: number;
};

type State = {
  tab: "deck" | "terminal" | "wedge" | "matrix" | "roadmap" | "scenario" | "pnp" | "lender";
  setTab: (t: State["tab"]) => void;
  balance: number;
  pnlDay: number;
  selectedId: string | null;
  select: (id: string | null) => void;
  stake: number;
  leverage: number;
  setStake: (n: number) => void;
  setLeverage: (n: number) => void;
  positions: Position[];
  openPosition: () => void;
  closePosition: (id: string) => void;
  ammMode: AmmMode;
  setAmmMode: (m: AmmMode) => void;
  feed: CopyTick[];
  pushFeed: (t: CopyTick) => void;
};

export function marketStats(m: Market) {
  const book = bestBook(m);
  const ev = expectedValue(m.trueProb, book.odds);
  const kelly = fractionalKelly(m.trueProb, book.odds);
  return { book, ev, kelly, hot: ev > 0.05 };
}

export const useTerminal = create<State>()((set, get) => ({
  tab: "deck",
  setTab: (tab) => set({ tab }),
  balance: 10_000,
  pnlDay: 0,
  selectedId: MARKETS[1]?.id ?? null,
  select: (selectedId) => set({ selectedId }),
  stake: 250,
  leverage: 5,
  setStake: (stake) => set({ stake: Math.max(10, stake) }),
  setLeverage: (leverage) => set({ leverage: Math.min(20, Math.max(1, leverage)) }),
  positions: [],
  openPosition: () => {
    const { selectedId, stake, leverage, balance } = get();
    const m = MARKETS.find((x) => x.id === selectedId);
    if (!m) return;
    const { book } = marketStats(m);
    const margin = requiredMargin(stake, leverage);
    if (margin > balance) return;
    const pos: Position = {
      id: `${Date.now()}`,
      marketId: m.id,
      label: `${m.fighterA} / ${m.market}`,
      odds: book.odds,
      stake,
      leverage,
      margin,
      liq: liquidationOdds(book.odds, leverage),
      status: "open",
      pnl: 0,
    };
    set({
      positions: [pos, ...get().positions],
      balance: Number((balance - margin).toFixed(2)),
    });
  },
  closePosition: (id) => {
    const pos = get().positions.find((p) => p.id === id);
    if (!pos || pos.status !== "open") return;
    const win = Math.random() > 0.45;
    const settle = win ? pos.margin + pos.stake * (pos.odds - 1) * 0.2 : 0;
    set({
      positions: get().positions.map((p) =>
        p.id === id ? { ...p, status: "closed", pnl: settle - pos.margin } : p,
      ),
      balance: Number((get().balance + settle).toFixed(2)),
      pnlDay: Number((get().pnlDay + (settle - pos.margin)).toFixed(2)),
    });
  },
  ammMode: "B",
  setAmmMode: (ammMode) => set({ ammMode }),
  feed: [
    {
      id: "f1",
      handle: "Quant_Khabib",
      roi: 142,
      text: "5x · Makhachev decision @ 2.15",
      leverage: 5,
      at: 1,
    },
    {
      id: "f2",
      handle: "RingTape",
      roi: 88,
      text: "8x · Pereira U2.5 @ 1.78",
      leverage: 8,
      at: 2,
    },
  ],
  pushFeed: (t) => set({ feed: [t, ...get().feed].slice(0, 12) }),
}));

