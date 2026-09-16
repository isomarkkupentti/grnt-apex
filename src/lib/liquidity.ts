/** Binary CPMM book. Facility is a revolver; each event gets a line. */

export type Book = { qYes: number; qNo: number };

export const LAYERS = [
  { id: "0", name: "Senior facility", detail: "500m revolving, 6.5%, 7–30 day. GRNT lender. Not parked in one fight." },
  { id: "1", name: "Junior first-loss", detail: "GRNT + operator. Eats NAV hits before senior. Kill-switch sits here." },
  { id: "2", name: "Event line", detail: "Cap per fight and per brand. Same UFC main across 10 casinos is one book." },
  { id: "3", name: "CPMM book", detail: "q_yes · q_no = k. Mid p = q_no / (q_yes + q_no). Seed q_yes = L(1−p), q_no = L p." },
  { id: "4", name: "Isolated margin", detail: "Player posts margin. Book sees notional. Liquidation unwinds inventory, not the house." },
] as const;

export const CAPS = {
  eventPct: 0.02,
  brandPct: 0.15,
  groupPct: 0.04,
};

export function seedBook(L: number, p: number): Book {
  const pClamped = Math.min(0.95, Math.max(0.05, p));
  return { qYes: L * (1 - pClamped), qNo: L * pClamped };
}

export function mid(b: Book) {
  const L = b.qYes + b.qNo;
  const pYes = L > 0 ? b.qNo / L : 0.5;
  return { pYes, pNo: 1 - pYes, L, oddsYes: pYes > 0 ? 1 / pYes : 99, k: b.qYes * b.qNo };
}

/** Buy YES with cash `a`: mint complete set, sell the NO into the pool. k unchanged. */
export function buyYes(b: Book, a: number, spread = 0.02) {
  const aIn = Math.max(0, a);
  const k = b.qYes * b.qNo;
  const qNo2 = b.qNo + aIn;
  const qYes2 = k / qNo2;
  const yesFromSwap = b.qYes - qYes2;
  const yesOut = aIn + yesFromSwap;
  const pExec = yesOut > 0 ? aIn / yesOut : 1;
  const pQuote = Math.min(0.99, pExec * (1 + spread));
  const next: Book = { qYes: qYes2, qNo: qNo2 };
  const before = mid(b);
  const after = mid(next);
  return {
    next,
    yesOut,
    pExec,
    pQuote,
    odds: 1 / pQuote,
    impact: before.pYes > 0 ? pExec / before.pYes - 1 : 0,
    spread,
    skew: skew(next),
    after,
  };
}

export function buyNo(b: Book, a: number, spread = 0.02) {
  const flipped = buyYes({ qYes: b.qNo, qNo: b.qYes }, a, spread);
  return {
    ...flipped,
    next: { qYes: flipped.next.qNo, qNo: flipped.next.qYes },
    after: mid({ qYes: flipped.next.qNo, qNo: flipped.next.qYes }),
  };
}

export function skew(b: Book) {
  const L = b.qYes + b.qNo;
  return L > 0 ? (b.qNo - b.qYes) / L : 0;
}

/** Extra half-spread from inventory. Heavy YES flow → worse YES price. */
export function inventorySpread(base: number, sk: number, k = 0.04) {
  return base + k * Math.abs(sk);
}

/** 8h funding paid by the heavy side, annualised later if needed. */
export function funding8h(sk: number, f = 0.0008) {
  return f * sk;
}

/** Cash `a` that moves mid by target impact (no spread). */
export function sizeForImpact(b: Book, impact: number, side: "yes" | "no" = "yes") {
  const m = mid(b);
  const k = b.qYes * b.qNo;
  if (k <= 0) return 0;
  if (side === "yes") {
    const pTarget = Math.min(0.99, m.pYes * (1 + impact));
    const qNo2 = Math.sqrt((pTarget * k) / (1 - pTarget));
    return Math.max(0, qNo2 - b.qNo);
  }
  const pTarget = Math.max(0.01, m.pYes * (1 - impact));
  const qYes2 = Math.sqrt((k * (1 - pTarget)) / pTarget);
  return Math.max(0, qYes2 - b.qYes);
}

export function depth(b: Book) {
  return {
    i1: sizeForImpact(b, 0.01),
    i2: sizeForImpact(b, 0.02),
    i5: sizeForImpact(b, 0.05),
  };
}

export function allocate(facility: number, liveEvents: number) {
  const eventLine = facility * CAPS.eventPct;
  const groupLine = facility * CAPS.groupPct;
  const brandLine = facility * CAPS.brandPct;
  const usedIfSiloed = liveEvents * eventLine;
  const usedIfNet = Math.min(groupLine, liveEvents * eventLine);
  return { eventLine, groupLine, brandLine, usedIfSiloed, usedIfNet, save: usedIfSiloed - usedIfNet };
}
