import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getChatTimeline, resolveChatPeer, type ChatTimelineItem } from '../data/chatMock';
import {
  chatQuery,
  DEFAULT_CHAT_MODEL,
  DEFAULT_CHAT_USERNAME,
  fetchConversationMessages,
} from '../service/chatApi';
import { uploadChatAttachment } from '../service/filesApi';
import { messagesToTimeline } from '../utils/chatTimeline';
import { spacing } from '../theme';
import { useAppTheme } from '../state/ThemeContext';
import { ChatComposer } from '../components/molecules/ChatComposer';
import { ChatDateSeparator } from '../components/molecules/ChatDateSeparator';
import { ChatHeaderBar } from '../components/molecules/ChatHeaderBar';
import { ChatImageBubble } from '../components/molecules/ChatImageBubble';
import { ChatTextBubble } from '../components/molecules/ChatTextBubble';
import { ThemedText } from '../components/atoms/ThemedText';

type Props = {
  chatId: string;
  threadTitle?: string;
};

function formatMessageTime(date = new Date()): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function isPersistedConversationId(id: string): boolean {
  return id !== 'new' && id.includes('-');
}

export function ChatScreen({ chatId, threadTitle }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [chatTitle, setChatTitle] = useState(threadTitle?.trim() || 'New chat');
  const peer = resolveChatPeer(chatId, chatTitle);
  const [items, setItems] = useState<ChatTimelineItem[]>(() =>
    chatId === 'new' ? getChatTimeline('new') : [{ id: 'd0', type: 'date', label: 'Today' }],
  );
  const [conversationId, setConversationId] = useState<string | null>(() =>
    isPersistedConversationId(chatId) ? chatId : null,
  );
  const [sending, setSending] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(isPersistedConversationId(chatId));

  useEffect(() => {
    setChatTitle(threadTitle?.trim() || 'New chat');
    if (chatId === 'new') {
      setItems(getChatTimeline('new'));
      setConversationId(null);
      setLoadingHistory(false);
      return;
    }
    if (!isPersistedConversationId(chatId)) {
      setItems(getChatTimeline(chatId));
      setConversationId(null);
      setLoadingHistory(false);
      return;
    }
    setConversationId(chatId);
    setLoadingHistory(true);
    void (async () => {
      try {
        const res = await fetchConversationMessages(chatId);
        setItems(messagesToTimeline(res.items));
      } catch (e) {
        console.error('fetchConversationMessages failed', e);
        setItems([{ id: 'd0', type: 'date', label: 'Today' }]);
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [chatId, threadTitle]);

  const handleSend = useCallback(
    async (text: string) => {
      const optimisticId = `local-${Date.now()}`;
      const optimistic: ChatTimelineItem = {
        id: optimisticId,
        type: 'msg',
        side: 'right',
        kind: 'text',
        body: text,
        time: formatMessageTime(),
        readReceipt: true,
      };
      setItems((prev) => [...prev, optimistic]);
      setSending(true);
      try {
        const res = await chatQuery({
          message: text,
          username: DEFAULT_CHAT_USERNAME,
          conversation_id: conversationId,
          selected_model: DEFAULT_CHAT_MODEL,
        });
        setConversationId(res.conversation_id);
        if (res.title) setChatTitle(res.title);
        const assistant: ChatTimelineItem = {
          id: res.assistant_message_id,
          type: 'msg',
          side: 'left',
          kind: 'text',
          body: res.answer,
          time: formatMessageTime(),
        };
        setItems((prev) => [
          ...prev.map((item) =>
            item.id === optimisticId ? { ...item, id: res.user_message_id } : item,
          ),
          assistant,
        ]);
      } catch (err) {
        console.error(
          'chatQuery failed',
          err,
          '(backend :8000, Ollama :11434, model gemma4:e2b)',
        );
        setItems((prev) => prev.filter((item) => item.id !== optimisticId));
      } finally {
        setSending(false);
      }
    },
    [conversationId],
  );

  const handleAttach = useCallback(async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (picked.canceled || !picked.assets?.[0]) return;

    const asset = picked.assets[0];
    setAttaching(true);
    try {
      const res = await uploadChatAttachment(
        {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? null,
        },
        { conversationId },
      );
      setConversationId(res.conversation_id);
      if (!chatTitle || chatTitle === 'New chat') {
        setChatTitle(res.filename);
      }
      const time = formatMessageTime();
      const isImage = (asset.mimeType ?? '').startsWith('image/');
      const attachmentItem: ChatTimelineItem = isImage
        ? {
            id: res.message_id,
            type: 'msg',
            side: 'right',
            kind: 'image',
            uri: res.url,
            caption: res.filename,
            time,
            readReceipt: true,
          }
        : {
            id: res.message_id,
            type: 'msg',
            side: 'right',
            kind: 'text',
            body: `📎 ${res.filename}`,
            time,
            readReceipt: true,
          };
      setItems((prev) => [...prev, attachmentItem]);
    } catch (err) {
      console.error('uploadChatAttachment failed', err, '(MinIO on :9000, backend :8000)');
    } finally {
      setAttaching(false);
    }
  }, [conversationId, chatTitle]);

  const topPad = insets.top + spacing.navHeight;
  const hasMessages = items.some((i) => i.type === 'msg');
  const composerReserve = 88 + Math.max(insets.bottom, spacing.unit * 6);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar style={theme.id === 'dark' ? 'light' : 'dark'} />
      <ChatHeaderBar peer={{ ...peer, peerName: chatTitle }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPad + spacing.unit * 4,
            paddingHorizontal: spacing.marginMobile,
            paddingBottom: spacing.stackLg + composerReserve,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {items.map((item, index) => (
          <View
            key={item.id}
            style={index < items.length - 1 ? { marginBottom: spacing.unit * 4 } : undefined}
          >
            <TimelineBlock item={item} />
          </View>
        ))}
        {loadingHistory ? (
          <ThemedText variant="bodyMd" center style={{ marginTop: spacing.unit * 2 }}>
            Loading conversation…
          </ThemedText>
        ) : null}
        {!loadingHistory && !hasMessages ? (
          <ThemedText variant="bodyMd" center style={{ marginTop: spacing.unit * 2 }}>
            Send a message to start the conversation.
          </ThemedText>
        ) : null}
      </ScrollView>
      <ChatComposer
        onSend={handleSend}
        onAttach={handleAttach}
        sending={sending}
        attaching={attaching}
      />
    </KeyboardAvoidingView>
  );
}

function TimelineBlock({ item }: { item: ChatTimelineItem }) {
  if (item.type === 'date') {
    return <ChatDateSeparator label={item.label} />;
  }
  if (item.type === 'msg' && item.kind === 'text') {
    return (
      <ChatTextBubble
        side={item.side}
        body={item.body}
        time={item.time}
        readReceipt={item.readReceipt}
      />
    );
  }
  if (item.type === 'msg' && item.kind === 'image') {
    return (
      <ChatImageBubble
        side={item.side}
        uri={item.uri}
        caption={item.caption}
        time={item.time}
        readReceipt={item.readReceipt}
      />
    );
  }
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
});
