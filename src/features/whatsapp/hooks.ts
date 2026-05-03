import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getWhatsAppConversations, getWhatsAppMessages } from "./api";
import type {
  CampaignLead,
  CrmStage,
  OutreachQueueItem,
  ProspectDetails,
  SuppressionRecord,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppTemplate,
} from "./types";

// ─── Conversations ───────────────────────────────────────────────
export function useWhatsAppConversations() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rows = await getWhatsAppConversations();
      setConversations(rows);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load WhatsApp conversations",
      );
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const updateConversation = useCallback(
    (id: string, patch: Partial<WhatsAppConversation>) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      );
    },
    [],
  );

  return {
    conversations,
    loading,
    error,
    reload: loadConversations,
    updateConversation,
  };
}

// ─── Messages for a conversation ─────────────────────────────────
export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rows = await getWhatsAppMessages(conversationId);
      setMessages(rows);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load WhatsApp messages",
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const appendMessage = useCallback((msg: WhatsAppMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return {
    messages: conversationId ? messages : [],
    loading,
    error,
    reload: loadMessages,
    appendMessage,
  };
}

// ─── Outreach queue ──────────────────────────────────────────────
export function useOutreachQueue() {
  // TODO: Connect this hook to the real outreach queue Supabase source once available.
  const [queue, setQueue] = useState<OutreachQueueItem[]>([]);

  const update = useCallback(
    (id: string, patch: Partial<OutreachQueueItem>) =>
      setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q))),
    [],
  );

  return { queue, loading: false, error: null as string | null, update };
}

// ─── Templates ───────────────────────────────────────────────────
export function useWhatsAppTemplates() {
  // TODO: Connect this hook to the real WhatsApp templates Supabase source once available.
  return {
    templates: [] as WhatsAppTemplate[],
    loading: false,
    error: null as string | null,
  };
}

// ─── Suppression ─────────────────────────────────────────────────
export function useSuppressionList() {
  // TODO: Connect this hook to the real suppression list Supabase source once available.
  const add = useCallback((_rec: SuppressionRecord) => {
    toast.error("Suppression data source is not configured");
  }, []);
  const remove = useCallback((_id: string) => {
    toast.error("Suppression data source is not configured");
  }, []);

  return {
    records: [] as SuppressionRecord[],
    loading: false,
    error: null as string | null,
    add,
    remove,
  };
}

// ─── Campaign leads ──────────────────────────────────────────────
export function useCampaignLeads() {
  // TODO: Connect this hook to the real campaign leads Supabase source once available.
  return {
    leads: [] as CampaignLead[],
    loading: false,
    error: null as string | null,
  };
}

// ─── Prospect details ────────────────────────────────────────────
export function useProspect(conv: WhatsAppConversation | null) {
  // TODO: Connect this hook to the real prospect details Supabase source once available.
  void conv;
  return null;
}

// ─── Service-window helper ───────────────────────────────────────
export function getWindowState(conv: WhatsAppConversation | null) {
  if (!conv || !conv.service_window_expires_at) {
    return { status: "closed" as const, msLeft: 0 };
  }
  const msLeft = new Date(conv.service_window_expires_at).getTime() - Date.now();
  if (msLeft <= 0) return { status: "closed" as const, msLeft: 0 };
  if (msLeft < 4 * 60 * 60 * 1000)
    return { status: "closing_soon" as const, msLeft };
  return { status: "open" as const, msLeft };
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return "0h";
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

// ─── Backend actions ─────────────────────────────────────────────
export async function sendFreeformMessage(
  _conversationId: string,
  _body: string,
) {
  toast.error("Message sending is not connected to a backend yet");
  return { ok: false };
}

export async function sendTemplateMessage(
  _conversationId: string,
  _templateName: string,
  _params: Record<string, string>,
) {
  toast.error("Template sending is not connected to a backend yet");
  return { ok: false };
}

export async function generateAIReply(_conversationId: string) {
  toast.error("AI reply generation is not connected to a backend yet");
  return null;
}

export async function approveQueueItem(_id: string) {
  toast.error("Outreach approvals are not connected to a backend yet");
  return { ok: false };
}

export async function rejectQueueItem(_id: string) {
  toast.error("Outreach rejection is not connected to a backend yet");
  return { ok: false };
}

export async function markDoNotContact(_prospectId: string) {
  toast.error("Do Not Contact updates are not connected to a backend yet");
  return { ok: false };
}

export async function updateCRMStage(_prospectId: string, stage: CrmStage) {
  void stage;
  toast.error("CRM stage updates are not connected to a backend yet");
  return { ok: false };
}

export async function saveInternalNote(_prospectId: string, _note: string) {
  toast.error("Internal notes are not connected to a backend yet");
  return { ok: false };
}

// Re-exports for type-only imports
export type {
  CampaignLead,
  OutreachQueueItem,
  ProspectDetails,
  SuppressionRecord,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppTemplate,
};
