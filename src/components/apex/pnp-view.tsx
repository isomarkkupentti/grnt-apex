import { PNP_PICK, RAILS, type Rail } from "@/lib/pnp";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PnpView() {
  const [id, setId] = useState(RAILS[0]!.id);
  const r = RAILS.find((x) => x.id === id) ?? RAILS[0]!;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Pay N Play rails</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground text-pretty">
          Pay N Play is a model (bank login = KYC + first deposit). Trustly, Zimpler and Brite are the rails.
          Revolut Metal is a partner cohort, not a third PnP. APEX sits on the operator cashier — it does not replace it.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {RAILS.map((x) => (
          <Button key={x.id} size="sm" variant={id === x.id ? "default" : "outline"} onClick={() => setId(x.id)}>
            {x.name}
          </Button>
        ))}
      </div>

      <RailCard r={r} />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-elevated text-primary">
            <tr>
              {["Rail", "Type", "APEX fit", "Fee band", "Contract"].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RAILS.map((row) => (
              <tr
                key={row.id}
                className={`cursor-pointer border-t border-border bg-surface ${id === row.id ? "bg-elevated" : ""}`}
                onClick={() => setId(row.id)}
              >
                <td className="px-3 py-2.5 font-medium">{row.name}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{row.kindLabel}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-accent">{row.fit}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{row.fee}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{row.contract}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className="grid gap-3 md:grid-cols-3">
        <Call k="If they already have Trustly" v={PNP_PICK.ifHasTrustly} />
        <Call k="If they have no PnP" v={PNP_PICK.ifNew} />
        <Call k="Never" v={PNP_PICK.never} />
      </aside>
      <p className="text-xs text-subtle">
        Sources: operator-facing 2026 briefs (Trustly TPV / 1.7x FTD, Zimpler–TrueLayer close Mar 2026, Brite Play terms). Fees are bands, not a quote.
      </p>
    </div>
  );
}

function RailCard({ r }: { r: Rail }) {
  return (
    <article className="grid gap-4 rounded-xl border border-border bg-surface p-5 md:grid-cols-2">
      <div>
        <p className="font-mono text-[10px] text-accent">{r.kindLabel.toUpperCase()}</p>
        <h2 className="mt-1 text-lg font-semibold">{r.name}</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">{r.apex}</p>
      </div>
      <dl className="space-y-2 text-sm">
        <Row k="Markets" v={r.markets} />
        <Row k="Banks" v={r.banks} />
        <Row k="KYC" v={r.kyc} />
        <Row k="In / out" v={`${r.inSpeed} · ${r.outSpeed}`} />
        <Row k="Note" v={r.note} />
      </dl>
    </article>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] font-mono text-subtle">{k}</dt>
      <dd className="text-pretty text-muted-foreground">{v}</dd>
    </div>
  );
}

function Call({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-sm font-medium">{k}</div>
      <p className="mt-2 text-sm text-muted-foreground text-pretty">{v}</p>
    </div>
  );
}
