import { LEGACY_HOLD, PRESETS, runModel, type ScenarioId } from "@/lib/model";
import { formatEur } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

export function ScenarioView() {
  const [id, setId] = useState<ScenarioId>("base");
  const preset = PRESETS[id];
  const [mau, setMau] = useState(preset.mau);
  const [deposit, setDeposit] = useState(preset.deposit);
  const [lev, setLev] = useState(preset.leverage);
  const [hold, setHold] = useState(preset.hold);
  const [rev, setRev] = useState(preset.revolutShare);
  const [brands, setBrands] = useState(preset.brands);

  const apply = (k: ScenarioId) => {
    const p = PRESETS[k];
    setId(k);
    setMau(p.mau);
    setDeposit(p.deposit);
    setLev(p.leverage);
    setHold(p.hold);
    setRev(p.revolutShare);
    setBrands(p.brands);
  };

  const m = useMemo(
    () => runModel({ mau, deposit, leverage: lev, hold, revolutShare: rev, brands }),
    [mau, deposit, lev, hold, rev, brands],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Scenarios</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground text-pretty">
            Same deposits. Leverage and hold mix drive GGR. Revolut share cuts CAC. Not a forecast.
          </p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(PRESETS) as ScenarioId[]).map((k) => (
            <Button key={k} size="sm" variant={id === k ? "default" : "outline"} onClick={() => apply(k)}>
              {PRESETS[k].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-border bg-surface p-5 lg:col-span-4">
          <Slider label={`MAU ${mau.toLocaleString("fi-FI")}`} min={1000} max={80000} step={1000} value={mau} onChange={setMau} />
          <Slider label={`Deposit ${deposit} €`} min={50} max={500} step={10} value={deposit} onChange={setDeposit} />
          <Slider label={`Avg leverage ${lev.toFixed(1)}x`} min={1} max={10} step={0.1} value={lev} onChange={setLev} />
          <Slider label={`APEX hold ${(hold * 100).toFixed(1)}%`} min={0.06} max={0.25} step={0.005} value={hold} onChange={setHold} />
          <Slider label={`Revolut Metal share ${(rev * 100).toFixed(0)}%`} min={0} max={0.5} step={0.01} value={rev} onChange={setRev} />
          <Slider label={`Brands ${brands}`} min={1} max={20} step={1} value={brands} onChange={setBrands} />
        </div>

        <div className="space-y-4 lg:col-span-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <Tile k="APEX GGR / mo" v={`${formatEur(m.apexGgr)} €`} />
            <Tile k="Legacy GGR" v={`${formatEur(m.legacyGgr)} €`} />
            <Tile k="Multiple" v={`${m.ggrMultiple.toFixed(1)}x`} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="border-b border-border text-xs text-subtle">
                <tr>
                  <th className="px-4 py-2 font-medium">Line</th>
                  <th className="px-4 py-2 font-medium">Legacy</th>
                  <th className="px-4 py-2 font-medium">APEX</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                <Tr a="Handle" b={`${formatEur(m.legacyVol)} €`} c={`${formatEur(m.apexVol)} €`} />
                <Tr a="Hold" b={`${(LEGACY_HOLD * 100).toFixed(1)}%`} c={`${(hold * 100).toFixed(1)}%`} />
                <Tr a="NGR" b={`${formatEur(m.legacyNgr)} €`} c={`${formatEur(m.apexNgr)} €`} />
                <Tr a="Casino keep" b={`${formatEur(m.legacyNgr * 0.85)} €`} c={`${formatEur(m.casinoKeep)} €`} />
                <Tr a="Session" b="45 s" c="14 min" />
                <Tr a="Churn 30d" b="65%" c="22%" />
                <Tr a="CAC spend" b={`${formatEur(m.legacyCacCost)} €`} c={`${formatEur(m.apexCacCost)} €`} />
                <Tr a="Revolut FTDs" b="—" c={m.revolutUsers.toLocaleString("fi-FI")} />
              </tbody>
            </table>
          </div>
          <p className="text-xs text-subtle text-pretty">
            GRNT month {formatEur(m.grntMonth)} € (SaaS {formatEur(m.saas)} + 15% NGR). ARR run-rate{" "}
            {formatEur(m.grntArr)} €. Revolut locked float {formatEur(m.revolutFloat)} € (50 € × Metal seats).
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

function Tile({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="font-mono text-[10px] text-subtle">{k}</div>
      <div className="mt-1 font-mono text-lg tabular-nums">{v}</div>
    </div>
  );
}

function Tr({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <tr className="border-t border-border/70">
      <td className="px-4 py-2 font-sans">{a}</td>
      <td className="px-4 py-2">{b}</td>
      <td className="px-4 py-2">{c}</td>
    </tr>
  );
}
