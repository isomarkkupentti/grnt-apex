const ROWS = [
  ["UX", "1X2 coupon", "Leverage, heatmap, copy feed", "Stops bonus-only acquisition"],
  ["Hold", "4–6% singles", "15–25% packaged books", "Only if parlays actually convert"],
  ["Session", "~45 s", "12–18 min target", "More touches per card"],
  ["Tase", "House vs player", "AMM pool · Mode A or B", "Wedge: host changes, curve does not"],
  ["Integrate", "Backend swap", "iFrame / SDK", "Days, not quarters"],
  ["Cashier", "Form + card", "Existing PnP (Trustly/Zimpler) + Revolut Metal door", "FTD without a form. Do not rip the rail"],
];

export function MatrixView() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">CPO matrix</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground text-pretty">
          What changes on the operator P&L. Casino wedge (Mode A/B) is the tase row — not a second product.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-elevated text-primary">
            <tr>
              {["Metric", "Legacy", "APEX", "P&L"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r[0]} className="border-t border-border">
                {r.map((c, i) => (
                  <td key={i} className={`px-4 py-3 ${i === 0 ? "font-medium" : "text-muted-foreground"}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
