import type { ChatTimelineItem } from '../data/chatMock';
import type { MessageHistoryItem } from '../service/chatApi';
import { formatMessageTimeFromIso } from './chatTime';

export function messagesToTimeline(messages: MessageHistoryItem[]): ChatTimelineItem[] {
  if (messages.length === 0) {
    return [{ id: 'd0', type: 'date', label: 'Today' }];
  }
  const first = new Date(messages[0].created_at);
  const label = Number.isNaN(first.getTime())
    ? 'Today'
    : first.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  const items: ChatTimelineItem[] = [{ id: 'd0', type: 'date', label }];
  for (const m of messages) {
    const side = m.role === 'user' ? 'right' : 'left';
    const meta = m.metadata ?? {};
    const mime = typeof meta.mime_type === 'string' ? meta.mime_type : '';
    const filename =
      typeof meta.filename === 'string' ? meta.filename : 'attachment';
    const url =
      typeof meta.url === 'string'
        ? meta.url
        : typeof m.content === 'string' && m.content.startsWith('http')
          ? m.content
          : '';

    if (m.content_type === 'image' && url) {
      items.push({
        id: m.id,
        type: 'msg',
        side,
        kind: 'image',
        uri: url,
        caption: filename,
        time: formatMessageTimeFromIso(m.created_at),
      });
      continue;
    }

    const body =
      typeof m.content === 'string' ? m.content : JSON.stringify(m.content ?? '');
    items.push({
      id: m.id,
      type: 'msg',
      side,
      kind: 'text',
      body,
      time: formatMessageTimeFromIso(m.created_at),
      readReceipt: m.role === 'user',
    });
  }
  return items;
}
