import { compareClip, EX_DEFAULT, FORMULAS, VENUE_ROWS, VENUES } from "@/lib/exchange";
import { formatEur, formatPct } from "@/lib/utils";
import { useMemo, useState } from "react";

export function ExchangeView() {
  const [clip, setClip] = useState(EX_DEFAULT.clip);
  const [L, setL] = useState(EX_DEFAULT.L);
  const [adv, setAdv] = useState(EX_DEFAULT.adv);
  const [sigma, setSigma] = useState(EX_DEFAULT.sigma);
  const c = useMemo(
    () => compareClip({ ...EX_DEFAULT, clip, L, adv, sigma }),
    [clip, L, adv, sigma],
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-medium">AMM vs exchange math</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">
          A CPMM is not a CLOB and not Betfair. Impact is closed-form and roughly linear in Q/L. A liquid equity
          follows the square-root law. Same €1.25m clip is a rounding error on OMX and a whale on a 10m fight line.
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {VENUES.map((v) => (
          <li key={v.id} className="rounded-xl border border-border bg-surface p-3">
            <div className="text-sm font-medium">{v.name}</div>
            <p className="mt-1 text-xs text-muted-foreground text-pretty">{v.one}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 rounded-xl border border-border bg-surface p-5 lg:col-span-4">
          <p className="font-mono text-[10px] text-accent">SAME CLIP · TWO IMPACT LAWS</p>
          <Slider label={`Clip ${formatEur(clip)} €`} min={50_000} max={8_000_000} step={50_000} value={clip} onChange={setClip} />
          <Slider label={`Event line L ${formatEur(L)} €`} min={2_000_000} max={40_000_000} step={500_000} value={L} onChange={setL} />
          <Slider label={`Equity ADV ${formatEur(adv)} €`} min={10_000_000} max={400_000_000} step={5_000_000} value={adv} onChange={setAdv} />
          <Slider label={`Daily σ ${(sigma * 100).toFixed(1)}%`} min={0.01} max={0.05} step={0.005} value={sigma} onChange={setSigma} />
        </div>
        <div className="lg:col-span-8 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Tile k="AMM fill impact" v={formatPct(c.ammFill * 100)} s={`p_exec ${c.pExec.toFixed(3)} · mid ${formatPct(c.ammMidPct * 100)}`} />
            <Tile k="Equity √Q impact" v={formatPct(c.sqrt * 100, 2)} s="Y=0.5 · Almgren" />
            <Tile k="AMM / equity" v={`${Number.isFinite(c.ratio) ? c.ratio.toFixed(0) : "—"}×`} s="same clip, different venue" />
          </div>
          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 font-mono text-xs tabular-nums sm:grid-cols-3">
            <Item k="Kyle λ (dp/€)" v={c.lambda.toExponential(2)} />
            <Item k="Linear λ·Q (mid)" v={c.linearMid.toFixed(3)} />
            <Item k="Exact Δ mid" v={c.ammMid.toFixed(3)} />
            <Item k="AMM cash to +2%" v={`${formatEur(c.depth2)} €`} />
            <Item k="Equity size at 2%" v={`${formatEur(c.equity2)} €`} />
            <Item k="Seed p" v="0.62" />
          </dl>
          <p className="text-xs text-subtle text-pretty">
            λ overstates large clips (convexity). Use the exact CPMM for fills. Square-root is an empirical CLOB law —
            not a quote. Do not tell a CPO the fight book trades like a stock.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-elevated text-primary">
            <tr>
              {["Desk calc", "Exchange / CLOB / futures", "APEX CPMM"].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FORMULAS.map((r) => (
              <tr key={r.item} className="border-t border-border bg-surface">
                <td className="px-3 py-2 font-medium">{r.item}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{r.xchg}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{r.amm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="bg-elevated text-primary">
            <tr>
              {["", "Equity CLOB", "Betfair", "Sportsbook", "APEX"].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VENUE_ROWS.map((r) => (
              <tr key={r.item} className="border-t border-border bg-surface">
                <td className="px-3 py-2 font-medium">{r.item}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.omx}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.betfair}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.house}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.apex}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
