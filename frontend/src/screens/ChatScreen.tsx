import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getChatTimeline, resolveChatPeer, type ChatTimelineItem } from '../data/chatMock';
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

export function ChatScreen({ chatId, threadTitle }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const peer = resolveChatPeer(chatId, threadTitle);
  const items = getChatTimeline(chatId);
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
      <ChatHeaderBar peer={peer} />
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
        {!hasMessages ? (
          <ThemedText variant="bodyMd" center style={{ marginTop: spacing.unit * 2 }}>
            Send a message to start the conversation.
          </ThemedText>
        ) : null}
      </ScrollView>
      <ChatComposer />
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
    return <ChatImageBubble uri={item.uri} caption={item.caption} time={item.time} />;
  }
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
});
