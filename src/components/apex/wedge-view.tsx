import { AMM_COPY, executeBuy, operatorImpact, type AmmMode } from "@/lib/amm";
import { formatEur } from "@/lib/utils";
import { useTerminal } from "@/store/terminal";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export function WedgeView() {
  const mode = useTerminal((s) => s.ammMode);
  const setMode = useTerminal((s) => s.setAmmMode);
  const copy = AMM_COPY[mode];
  const [stake, setStake] = useState(500);
  const trade = useMemo(() => executeBuy(5_000_000, 5_000_000, stake, mode === "A" ? 0.015 : 0.02), [stake, mode]);
  const impact = operatorImpact();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Casino wedge</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
          Same player terminal. The wedge is who hosts the pool. Flip Mode A or B — do not rewrite the book.
          Phase 1 still ships paper + CPA. This contract is what you sell the CPO so tase and licence are not a deadlock.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["A", "B"] as AmmMode[]).map((m) => (
          <Button key={m} variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)}>
            {m === "A" ? "Mode A · GRNT pool" : "Mode B · Casino vault"}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-medium">{copy.title}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-subtle">Host</dt>
              <dd className="text-pretty">{copy.host}</dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Funds</dt>
              <dd className="text-pretty">{copy.vault}</dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Tase</dt>
              <dd className="text-pretty">{copy.tase}</dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Use when</dt>
              <dd className="text-pretty">{copy.who}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-medium">CPMM fill · 10m line · {mode === "A" ? "1.5%" : "2.0%"} spread</h2>
          <label className="mt-4 block text-xs text-muted-foreground">
            Stake {stake} €
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="mt-2 h-2 w-full accent-accent"
            />
          </label>
          <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm tabular-nums">
            <div>
              <dt className="text-[10px] text-subtle">Effective odds</dt>
              <dd>{trade.effectiveOdds.toFixed(3)}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-subtle">Slippage</dt>
              <dd>{trade.slippagePct.toFixed(2)}%</dd>
            </div>
            <div>
              <dt className="text-[10px] text-subtle">q_yes</dt>
              <dd>{formatEur(trade.newReserveA)}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-subtle">q_no</dt>
              <dd>{formatEur(trade.newReserveB)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Curve is the binary CPMM (complete-set mint, sell the other side). A vs B only changes who holds the vault.
          </p>
        </article>
      </div>

      <article className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Operator delta · 10 000 MAU · 200 € deposit</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Same deposits. Hold mix and leverage change the GGR line — not the AMM host.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-border text-xs text-subtle">
              <tr>
                <th className="py-2 font-medium">Line</th>
                <th className="py-2 font-medium">Legacy slip</th>
                <th className="py-2 font-medium">With APEX</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              <tr className="border-b border-border/60">
                <td className="py-2 font-sans">Volume</td>
                <td>{formatEur(impact.legacyVol)} €</td>
                <td>{formatEur(impact.apexVol)} €</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 font-sans">Hold</td>
                <td>4.5%</td>
                <td>16.5%</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 font-sans">GGR / mo</td>
                <td>{formatEur(impact.legacyGgr)} €</td>
                <td className="text-good">{formatEur(impact.apexGgr)} €</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 font-sans">Session</td>
                <td>45 s</td>
                <td>14 min</td>
              </tr>
              <tr>
                <td className="py-2 font-sans">Tase risk</td>
                <td>100% house</td>
                <td>0% (pool) · {mode === "A" ? "off-licence" : "in-vault"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-2xl text-xs text-muted-foreground text-pretty">
          Alignment: do not quote 11.5x GGR as a fact in a first CPO mail. It is a model under parlay-nudge
          and 3.5x average leverage. Lead with session time and smart-route CTR from the paper book. The wedge
          answers the lawyer: if pooling off-tase is blocked, switch to Mode B.
        </p>
      </article>
    </div>
  );
}
