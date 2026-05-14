export type ChatTimelineItem =
  | { id: string; type: 'date'; label: string }
  | {
      id: string;
      type: 'msg';
      side: 'left' | 'right';
      kind: 'text';
      body: string;
      time: string;
      readReceipt?: boolean;
    }
  | {
      id: string;
      type: 'msg';
      side: 'left';
      kind: 'image';
      uri: string;
      caption: string;
      time: string;
    };

export type ChatPeerMeta = {
  peerName: string;
  avatarUri: string | null;
  status: string;
};

const ALEX_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDG_AD0TywkjFHGdz9sHu9lETTwq38pe7SLPb-buoOzdx_bhdabn56IgFwQOhtEdRTxU446ygbgHQbjTU2MfO0zM7BTh29XmCGbHaEr_UUqz7dvZbnQ0nDUVMoc0AQ-IkH-cQArMwfdYggMq_9G_849mPTFik1o2VVUSzfc5WjMcErtriNYCgTCmdEHGbmqXl7Pet3R1jI1m3DSGf2gRIvsu-eoadqCowLAFwjtZBIeXy30R2uy0lPSGpnbBrfFpYRfB6dzzCIeJO4';

const PALETTE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB_9fs6gtDBvNI1IwTDIC9A7O_hec0hEhnePIcPyuTaKNjsYOYK9_LBK8mZAwLj75kglmUZIe5cpxgjG6XxzJWGSctxHIs6KCKAiPoO9uxjF_1rJZb9wPnA2WW9wSOXV1PqGpnfaTzk-6w6JETavPUhNO4vFgOA-BAysdrPsYsc40A4I5CO6K53OLvA9B6WblEh5kPPKkzMSsnhi9-FMTtarmfwxID_XSXyHEAlG2avs9sFCZ8JO-BhRoRM1zS0oDtuPeXMbjRQJkQ';

/** Demo transcript used for any existing thread id (replace with API by chatId). */
export const DEMO_CHAT_TIMELINE: ChatTimelineItem[] = [
  { id: 'd1', type: 'date', label: 'Today' },
  {
    id: 'm1',
    type: 'msg',
    side: 'left',
    kind: 'text',
    body: "Hello! I've reviewed the documents you sent over this morning. Everything looks perfect for the final presentation.",
    time: '10:24 AM',
  },
  {
    id: 'm2',
    type: 'msg',
    side: 'right',
    kind: 'text',
    body: "That's great news! Should we schedule a quick call to go over the talk track for the third slide?",
    time: '10:26 AM',
    readReceipt: true,
  },
  {
    id: 'm3',
    type: 'msg',
    side: 'left',
    kind: 'text',
    body: "Absolutely. I'm free at 2:00 PM. I also wanted to ask about the feedback from the design team regarding the palette choice.",
    time: '10:28 AM',
  },
  {
    id: 'm4',
    type: 'msg',
    side: 'left',
    kind: 'image',
    uri: PALETTE_IMAGE,
    caption: 'palette_v2_final.png',
    time: '10:28 AM',
  },
  {
    id: 'm5',
    type: 'msg',
    side: 'right',
    kind: 'text',
    body: "They loved the Indigo accents! I think it really emphasizes the 'Premium Minimalism' vibe we're going for.",
    time: '10:30 AM',
    readReceipt: true,
  },
];

const PEER_BY_THREAD: Record<string, ChatPeerMeta> = {
  '1': { peerName: 'Alex Rivera', avatarUri: ALEX_AVATAR, status: 'Online' },
};

export function resolveChatPeer(chatId: string, threadTitle?: string): ChatPeerMeta {
  if (chatId === 'new') {
    return { peerName: 'New chat', avatarUri: null, status: 'Online' };
  }
  if (PEER_BY_THREAD[chatId]) {
    return PEER_BY_THREAD[chatId];
  }
  return {
    peerName: threadTitle?.trim() || 'Chat',
    avatarUri: null,
    status: 'Online',
  };
}

export function getChatTimeline(chatId: string): ChatTimelineItem[] {
  if (chatId === 'new') {
    return [{ id: 'd0', type: 'date', label: 'Today' }];
  }
  return DEMO_CHAT_TIMELINE;
}
