import { useMemo, useState } from "react";
import { Search, MessagesSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ConversationCard } from "./ConversationCard";
import { EmptyState } from "./EmptyState";
import type { WhatsAppConversation } from "../types";
import { getWindowState } from "../hooks";

const FILTER_CHIPS = [
  "All",
  "Unread",
  "Window Open",
  "Window Closed",
  "Needs Human",
  "Needs Reply",
  "Booked Call",
  "Archived",
] as const;

type ChipFilter = (typeof FILTER_CHIPS)[number];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest reply" },
  { value: "intent", label: "Highest intent" },
  { value: "closing", label: "Window closing soon" },
  { value: "unread", label: "Unread first" },
] as const;

interface Props {
  conversations: WhatsAppConversation[];
  loading: boolean;
  error?: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  loading,
  error,
  selectedId,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ChipFilter>("All");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>(
    "newest",
  );

  const filtered = useMemo(() => {
    let list = [...conversations];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.business_name.toLowerCase().includes(q) ||
          c.contact_name.toLowerCase().includes(q) ||
          c.phone_number.toLowerCase().includes(q) ||
          c.last_message.toLowerCase().includes(q),
      );
    }
    list = list.filter((c) => {
      switch (filter) {
        case "Unread":
          return c.unread_count > 0;
        case "Window Open":
          return c.service_window_status === "open";
        case "Window Closed":
          return c.service_window_status === "closed";
        case "Needs Human":
          return !!c.needs_human;
        case "Needs Reply":
          return c.stage === "needs_reply" || c.unread_count > 0;
        case "Booked Call":
          return c.stage === "booked";
        case "Archived":
          return c.status === "archived";
        default:
          return true;
      }
    });

    list.sort((a, b) => {
      switch (sort) {
        case "intent":
          return b.lead_score - a.lead_score;
        case "closing": {
          const aL = getWindowState(a).msLeft || Number.POSITIVE_INFINITY;
          const bL = getWindowState(b).msLeft || Number.POSITIVE_INFINITY;
          return aL - bL;
        }
        case "unread":
          return b.unread_count - a.unread_count;
        case "newest":
        default:
          return (
            new Date(b.last_message_at).getTime() -
            new Date(a.last_message_at).getTime()
          );
      }
    });

    return list;
  }, [conversations, query, filter, sort]);

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 border-b border-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, business, phone…"
            className="pl-9 bg-secondary/60 border-border rounded-xl"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setFilter(chip)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                filter === chip
                  ? "bg-gradient-brand text-primary-foreground border-transparent"
                  : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground",
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="h-8 text-xs bg-secondary/60 border-border rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                Sort: {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-card/40 border border-border animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={MessagesSquare}
            title="Could not load conversations"
            description={error}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="No conversations"
            description="No WhatsApp conversations yet. Once inbound messages or approved outbound outreach starts, conversations will appear here."
          />
        ) : (
          filtered.map((c) => (
            <ConversationCard
              key={c.id}
              conversation={c}
              active={selectedId === c.id}
              onSelect={() => onSelect(c.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
