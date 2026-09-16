import { RISKS, RULES, VENUES, vammHole } from "@/lib/vamm-risk";
import { formatEur } from "@/lib/utils";
import { useMemo, useState } from "react";

export function VammRisk() {
  const [notional, setNotional] = useState(8_000_000);
  const [pYes, setPYes] = useState(0.62);
  const [lev, setLev] = useState(5);
  const [vault, setVault] = useState(3_000_000);
  const [junior, setJunior] = useState(1_000_000);
  const h = useMemo(
    () => vammHole({ notional, pYes, lev, vault, junior }),
    [notional, pYes, lev, vault, junior],
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-medium">vAMM risk vs the alternatives</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">
          Pure vAMM has no natural counterparty. Perpetual Protocol abandoned it. A 15-minute fight is a worse vAMM
          than a BTC perp: no time for funding, settlement is 0 or 1, recreational flow sits on the favourite.
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {VENUES.map((v) => (
          <li key={v.id} className="rounded-xl border border-border bg-surface p-3">
            <div className="text-sm font-medium">{v.name}</div>
            <p className="mt-1 text-xs text-muted-foreground text-pretty">{v.oneLiner}</p>
          </li>
        ))}
      </ul>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="bg-elevated text-primary">
            <tr>
              {["Risk", "House", "Pure vAMM", "Real CPMM", "APEX"].map((x) => (
                <th key={x} className="px-3 py-3 font-medium">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RISKS.map((r) => (
              <tr key={r.id} className="border-t border-border bg-surface">
                <td className="px-3 py-2.5 font-medium">{r.name}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.house}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.vamm}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.cpmm}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.apex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 rounded-xl border border-border bg-surface p-5 lg:col-span-4">
          <p className="font-mono text-[10px] text-accent">ONE-SIDED HOLE · FAVOURITE WINS</p>
          <Slider label={`Net YES notional ${formatEur(notional)} €`} min={1_000_000} max={20_000_000} step={500_000} value={notional} onChange={setNotional} />
          <Slider label={`Entry p ${pYes.toFixed(2)}`} min={0.4} max={0.85} step={0.01} value={pYes} onChange={setPYes} />
          <Slider label={`Leverage ${lev.toFixed(0)}x`} min={1} max={20} step={1} value={lev} onChange={setLev} />
          <Slider label={`Vault / line ${formatEur(vault)} €`} min={2_000_000} max={20_000_000} step={500_000} value={vault} onChange={setVault} />
          <Slider label={`Junior ${formatEur(junior)} €`} min={0} max={20_000_000} step={500_000} value={junior} onChange={setJunior} />
        </div>
        <div className="lg:col-span-8 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Tile k="Margin posted" v={`${formatEur(h.margin)} €`} />
            <Tile k="Winner payout (1−p)·N" v={`${formatEur(h.hole)} €`} />
            <Tile k="Uncovered" v={`${formatEur(h.uncovered)} €`} />
          </div>
          <p
            className={`rounded-xl border px-4 py-3 text-sm text-pretty ${
              h.covered ? "border-good/40 bg-good/10" : "border-bad/40 bg-bad/10"
            }`}
          >
            {h.covered
              ? "Junior covers the favourite-win hole. Pure vAMM without this cap leaves the 500m senior paying winners — that is Perp v1."
              : "Hole exceeds junior. This is a vAMM. Cut notional, cut leverage, or add first-loss. Do not widen k."}
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {RULES.map((x) => (
              <li key={x} className="text-pretty">
                {x}
              </li>
            ))}
          </ul>
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
