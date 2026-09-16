export function impliedProb(decimalOdds: number): number {
  if (decimalOdds <= 1) return 1;
  return 1 / decimalOdds;
}

export function expectedValue(trueProb: number, decimalOdds: number): number {
  return trueProb * decimalOdds - 1;
}

/** Quarter-Kelly, capped at 10% of bank. */
export function fractionalKelly(trueProb: number, decimalOdds: number, fraction = 0.25): number {
  const b = decimalOdds - 1;
  if (b <= 0) return 0;
  const full = (b * trueProb - (1 - trueProb)) / b;
  if (full <= 0) return 0;
  return Math.min(full * fraction, 0.1);
}

export function requiredMargin(stake: number, leverage: number): number {
  return stake / Math.max(leverage, 1);
}

/** Visual liquidation odds for isolated margin. */
export function liquidationOdds(entryOdds: number, leverage: number): number {
  if (leverage <= 1) return 0;
  return Number((entryOdds * (1 - 1 / leverage)).toFixed(3));
}
