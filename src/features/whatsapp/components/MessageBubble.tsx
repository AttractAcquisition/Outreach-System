import { CheckCheck, AlertTriangle, Clock, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WhatsAppMessage } from "../types";

function timeShort(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusIcon({ status }: { status: WhatsAppMessage["status"] }) {
  if (status === "failed")
    return <AlertTriangle className="h-3 w-3 text-destructive" />;
  if (status === "queued") return <Clock className="h-3 w-3 opacity-70" />;
  if (status === "sent") return <CheckCheck className="h-3 w-3 opacity-60" />;
  if (status === "delivered")
    return <CheckCheck className="h-3 w-3 opacity-90" />;
  if (status === "read")
    return <CheckCheck className="h-3 w-3 text-accent" />;
  return null;
}

function senderLabel(message: WhatsAppMessage) {
  if (message.sender_type === "ai") return "AI";
  if (message.sender_type === "human") return "Human";
  if (message.sender_type === "system") return "System";
  if (message.direction === "inbound") return "Contact";
  return "Operator";
}

export function MessageBubble({ message }: { message: WhatsAppMessage }) {
  if (message.direction === "system") {
    return (
      <div className="flex justify-center my-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 border border-border px-3 py-1 text-[11px] text-muted-foreground">
          <Info className="h-3 w-3" />
          {message.body}
          <span className="opacity-60">· {timeShort(message.created_at)}</span>
        </div>
      </div>
    );
  }

  const isOut = message.direction === "outbound";
  const isTemplate = message.message_type === "template";
  const isAIDraft = message.message_type === "ai_draft";

  return (
    <div className={cn("flex w-full mb-2", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] lg:max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-card",
          isOut
            ? "bg-gradient-brand text-primary-foreground rounded-br-md"
            : "bg-card border border-border text-card-foreground rounded-bl-md",
        )}
      >
        {(isTemplate || isAIDraft) && (
          <div
            className={cn(
              "inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-semibold mb-1 rounded-full px-2 py-0.5",
              isAIDraft
                ? "bg-warning/20 text-warning"
                : isOut
                  ? "bg-white/15 text-primary-foreground"
                  : "bg-sky/20 text-sky",
            )}
          >
            {isAIDraft ? (
              <>
                <Sparkles className="h-3 w-3" />
                AI Draft
              </>
            ) : (
              <>Template · {message.template_name}</>
            )}
          </div>
        )}
        <div
          className={cn(
            "mb-1 text-[10px] font-medium uppercase tracking-wide",
            isOut ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {senderLabel(message)}
          {message.human_approved && " · Approved"}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1.5 text-[10px]",
            isOut ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          <span className="font-mono">{timeShort(message.created_at)}</span>
          {isOut && (
            <>
              <span className="font-mono">{message.status}</span>
              <StatusIcon status={message.status} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
