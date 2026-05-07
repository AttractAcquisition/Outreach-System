import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addSuppressionEntry,
  approveWhatsAppSuggestion,
  archiveWhatsAppTemplate,
  createWhatsAppTemplate,
  generateWhatsAppReplySuggestion,
  getWhatsAppAnalytics,
  getWhatsAppCampaignLeads,
  getWhatsAppIntegrationHealth,
  getWhatsAppPendingSuggestions,
  getWhatsAppTemplates,
  getSuppressionList,
  getWhatsAppConversations,
  getWhatsAppMessages,
  isPhoneSuppressed,
  markWhatsAppSuggestionUsed,
  removeSuppressionEntry,
  rejectWhatsAppSuggestion,
  sendWhatsAppMessage,
  sendWhatsAppTemplateMessage,
  syncWhatsAppTemplates,
  updateWhatsAppTemplate,
  type AddSuppressionEntryInput,
  type WhatsAppTemplateInput,
} from "./api";
import type {
  CampaignLead,
  CrmStage,
  OutreachQueueItem,
  ProspectDetails,
  SuppressionRecord,
  WhatsAppAnalyticsRange,
  WhatsAppAnalyticsSummary,
  WhatsAppCampaignLead,
  WhatsAppIntegrationHealth,
  WhatsAppSuppressionEntry,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppPendingSuggestion,
  WhatsAppReplySuggestion,
  WhatsAppTemplate,
} from "./types";

const suppressionListQueryKey = ["whatsapp", "suppression-list"] as const;
const whatsAppTemplatesQueryKey = ["whatsapp", "templates"] as const;
const conversationsQueryKey = ["whatsapp", "conversations"] as const;
const pendingSuggestionsQueryKey = ["whatsapp", "pending-suggestions"] as const;
const analyticsQueryKey = (range: WhatsAppAnalyticsRange) =>
  ["whatsapp", "analytics", range] as const;
const campaignLeadsQueryKey = (range: WhatsAppAnalyticsRange) =>
  ["whatsapp", "campaign-leads", range] as const;
const integrationHealthQueryKey = ["whatsapp", "integration-health"] as const;
const conversationMessagesQueryKey = (conversationId: string | null) =>
  ["whatsapp", "messages", conversationId] as const;

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

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      body,
    }: {
      conversationId: string;
      body: string;
    }) => sendWhatsAppMessage(conversationId, body),
    onSuccess: async (message) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: conversationsQueryKey }),
        queryClient.invalidateQueries({
          queryKey: conversationMessagesQueryKey(message.conversation_id),
        }),
      ]);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not send WhatsApp message",
      );
    },
  });
}

export function useSendWhatsAppTemplateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      templateId,
      parameters,
    }: {
      conversationId: string;
      templateId: string;
      parameters: Record<string, string>;
    }) => sendWhatsAppTemplateMessage(conversationId, templateId, parameters),
    onSuccess: async (message) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: conversationsQueryKey }),
        queryClient.invalidateQueries({
          queryKey: conversationMessagesQueryKey(message.conversation_id),
        }),
      ]);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not send WhatsApp template message",
      );
    },
  });
}

export function useGenerateWhatsAppReplySuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      generateWhatsAppReplySuggestion(conversationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pendingSuggestionsQueryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not generate AI reply suggestion",
      );
    },
  });
}

export function useWhatsAppPendingSuggestions() {
  const query = useQuery({
    queryKey: pendingSuggestionsQueryKey,
    queryFn: getWhatsAppPendingSuggestions,
  });

  return {
    suggestions: (query.data ?? []) as WhatsAppPendingSuggestion[],
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : null,
    reload: query.refetch,
  };
}

export function useApproveWhatsAppSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveWhatsAppSuggestion(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pendingSuggestionsQueryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not approve WhatsApp suggestion",
      );
    },
  });
}

export function useRejectWhatsAppSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectWhatsAppSuggestion(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pendingSuggestionsQueryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not reject WhatsApp suggestion",
      );
    },
  });
}

export function useMarkWhatsAppSuggestionUsed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markWhatsAppSuggestionUsed(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pendingSuggestionsQueryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not mark WhatsApp suggestion used",
      );
    },
  });
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
  const query = useQuery({
    queryKey: whatsAppTemplatesQueryKey,
    queryFn: getWhatsAppTemplates,
  });

  return {
    templates: (query.data ?? []) as WhatsAppTemplate[],
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : null,
    reload: query.refetch,
  };
}

export function useCreateWhatsAppTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WhatsAppTemplateInput) => createWhatsAppTemplate(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: whatsAppTemplatesQueryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not create WhatsApp template",
      );
    },
  });
}

export function useUpdateWhatsAppTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<WhatsAppTemplateInput>;
    }) => updateWhatsAppTemplate(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: whatsAppTemplatesQueryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not update WhatsApp template",
      );
    },
  });
}

export function useArchiveWhatsAppTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveWhatsAppTemplate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: whatsAppTemplatesQueryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not archive WhatsApp template",
      );
    },
  });
}

export function useSyncWhatsAppTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncWhatsAppTemplates,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: whatsAppTemplatesQueryKey });
      toast.success(
        `Synced ${result.fetched} Meta templates (${result.inserted} new, ${result.updated} updated)`,
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not sync WhatsApp templates",
      );
    },
  });
}

// ─── Suppression ─────────────────────────────────────────────────
export function useSuppressionList() {
  const query = useQuery({
    queryKey: suppressionListQueryKey,
    queryFn: getSuppressionList,
  });

  return {
    records: (query.data ?? []) as WhatsAppSuppressionEntry[],
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : null,
    reload: query.refetch,
  };
}

export function useAddSuppressionEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddSuppressionEntryInput) => addSuppressionEntry(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: suppressionListQueryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not add suppression entry",
      );
    },
  });
}

export function useRemoveSuppressionEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeSuppressionEntry(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: suppressionListQueryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not remove suppression entry",
      );
    },
  });
}

export function useIsPhoneSuppressed(normalizedPhoneNumber: string) {
  return useQuery({
    queryKey: ["whatsapp", "suppression-check", normalizedPhoneNumber],
    queryFn: () => isPhoneSuppressed(normalizedPhoneNumber),
    enabled: normalizedPhoneNumber.length > 0,
  });
}

// ─── Analytics ──────────────────────────────────────────────────
export function useWhatsAppAnalytics(range: WhatsAppAnalyticsRange = "7d") {
  const query = useQuery({
    queryKey: analyticsQueryKey(range),
    queryFn: () => getWhatsAppAnalytics(range),
  });

  return {
    analytics: query.data as WhatsAppAnalyticsSummary | undefined,
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : null,
    reload: query.refetch,
  };
}

// ─── Campaign leads ──────────────────────────────────────────────
export function useCampaignLeads(range: WhatsAppAnalyticsRange = "7d") {
  const query = useQuery({
    queryKey: campaignLeadsQueryKey(range),
    queryFn: () => getWhatsAppCampaignLeads(range),
  });

  return {
    leads: (query.data ?? []) as WhatsAppCampaignLead[],
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : null,
    reload: query.refetch,
  };
}

// ─── Integration health ──────────────────────────────────────────
export function useWhatsAppIntegrationHealth() {
  const query = useQuery({
    queryKey: integrationHealthQueryKey,
    queryFn: getWhatsAppIntegrationHealth,
  });

  return {
    health: query.data as WhatsAppIntegrationHealth | undefined,
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : null,
    reload: query.refetch,
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
  conversationId: string,
  body: string,
) {
  try {
    const message = await sendWhatsAppMessage(conversationId, body);
    return { ok: true, message };
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : "Could not send WhatsApp message",
    );
    return { ok: false };
  }
}

export async function sendTemplateMessage(
  conversationId: string,
  templateId: string,
  params: Record<string, string>,
) {
  try {
    const message = await sendWhatsAppTemplateMessage(
      conversationId,
      templateId,
      params,
    );
    return { ok: true, message };
  } catch (err) {
    toast.error(
      err instanceof Error
        ? err.message
        : "Could not send WhatsApp template message",
    );
    return { ok: false };
  }
}

export async function generateAIReply(conversationId: string) {
  try {
    return await generateWhatsAppReplySuggestion(conversationId);
  } catch (err) {
    toast.error(
      err instanceof Error
        ? err.message
        : "Could not generate AI reply suggestion",
    );
    return null;
  }
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
  WhatsAppAnalyticsRange,
  WhatsAppAnalyticsSummary,
  WhatsAppCampaignLead,
  WhatsAppIntegrationHealth,
  WhatsAppSuppressionEntry,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppPendingSuggestion,
  WhatsAppReplySuggestion,
  WhatsAppTemplate,
};
