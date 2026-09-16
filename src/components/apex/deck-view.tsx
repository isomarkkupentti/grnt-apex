import { FEATURES, PRESETS, runModel, type ScenarioId } from "@/lib/model";
import { formatEur } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

const SLIDES = ["open", "pain", "cascade", "numbers", "pnp", "revolut", "ask"] as const;
type Slide = (typeof SLIDES)[number];

export function DeckView() {
  const [slide, setSlide] = useState<Slide>("open");
  const i = SLIDES.indexOf(slide);
  const go = (d: number) => setSlide(SLIDES[Math.min(SLIDES.length - 1, Math.max(0, i + d))]!);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] tracking-wide text-subtle">
          OPERATOR DECK · {i + 1} / {SLIDES.length} · CONFIDENTIAL
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => go(-1)} disabled={i === 0}>
            Prev
          </Button>
          <Button size="sm" onClick={() => go(1)} disabled={i === SLIDES.length - 1}>
            Next
          </Button>
        </div>
      </div>
      {slide === "open" && <OpenSlide />}
      {slide === "pain" && <PainSlide />}
      {slide === "cascade" && <CascadeSlide />}
      {slide === "numbers" && <NumbersSlide />}
      {slide === "pnp" && <PnpSlide />}
      {slide === "revolut" && <RevolutSlide />}
      {slide === "ask" && <AskSlide />}
    </div>
  );
}

function OpenSlide() {
  return (
    <article className="rounded-xl border border-border bg-elevated p-6 md:p-10">
      <p className="font-mono text-xs text-accent">GRNT × operator</p>
      <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-primary text-balance">
        APEX is the trading terminal your sportsbook is missing.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
        Players already live in Robinhood and eToro. You still show them a 2010 coupon. APEX sits on your UI,
        turns a bet into a book, and routes the stake to you. Revolut Metal is the funded on-ramp.
      </p>
      <div className="gold-rule mt-8 max-w-xs" />
      <p className="mt-4 font-mono text-xs text-subtle">Plug-in widget · no backend rewrite · Phase 1 paper + CPA</p>
      <p className="mt-4 text-sm">
        <a className="text-accent underline-offset-2 hover:underline" href="https://github.com/isomarkkupentti/grnt-apex-playbook" target="_blank" rel="noreferrer">
          Public document
        </a>
        <span className="text-subtle"> · </span>
        <a className="text-accent underline-offset-2 hover:underline" href="/GRNT_APEX_AMM_Handbook.pdf" target="_blank" rel="noreferrer">
          AMM handbook
        </a>
      </p>
    </article>
  );
}

function PainSlide() {
  const rows = [
    ["Your product", "Same Kambi/SBTech lines as every neighbour."],
    ["Your acquisition", "Bonus war. CPA 150–250 €. Player leaves after the free bet."],
    ["Your session", "45 seconds. Place, exit, wait."],
    ["Your tase", "You are the counterparty. A favourite streak burns the month."],
    ["Their habit", "21–35, Revolut Metal, leverage, copy-trade, data — not a coupon."],
  ];
  return (
    <article className="space-y-4">
      <h1 className="text-xl font-semibold">The operator problem</h1>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
        {rows.map(([k, v]) => (
          <li key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
            <span className="text-sm font-medium">{k}</span>
            <span className="text-sm text-muted-foreground sm:col-span-2 text-pretty">{v}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function CascadeSlide() {
  return (
    <article className="space-y-4">
      <h1 className="text-xl font-semibold">Player feature → casino line</h1>
      <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
        Nothing on this list is a banner. Each tool changes a behaviour; the behaviour hits a KPI.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-elevated text-primary">
            <tr>
              {["Player gets", "Does this", "Casino gets", "KPI"].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f) => (
              <tr key={f.id} className="border-t border-border bg-surface">
                <td className="px-3 py-3 font-medium">{f.player}</td>
                <td className="px-3 py-3 text-muted-foreground">{f.behaviour}</td>
                <td className="px-3 py-3 text-muted-foreground">{f.casino}</td>
                <td className="px-3 py-3 font-mono text-xs text-accent">{f.kpi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function NumbersSlide() {
  const [id, setId] = useState<ScenarioId>("base");
  const p = PRESETS[id];
  const m = useMemo(() => runModel(p), [p]);
  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Scenario math</h1>
          <p className="mt-1 text-sm text-muted-foreground">Model. Hold mix and leverage are the two levers that move GGR.</p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(PRESETS) as ScenarioId[]).map((k) => (
            <Button key={k} size="sm" variant={id === k ? "default" : "outline"} onClick={() => setId(k)}>
              {PRESETS[k].label}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric k="Casino GGR / mo" v={`${formatEur(m.apexGgr)} €`} s={`vs ${formatEur(m.legacyGgr)} € legacy`} />
        <Metric k="Multiple" v={`${m.ggrMultiple.toFixed(1)}x`} s={`${p.leverage}x lev · ${(p.hold * 100).toFixed(1)}% hold`} />
        <Metric k="CAC saved / mo" v={`${formatEur(m.cacSaved)} €`} s={`${m.revolutUsers.toLocaleString("fi-FI")} Revolut FTDs`} />
      </div>
      <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 font-mono text-xs tabular-nums md:grid-cols-4">
        <Item k="MAU" v={p.mau.toLocaleString("fi-FI")} />
        <Item k="Deposits" v={`${formatEur(m.deposits)} €`} />
        <Item k="APEX handle" v={`${formatEur(m.apexVol)} €`} />
        <Item k="Casino keep after 15%" v={`${formatEur(m.casinoKeep)} €`} />
      </dl>
    </article>
  );
}

function PnpSlide() {
  return (
    <article className="space-y-4">
      <h1 className="text-xl font-semibold">Pay N Play vs Revolut</h1>
      <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
        Three Swedish rails do the same job: bank login = KYC + first cash. Revolut is not the fourth rail. It is the
        funded Metal user we seat into APEX.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-elevated text-primary">
            <tr>
              {["", "Trustly", "Zimpler GO", "Brite Play", "Revolut Metal"].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-surface">
            {[
              ["Job", "PnP FTD", "PnP FTD", "PnP FTD", "Cohort + rails"],
              ["Coverage", "30+ EU, default", "Nordics, now TrueLayer", "EU challenger", "EEA wallet already open"],
              ["Fee band", "0–1.2%", "0.6–1.1%", "0.5–1.5%", "FX / interchange"],
              ["Floor", "$300k / 12 mo", "Mid-market", "$200k / 6 mo", "Partnership"],
              ["APEX", "Keep if live", "Alt / TrueLayer", "Price lever", "Phase 2 door"],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-border">
                {row.map((c, i) => (
                  <td key={i} className={`px-3 py-2.5 ${i === 0 ? "font-medium" : "text-muted-foreground"}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-subtle text-pretty">
        Trustly quotes 1.7x deposit volume vs form signup. We do not rip out their cashier. Full matrix is under Pay N Play.
      </p>
    </article>
  );
}

function RevolutSlide() {
  return (
    <article className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="font-mono text-[10px] text-accent">PARTNER</p>
        <h1 className="mt-1 text-xl font-semibold">Revolut Metal × GRNT</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          GRNT is the product and the math. Revolut is the banked user. Metal holders already use leverage and
          cards. We do not buy them on Google. We seat them with a locked 50 € margin.
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          <li>
            <span className="font-medium">Hook.</span>{" "}
            <span className="text-muted-foreground">50 € locked collateral → up to 500 € notional at 10x. Winnings withdrawable. House is not the bonus printer.</span>
          </li>
          <li>
            <span className="font-medium">KYC.</span>{" "}
            <span className="text-muted-foreground">Pay N Play via Open Banking. Operator still owns the licence and the player file.</span>
          </li>
          <li>
            <span className="font-medium">Rails.</span>{" "}
            <span className="text-muted-foreground">Instant on/off-ramp to the Revolut balance. Needed for leveraged round-trips.</span>
          </li>
        </ul>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Who captures what</h2>
        <table className="mt-3 w-full text-sm">
          <tbody className="divide-y divide-border">
            {[
              ["Casino", "Player, KYC, NGR, brand. Widget is white-label."],
              ["GRNT", "SaaS + 15% of APEX-routed NGR. AMM skim in Phase 3."],
              ["Revolut", "Interchange / FX on rails + Metal retention. Optional rev-share on seated FTDs."],
            ].map(([a, b]) => (
              <tr key={a}>
                <td className="py-2 pr-3 font-medium">{a}</td>
                <td className="py-2 text-muted-foreground text-pretty">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-subtle text-pretty">
          Phase 1 does not move real Revolut funds. The hook is sold as the Phase 2 onboarding path so the CPO sees
          a funded cohort, not another affiliate.
        </p>
      </div>
    </article>
  );
}

function AskSlide() {
  return (
    <article className="rounded-xl border border-border bg-surface p-6 md:p-8">
      <h1 className="text-xl font-semibold">Ask</h1>
      <ol className="mt-4 max-w-xl list-decimal space-y-3 pl-5 text-sm leading-relaxed">
        <li>14-day paper test on one combat card. 500–1 000 of your actives or a Revolut Metal slice.</li>
        <li>Gate: session over 10 min and smart-route CTR over 15%. If missed, we stop.</li>
        <li>If hit: iFrame on staging in 7 days. SaaS from 6 000 €/mo + 15% of APEX NGR. Dual-mode AMM is the tase path, not the first invoice.</li>
      </ol>
      <p className="mt-6 text-xs text-subtle">GRNT Partners · APEX · Revolut Metal partner path</p>
    </article>
  );
}

function Metric({ k, v, s }: { k: string; v: string; s: string }) {
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
