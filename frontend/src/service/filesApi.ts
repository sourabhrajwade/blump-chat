import { resolveApiBase } from './api';
import { DEFAULT_CHAT_USERNAME } from './chatApi';

export type AttachFileResponse = {
  conversation_id: string;
  file_id: string;
  url: string;
  message_id: string;
  filename: string;
  created: boolean;
};

export type PickedFile = {
  uri: string;
  name: string;
  mimeType: string | null;
};

export async function uploadChatAttachment(
  file: PickedFile,
  options?: {
    username?: string;
    conversationId?: string | null;
  },
): Promise<AttachFileResponse> {
  const username = options?.username ?? DEFAULT_CHAT_USERNAME;
  const form = new FormData();
  form.append('username', username);
  if (options?.conversationId) {
    form.append('conversation_id', options.conversationId);
  }
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  } as unknown as Blob);

  const res = await fetch(`${resolveApiBase()}/chat/attachments`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: form,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Upload failed: ${res.status}${detail ? ` ${detail}` : ''}`);
  }
  return res.json() as Promise<AttachFileResponse>;
}
