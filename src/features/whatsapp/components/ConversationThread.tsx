import { useEffect, useRef, useState } from "react";
import {
  CalendarPlus,
  Heart,
  MoreHorizontal,
  Phone,
  ShieldX,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceWindowBadge } from "./ServiceWindowBadge";
import { CrmStageBadge } from "./CrmStageBadge";
import { SourceBadge } from "./SourceBadge";
import { MessageBubble } from "./MessageBubble";
import { ReplyComposer } from "./ReplyComposer";
import { EmptyState } from "./EmptyState";
import { ConfirmActionModal } from "./ConfirmActionModal";
import {
  markDoNotContact,
  updateCRMStage,
  useConversationMessages,
} from "../hooks";
import type { WhatsAppConversation, WhatsAppMessage } from "../types";

interface Props {
  conversation: WhatsAppConversation | null;
  onOpenProspect?: () => void;
  onUpdate?: (id: string, patch: Partial<WhatsAppConversation>) => void;
}

export function ConversationThread({
  conversation,
  onOpenProspect,
  onUpdate,
}: Props) {
  const { messages, loading, error, appendMessage } = useConversationMessages(
    conversation?.id ?? null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [confirmDNCOpen, setConfirmDNCOpen] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          icon={UserCircle2}
          title="Select a conversation"
          description="Pick a conversation from the list to view messages and reply."
        />
      </div>
    );
  }

  const c = conversation;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="truncate font-semibold text-base">{c.business_name}</h2>
            {c.suppressed && (
              <span className="inline-flex items-center gap-1 text-[11px] text-destructive">
                <ShieldX className="h-3 w-3" /> suppressed
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {c.contact_name} · {c.phone_number}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <CrmStageBadge stage={c.crm_stage} />
            <SourceBadge source={c.source} />
            <ServiceWindowBadge conversation={c} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              void updateCRMStage(c.prospect_id, "Interested");
              onUpdate?.(c.id, { crm_stage: "Interested" });
            }}
          >
            <Heart className="h-4 w-4" />
            <span className="hidden md:inline">Interested</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              void updateCRMStage(c.prospect_id, "Call Booked");
              onUpdate?.(c.id, { crm_stage: "Call Booked" });
            }}
          >
            <CalendarPlus className="h-4 w-4" />
            <span className="hidden md:inline">Book call</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onOpenProspect}>
                <Phone className="h-4 w-4" /> View prospect
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDNCOpen(true)}
              >
                <ShieldX className="h-4 w-4" /> Mark Do Not Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 bg-[radial-gradient(ellipse_at_top,hsl(266_100%_18%_/_0.12),transparent_60%)]"
      >
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-12 rounded-2xl bg-card/40 animate-pulse w-2/3 ${
                  i % 2 ? "ml-auto" : ""
                }`}
              />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Could not load messages"
            description={error}
          />
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="No message data source is connected yet."
          />
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      <ReplyComposer
        conversation={c}
        onMessageSent={(msg: WhatsAppMessage) => {
          appendMessage(msg);
          onUpdate?.(c.id, {
            last_message: msg.body,
            last_message_at: msg.created_at,
          });
        }}
      />

      <ConfirmActionModal
        open={confirmDNCOpen}
        onOpenChange={setConfirmDNCOpen}
        title="Mark contact as Do Not Contact?"
        description="This will block future outbound messages and add the contact to the suppression list."
        confirmLabel="Mark Do Not Contact"
        destructive
        onConfirm={() => {
          setConfirmDNCOpen(false);
          void markDoNotContact(c.prospect_id);
          onUpdate?.(c.id, {
            crm_stage: "Do Not Contact",
            suppressed: true,
            opt_out: true,
          });
        }}
      />
    </div>
  );
}
