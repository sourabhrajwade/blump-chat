import { getJson, postJson } from './api';

/** Ollama model for chat completions (must be pulled locally). */
export const DEFAULT_CHAT_MODEL = 'gemma4:e2b';

/** Default demo user until auth is wired. */
export const DEFAULT_CHAT_USERNAME = 'demo-user';

export type ChatQueryRequest = {
  message: string;
  username: string;
  conversation_id?: string | null;
  selected_model: string;
};

export type ChatQueryResponse = {
  conversation_id: string;
  user_message_id: string;
  assistant_message_id: string;
  user_id: string;
  agent_id: string;
  title?: string | null;
  answer: string;
  citations: Array<{
    file_id?: string | null;
    chunk_index?: number | null;
    text: string;
    score?: number | null;
  }>;
  model_used: string;
};

/** Send message, persist to MongoDB, and get an Ollama LLM reply. */
export async function chatQuery(body: ChatQueryRequest): Promise<ChatQueryResponse> {
  return postJson<ChatQueryRequest, ChatQueryResponse>('/chat/query', body);
}

export type SaveMessageRequest = {
  message: string;
  username: string;
  conversation_id?: string | null;
  model?: string | null;
};

export type SaveMessageResponse = {
  conversation_id: string;
  message_id: string;
  message_ids: string[];
  created: boolean;
};

/** Persist only (no LLM). Prefer chatQuery for send in the chat UI. */
export async function saveChatMessage(
  body: SaveMessageRequest,
): Promise<SaveMessageResponse> {
  return postJson<SaveMessageRequest, SaveMessageResponse>('/chat/messages', body);
}

export type ConversationListItem = {
  id: string;
  title?: string | null;
  preview?: string | null;
  updated_at: string;
  message_count: number;
};

export type ConversationListResponse = {
  items: ConversationListItem[];
};

export async function listConversations(
  username: string = DEFAULT_CHAT_USERNAME,
  limit = 50,
): Promise<ConversationListResponse> {
  const q = new URLSearchParams({ username, limit: String(limit) });
  return getJson<ConversationListResponse>(`/chat/conversations?${q}`);
}

export type MessageHistoryItem = {
  id: string;
  role: string;
  user_id?: string | null;
  agent_id?: string | null;
  content_type: string;
  content: string;
  model?: string | null;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export type PaginatedMessagesResponse = {
  items: MessageHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
};

export async function fetchConversationMessages(
  conversationId: string,
  username: string = DEFAULT_CHAT_USERNAME,
  page = 1,
  pageSize = 100,
): Promise<PaginatedMessagesResponse> {
  const q = new URLSearchParams({
    username,
    page: String(page),
    page_size: String(pageSize),
  });
  return getJson<PaginatedMessagesResponse>(
    `/chat/conversations/${conversationId}/messages?${q}`,
  );
}
