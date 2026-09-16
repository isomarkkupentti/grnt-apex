import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  children,
}: {
  className?: string;
  tone?: "muted" | "good" | "bad" | "hot";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide",
        tone === "muted" && "bg-elevated text-muted-foreground",
        tone === "good" && "bg-good/15 text-good",
        tone === "bad" && "bg-bad/15 text-bad",
        tone === "hot" && "bg-primary text-primary-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
