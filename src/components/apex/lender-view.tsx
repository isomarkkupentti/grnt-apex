import { BookPanel } from "@/components/apex/book-panel";
import { VammRisk } from "@/components/apex/vamm-risk";
import { ExchangeView } from "@/components/apex/exchange-view";
import { LENDER_DEFAULT, WATCH, sizePool, type LenderInput } from "@/lib/lender";
import { formatEur } from "@/lib/utils";
import { useMemo, useState } from "react";

export function LenderView() {
  const [p, setP] = useState<LenderInput>(LENDER_DEFAULT);
  const m = useMemo(() => sizePool(p), [p]);
  const set = (k: keyof LenderInput, n: number) => setP((s) => ({ ...s, [k]: n }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Lender pool</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground text-pretty">
          Five layers. Senior 500m is a revolver, not a Uniswap pool. The book is a binary CPMM on an event line.
          Same fight on ten brands is one inventory. Isolated margin never sits in k.{" "}
          <a className="text-accent underline-offset-2 hover:underline" href="/GRNT_APEX_AMM_Handbook.pdf" target="_blank" rel="noreferrer">
            AMM handbook (PDF)
          </a>
        </p>
      </div>

      <BookPanel />

      <VammRisk />

      <ExchangeView />

      <h2 className="text-sm font-medium">Facility vs peak flow</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <Tile k="Pool need" v={`${formatEur(m.poolNeed)} €`} s="at target util and max impact" />
        <Tile k="Facility" v={`${formatEur(p.facility)} €`} s={m.gap >= 0 ? "covers peak" : "short vs peak"} />
        <Tile k="Carry vs LP take" v={`${m.coverage.toFixed(2)}x`} s={`${formatEur(m.annualCost)} € cost · ${formatEur(m.lpRev)} € skim`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 rounded-xl border border-border bg-surface p-5 lg:col-span-4">
          <Slider label={`${p.casinos} casinos`} min={1} max={20} step={1} value={p.casinos} onChange={(n) => set("casinos", n)} />
          <Slider
            label={`Handle / casino ${formatEur(p.monthlyHandleEach)} €/mo`}
            min={10_000_000}
            max={120_000_000}
            step={5_000_000}
            value={p.monthlyHandleEach}
            onChange={(n) => set("monthlyHandleEach", n)}
          />
          <Slider
            label={`Peak one-sided ${(p.peakWeeklyShare * 100).toFixed(0)}% of weekly`}
            min={0.03}
            max={0.2}
            step={0.01}
            value={p.peakWeeklyShare}
            onChange={(n) => set("peakWeeklyShare", n)}
          />
          <Slider
            label={`Max impact ${(p.maxSlippage * 100).toFixed(1)}%`}
            min={0.01}
            max={0.06}
            step={0.005}
            value={p.maxSlippage}
            onChange={(n) => set("maxSlippage", n)}
          />
          <Slider
            label={`Idle buffer (1 − util) ${((1 - p.targetUtil) * 100).toFixed(0)}%`}
            min={0.25}
            max={0.7}
            step={0.05}
            value={p.targetUtil}
            onChange={(n) => set("targetUtil", n)}
          />
          <Slider
            label={`Avg drawn ${(p.avgDrawn * 100).toFixed(0)}%`}
            min={0.15}
            max={1}
            step={0.05}
            value={p.avgDrawn}
            onChange={(n) => set("avgDrawn", n)}
          />
          <Slider
            label={`LP take ${(p.lpTake * 100).toFixed(2)}% of handle`}
            min={0.002}
            max={0.02}
            step={0.001}
            value={p.lpTake}
            onChange={(n) => set("lpTake", n)}
          />
        </div>

        <div className="space-y-4 lg:col-span-8">
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <tbody className="font-mono tabular-nums">
                <Tr a="Combined handle / mo" b={`${formatEur(m.monthlyHandle)} €`} />
                <Tr a="Weekly" b={`${formatEur(m.weeklyHandle)} €`} />
                <Tr a="Peak one-sided flow" b={`${formatEur(m.peakOneSided)} €`} />
                <Tr a="Reserve for max impact" b={`${formatEur(m.reserveAtImpact)} €`} />
                <Tr a="Pool with buffer" b={`${formatEur(m.poolNeed)} €`} />
                <Tr a="Peak use of 500m" b={`${(m.peakUtilIfFacility * 100).toFixed(0)}%`} />
                <Tr a="Interest 6.5% on drawn" b={`${formatEur(m.interest)} €/y`} />
                <Tr a="Commitment on undrawn" b={`${formatEur(m.commitFee)} €/y`} />
                <Tr a="Handle / drawn capital" b={`${m.capitalVelocity.toFixed(0)}x / y`} />
              </tbody>
            </table>
          </div>

          <ul className="space-y-2">
            {m.alerts.map((a) => (
              <li
                key={a.code}
                className={`rounded-xl border px-4 py-3 text-sm text-pretty ${
                  a.level === "halt"
                    ? "border-bad/40 bg-bad/10"
                    : a.level === "watch"
                      ? "border-border bg-elevated"
                      : "border-good/40 bg-good/10"
                }`}
              >
                <span className="font-mono text-[10px] text-subtle">{a.level.toUpperCase()} · {a.code}</span>
                <p className="mt-1">{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium">Tape — halt if any trip</h2>
        <div className="mt-2 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-elevated text-primary">
              <tr>
                {["Code", "Trigger", "Action"].map((h) => (
                  <th key={h} className="px-3 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WATCH.map((w) => (
                <tr key={w.code} className="border-t border-border bg-surface">
                  <td className="px-3 py-2 font-mono text-xs text-accent">{w.code}</td>
                  <td className="px-3 py-2 text-muted-foreground">{w.trigger}</td>
                  <td className="px-3 py-2 text-muted-foreground">{w.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-2xl text-xs text-subtle text-pretty">
          Senior 500m is short and liquid: 7–30 day revolving, combat settlement in hours. Junior first-loss (GRNT +
          operator) sits under it. Mode B: funds stay in the casino vault; the facility is a hedge line, not a
          sweep. One event, one allocated line — never one 500m book.
        </p>
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

function Tr({ a, b }: { a: string; b: string }) {
  return (
    <tr className="border-t border-border/70">
      <td className="px-4 py-2 font-sans">{a}</td>
      <td className="px-4 py-2">{b}</td>
    </tr>
  );
}
