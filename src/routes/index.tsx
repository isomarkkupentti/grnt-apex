import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/apex/shell";
import { TerminalView } from "@/components/apex/terminal-view";
import { WedgeView } from "@/components/apex/wedge-view";
import { MatrixView } from "@/components/apex/matrix-view";
import { RoadmapView } from "@/components/apex/roadmap-view";
import { ScenarioView } from "@/components/apex/scenario-view";
import { DeckView } from "@/components/apex/deck-view";
import { PnpView } from "@/components/apex/pnp-view";
import { LenderView } from "@/components/apex/lender-view";
import { useTerminal } from "@/store/terminal";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const tab = useTerminal((s) => s.tab);
  return (
    <Shell>
      {tab === "deck" && <DeckView />}
      {tab === "terminal" && <TerminalView />}
      {tab === "wedge" && <WedgeView />}
      {tab === "matrix" && <MatrixView />}
      {tab === "roadmap" && <RoadmapView />}
      {tab === "pnp" && <PnpView />}
      {tab === "lender" && <LenderView />}
      {tab === "scenario" && <ScenarioView />}
    </Shell>
  );
}
