const PHASES = [
  {
    n: "1",
    t: "Aggregator · mo 1–3",
    d: "Paper book, EV screener, copy feed, smart-route CPA. KPI: 500 users, >8 min, >15% CTR.",
    wedge: "Wedge is a slide, not live AMM.",
  },
  {
    n: "2",
    t: "B2B widget · mo 4–12",
    d: "White-label iFrame inside an MGA UI. SaaS + NGR share. Operator owns KYC.",
    wedge: "Revolut Metal 50 € lock + Pay N Play. Wedge as licence path.",
  },
  {
    n: "3",
    t: "AMM Type 2 · mo 12–24",
    d: "Own pool, funding rate, liquidation. Switch Mode A (GRNT pool) or B (casino vault).",
    wedge: "This is when casino-wedge ships as production config, not a pitch.",
  },
  {
    n: "4",
    t: "Overlay · Y3+",
    d: "Stream HUD, wallet ingress, multi-sport. Exit is a process, not a number.",
    wedge: "DAZN overlay stays here. Revolut is already in Phase 2.",
  },
];

export function RoadmapView() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">LTS</h1>
      <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
        eGRIND is retired. Public name is APEX. Casino wedge lives in Phase 3; it is sold from Phase 1 so the
        lawyer has an answer.
      </p>
      <ol className="grid gap-3 md:grid-cols-2">
        {PHASES.map((p) => (
          <li key={p.n} className="rounded-xl border border-border bg-surface p-5">
            <div className="font-mono text-xs text-accent">Phase {p.n}</div>
            <h2 className="mt-1 font-medium">{p.t}</h2>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">{p.d}</p>
            <p className="mt-3 text-xs text-subtle text-pretty">{p.wedge}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
