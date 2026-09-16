import { MARKETS } from "@/lib/markets";
import { formatPct } from "@/lib/utils";
import { marketStats, useTerminal } from "@/store/terminal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heatmap } from "./heatmap";
import { useEffect } from "react";


export function TerminalView() {
  const selectedId = useTerminal((s) => s.selectedId);
  const select = useTerminal((s) => s.select);
  const stake = useTerminal((s) => s.stake);
  const leverage = useTerminal((s) => s.leverage);
  const setStake = useTerminal((s) => s.setStake);
  const setLeverage = useTerminal((s) => s.setLeverage);
  const openPosition = useTerminal((s) => s.openPosition);
  const closePosition = useTerminal((s) => s.closePosition);
  const positions = useTerminal((s) => s.positions);
  const feed = useTerminal((s) => s.feed);
  const pushFeed = useTerminal((s) => s.pushFeed);

  const m = MARKETS.find((x) => x.id === selectedId) ?? MARKETS[0];
  const stats = marketStats(m);

  useEffect(() => {
    const t = setInterval(() => {
      const src = MARKETS[Math.floor(Math.random() * MARKETS.length)];
      const handles = ["TapeDesk", "FlyweightLab", "HW_Close", "Quant_Khabib"];
      pushFeed({
        id: `${Date.now()}`,
        handle: handles[Math.floor(Math.random() * handles.length)],
        roi: 40 + Math.floor(Math.random() * 120),
        text: `${2 + Math.floor(Math.random() * 10)}x · ${src.market}`,
        leverage: 2 + Math.floor(Math.random() * 10),
        at: Date.now(),
      });
    }, 9000);
    return () => clearInterval(t);
  }, [pushFeed]);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <section className="space-y-2 lg:col-span-5">
        <h2 className="text-sm font-medium text-muted-foreground">Screener · UFC card</h2>
        <ul className="space-y-2">
          {MARKETS.map((row) => {
            const s = marketStats(row);
            const active = row.id === m.id;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => select(row.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors duration-(--motion-quick) ${
                    active ? "border-accent bg-elevated" : "border-border bg-surface hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">
                        {row.fighterA} vs {row.fighterB}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.market} · {row.weightClass}
                      </div>
                    </div>
                    {s.hot ? <Badge tone="hot">EV+</Badge> : <Badge>FAIR</Badge>}
                  </div>
                  <div className="mt-2 flex gap-4 font-mono text-xs tabular-nums text-muted-foreground">
                    <span>best {s.book.odds.toFixed(2)}</span>
                    <span className={s.ev > 0 ? "text-good" : "text-bad"}>{formatPct(s.ev * 100)}</span>
                    <span>Kelly {(s.kelly * 100).toFixed(1)}%</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 lg:col-span-4">
        <h2 className="text-sm font-medium">Trade slip · paper</h2>
        <p className="text-xs text-muted-foreground">{m.market}</p>
        <label className="block text-xs text-muted-foreground">
          Stake {stake} €
          <input
            type="range"
            min={50}
            max={1000}
            step={50}
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            className="mt-2 h-2 w-full accent-accent"
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Leverage {leverage}x
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="mt-2 h-2 w-full accent-accent"
          />
        </label>
        <Heatmap entryOdds={stats.book.odds} leverage={leverage} stake={stake} />
        <Button className="w-full" onClick={openPosition}>
          Open paper position
        </Button>
        <div className="rounded-md border border-border bg-elevated p-3 text-xs">
          <div className="text-muted-foreground">Smart route (CPA · no house float)</div>
          <div className="mt-1 font-medium">
            Best book {stats.book.name} @ {stats.book.odds.toFixed(2)}
          </div>
          <a
            href={`${stats.book.affiliate}?subid=GRNT_APEX&market=${encodeURIComponent(m.market)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex h-11 items-center text-sm text-accent underline-offset-4 hover:underline"
          >
            Place on {stats.book.name}
          </a>
        </div>
        <ul className="space-y-2">
          {positions.slice(0, 5).map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-xs">
              <span className="truncate pr-2">{p.label}</span>
              {p.status === "open" ? (
                <Button size="sm" variant="outline" onClick={() => closePosition(p.id)}>
                  Resolve
                </Button>
              ) : (
                <span className={p.pnl >= 0 ? "text-good" : "text-bad"}>{p.pnl.toFixed(0)} €</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <aside className="space-y-3 rounded-xl border border-border bg-surface p-4 lg:col-span-3">
        <h2 className="text-sm font-medium">Copy feed</h2>
        <p className="text-xs text-muted-foreground">Paper only. Copy does not move real money.</p>
        <ul className="space-y-2">
          {feed.map((f) => (
            <li key={f.id} className="rounded-md border border-border p-3">
              <div className="flex justify-between text-xs">
                <span className="font-medium">@{f.handle}</span>
                <span className="font-mono text-good">ROI {f.roi}%</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{f.text}</p>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}


