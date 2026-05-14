import { cn } from "@/lib/utils";
import type { CrmStage } from "../types";

const stageStyles: Record<CrmStage, string> = {
  New: "bg-secondary text-foreground border-border",
  Contacted: "bg-secondary text-foreground border-border",
  Replied: "bg-sky/20 text-sky border-sky/30",
  Interested: "bg-accent/20 text-accent border-accent/40",
  Qualified: "bg-accent/20 text-accent border-accent/40",
  "Report Requested": "bg-accent/15 text-accent border-accent/30",
  "Report Sent": "bg-accent/15 text-accent border-accent/30",
  "Call Booked": "bg-success/15 text-success border-success/30",
  "Proof Sprint Offered": "bg-primary/20 text-sky border-primary/40",
  Won: "bg-success/20 text-success border-success/30",
  Lost: "bg-muted text-muted-foreground border-border",
  "Not Interested": "bg-muted text-muted-foreground border-border",
  "Do Not Contact": "bg-destructive/15 text-destructive border-destructive/30",
};

export function CrmStageBadge({
  stage,
  size = "sm",
}: {
  stage: CrmStage;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        stageStyles[stage],
      )}
    >
      {stage}
    </span>
  );
}

export const CRM_STAGES: CrmStage[] = [
  "New",
  "Contacted",
  "Replied",
  "Interested",
  "Qualified",
  "Report Requested",
  "Report Sent",
  "Call Booked",
  "Proof Sprint Offered",
  "Won",
  "Lost",
  "Not Interested",
  "Do Not Contact",
];
