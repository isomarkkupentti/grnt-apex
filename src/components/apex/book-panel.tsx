import {
  allocate,
  buyNo,
  buyYes,
  depth,
  funding8h,
  inventorySpread,
  mid,
  seedBook,
  skew,
  LAYERS,
  CAPS,
} from "@/lib/liquidity";
import { formatEur, formatPct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

export function BookPanel() {
  const [L, setL] = useState(10_000_000);
  const [p, setP] = useState(0.62);
  const [stake, setStake] = useState(1_250_000);
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [events, setEvents] = useState(10);

  const seeded = useMemo(() => seedBook(L, p), [L, p]);
  const sk0 = skew(seeded);
  const spread = inventorySpread(0.02, sk0);
  const fill = useMemo(
    () => (side === "yes" ? buyYes(seeded, stake, spread) : buyNo(seeded, stake, spread)),
    [seeded, stake, spread, side],
  );
  const d = depth(seeded);
  const m0 = mid(seeded);
  const fund = funding8h(fill.skew);
  const lines = allocate(500_000_000, events);

  return (
    <div className="space-y-4">
      <ol className="grid gap-2 sm:grid-cols-5">
        {LAYERS.map((x) => (
          <li key={x.id} className="rounded-xl border border-border bg-surface p-3">
            <div className="font-mono text-[10px] text-subtle">L{x.id}</div>
            <div className="mt-1 text-sm font-medium">{x.name}</div>
            <p className="mt-1 text-xs text-muted-foreground text-pretty">{x.detail}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 rounded-xl border border-border bg-surface p-5 lg:col-span-4">
          <p className="font-mono text-[10px] text-accent">ONE EVENT LINE</p>
          <Slider label={`Line L ${formatEur(L)} €`} min={2_000_000} max={40_000_000} step={500_000} value={L} onChange={setL} />
          <Slider label={`Oracle p ${p.toFixed(2)} · mid ${m0.oddsYes.toFixed(2)}`} min={0.2} max={0.8} step={0.01} value={p} onChange={setP} />
          <Slider label={`Notional ${formatEur(stake)} €`} min={50_000} max={8_000_000} step={50_000} value={stake} onChange={setStake} />
          <div className="flex gap-2">
            <Button size="sm" variant={side === "yes" ? "default" : "outline"} onClick={() => setSide("yes")}>
              Buy YES
            </Button>
            <Button size="sm" variant={side === "no" ? "default" : "outline"} onClick={() => setSide("no")}>
              Buy NO
            </Button>
          </div>
          <Slider label={`${events} brands on the same card`} min={1} max={10} step={1} value={events} onChange={setEvents} />
        </div>

        <div className="space-y-4 lg:col-span-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <Tile k="Quote odds" v={fill.odds.toFixed(3)} s={`${(fill.pQuote * 100).toFixed(1)}% · spread ${(spread * 100).toFixed(2)}%`} />
            <Tile k="Impact" v={formatPct(fill.impact * 100)} s={`skew ${formatPct(fill.skew * 100)} after fill`} />
            <Tile k="Depth to 2%" v={`${formatEur(d.i2)} €`} s={`1% ${formatEur(d.i1)} · 5% ${formatEur(d.i5)}`} />
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex h-3 overflow-hidden rounded-full bg-elevated">
              <div className="bg-accent/80" style={{ width: `${(seeded.qYes / (seeded.qYes + seeded.qNo)) * 100}%` }} />
              <div className="bg-good/70" style={{ width: `${(seeded.qNo / (seeded.qYes + seeded.qNo)) * 100}%` }} />
            </div>
            <p className="mt-2 font-mono text-[10px] text-subtle">
              q_yes {formatEur(seeded.qYes)} · q_no {formatEur(seeded.qNo)} · k conserved on fill · 8h funding {formatPct(fund * 100, 3)}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 font-mono text-xs tabular-nums sm:grid-cols-3">
            <Item k="Event cap (2%)" v={`${formatEur(lines.eventLine)} €`} />
            <Item k="Group cap (4%)" v={`${formatEur(lines.groupLine)} €`} />
            <Item k="Brand cap (15%)" v={`${formatEur(lines.brandLine)} €`} />
            <Item k="Siloed 10 books" v={`${formatEur(lines.usedIfSiloed)} €`} />
            <Item k="Netting hub" v={`${formatEur(lines.usedIfNet)} €`} />
            <Item k="Saved by netting" v={`${formatEur(lines.save)} €`} />
          </dl>
          <p className="text-xs text-subtle text-pretty">
            Caps: event {(CAPS.eventPct * 100).toFixed(0)}% · group {(CAPS.groupPct * 100).toFixed(0)}% · brand {(CAPS.brandPct * 100).toFixed(0)}% of
            500m. Ten siloed books on the same main would draw {formatEur(lines.usedIfSiloed)} €. One netted book draws the
            group line. That is the GRNT pool: inventory nets, carry falls.
          </p>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block text-xs text-muted-foreground">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full accent-accent"
      />
    </label>
  );
}

function Tile({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="font-mono text-[10px] text-subtle">{k}</div>
      <div className="mt-1 font-mono text-lg tabular-nums">{v}</div>
      <div className="mt-1 text-xs text-muted-foreground">{s}</div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-subtle">{k}</dt>
      <dd className="mt-1 text-sm text-foreground">{v}</dd>
    </div>
  );
}
