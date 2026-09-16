import { liquidationOdds, requiredMargin } from "@/lib/quant";

export function Heatmap({
  entryOdds,
  leverage,
  stake,
}: {
  entryOdds: number;
  leverage: number;
  stake: number;
}) {
  const liq = liquidationOdds(entryOdds, leverage);
  const margin = requiredMargin(stake, leverage);
  const marker = leverage > 1 && entryOdds > 0 ? Math.min(Math.max((liq / entryOdds) * 100, 2), 98) : null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>RISK BAND</span>
        <span className="tabular-nums">
          margin {margin.toFixed(0)} € · liq {leverage > 1 ? liq.toFixed(3) : "—"}
        </span>
      </div>
      <div
        className="relative h-12 w-full overflow-hidden rounded-md"
        style={{ background: "linear-gradient(90deg, #3d9a6e 0%, #8a7a3a 55%, #c45b5b 100%)" }}
      >
        {marker != null ? (
          <div
            className="absolute top-0 h-full w-0.5 bg-primary"
            style={{ left: `${marker}%` }}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}
