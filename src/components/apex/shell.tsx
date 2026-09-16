import type { ReactNode } from "react";
import { useTerminal } from "@/store/terminal";
import { formatEur, formatPct } from "@/lib/utils";
import { cn } from "@/lib/utils";


const TABS = [
  { id: "deck", label: "CPO deck" },
  { id: "terminal", label: "Terminal" },
  { id: "wedge", label: "Casino wedge" },
  { id: "pnp", label: "Pay N Play" },
  { id: "lender", label: "Lender pool" },
  { id: "scenario", label: "Scenarios" },
  { id: "matrix", label: "KPI map" },
  { id: "roadmap", label: "LTS" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const tab = useTerminal((s) => s.tab);
  const setTab = useTerminal((s) => s.setTab);
  const balance = useTerminal((s) => s.balance);
  const pnlDay = useTerminal((s) => s.pnlDay);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-widest text-primary">GRNT APEX</span>
            <span className="hidden font-mono text-[10px] text-accent sm:inline">PAPER · v0.1</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs tabular-nums">
            <div>
              <span className="text-subtle">Virtual </span>
              <span className="text-primary">{formatEur(balance)} €</span>
            </div>
            <div className={pnlDay >= 0 ? "text-good" : "text-bad"}>
              {formatPct((pnlDay / 10000) * 100)} day
            </div>
          </div>
        </div>
        <div className="gold-rule" />
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "h-10 shrink-0 rounded-md px-3 text-sm font-medium transition-colors duration-(--motion-quick)",
                tab === t.id ? "bg-elevated text-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
