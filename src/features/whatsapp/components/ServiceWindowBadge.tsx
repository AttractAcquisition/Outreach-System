import { Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCountdown, getWindowState } from "../hooks";
import type { WhatsAppConversation } from "../types";

interface Props {
  conversation: WhatsAppConversation | null;
  size?: "sm" | "md";
  showCountdown?: boolean;
}

export function ServiceWindowBadge({
  conversation,
  size = "sm",
  showCountdown = true,
}: Props) {
  const { status, msLeft } = getWindowState(conversation);

  const styles =
    status === "open"
      ? "bg-success/15 text-success border-success/30"
      : status === "closing_soon"
        ? "bg-warning/15 text-warning border-warning/30"
        : "bg-muted text-muted-foreground border-border";

  const Icon =
    status === "closed" ? ShieldAlert : status === "open" ? ShieldCheck : Clock;

  const label =
    status === "open"
      ? "Window open"
      : status === "closing_soon"
        ? "Closing soon"
        : "Window closed";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        styles,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span>{label}</span>
      {showCountdown && status !== "closed" && (
        <span className="opacity-80">· {formatCountdown(msLeft)} left</span>
      )}
    </span>
  );
}
