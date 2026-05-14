import { CircleHelp, Globe, Megaphone, Send, Share2, UserSquare2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationSource } from "../types";

const map: Record<
  ConversationSource,
  { icon: React.ComponentType<{ className?: string }>; cls: string }
> = {
  "Meta Ad": { icon: Megaphone, cls: "bg-primary/20 text-sky border-primary/40" },
  Outbound: { icon: Send, cls: "bg-secondary text-foreground border-border" },
  Manual: { icon: UserSquare2, cls: "bg-secondary text-foreground border-border" },
  Website: { icon: Globe, cls: "bg-secondary text-foreground border-border" },
  Referral: { icon: Share2, cls: "bg-secondary text-foreground border-border" },
  Unknown: { icon: CircleHelp, cls: "bg-muted text-muted-foreground border-border" },
};

export function SourceBadge({
  source,
  size = "sm",
}: {
  source: ConversationSource;
  size?: "sm" | "md";
}) {
  const { icon: Icon, cls } = map[source];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        cls,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {source}
    </span>
  );
}
