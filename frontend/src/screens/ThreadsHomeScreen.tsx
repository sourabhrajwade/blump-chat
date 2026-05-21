import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOCK_TOPIC_CHIPS, type ThreadListEntry } from '../data/threadsMock';
import { DEFAULT_CHAT_USERNAME, listConversations } from '../service/chatApi';
import { formatThreadTimeLabel } from '../utils/chatTime';
import { spacing } from '../theme';
import { useAppNavigation } from '../state/NavigationContext';
import { useAppTheme } from '../state/ThemeContext';
import { FabNewChat } from '../components/molecules/FabNewChat';
import { ThreadRowItem } from '../components/molecules/ThreadRowItem';
import { ThreadsAppBar } from '../components/molecules/ThreadsAppBar';
import { ThreadsBottomNav } from '../components/molecules/ThreadsBottomNav';
import { TopicQuickActionsRow } from '../components/molecules/TopicQuickActionsRow';
import { ThemedText } from '../components/atoms/ThemedText';

function toThreadEntry(
  row: {
    id: string;
    title?: string | null;
    preview?: string | null;
    updated_at: string;
  },
  index: number,
): ThreadListEntry {
  const isFirst = index === 0;
  return {
    id: row.id,
    title: row.title?.trim() || 'New chat',
    timeLabel: formatThreadTimeLabel(row.updated_at),
    preview: row.preview?.trim() || 'No messages yet',
    icon: 'smart-toy',
    iconVariant: isFirst ? 'accent' : 'muted',
    previewEmphasis: isFirst ? 'strong' : 'subtle',
    timeEmphasis: isFirst ? 'primary' : 'muted',
    pinned: isFirst,
  };
}

export function ThreadsHomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { goToChat } = useAppNavigation();
  const [threads, setThreads] = useState<ThreadListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listConversations(DEFAULT_CHAT_USERNAME);
      setThreads(res.items.map(toThreadEntry));
    } catch (e) {
      console.error('listConversations failed', e);
      setError('Could not load conversations. Is the backend running?');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  const topPad = insets.top + spacing.navHeight;
  const bottomInset = Math.max(insets.bottom, spacing.unit * 4);
  const bottomChrome = 64 + bottomInset;
  const scrollBottomPad = bottomChrome + 72;
  const fabBottom = bottomChrome + 12;

  return (
    <>
      <StatusBar style={theme.id === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.root, { backgroundColor: theme.colors.surface }]}>
        <ThreadsAppBar />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: scrollBottomPad }]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <TopicQuickActionsRow
            topics={MOCK_TOPIC_CHIPS}
            onNewChat={() => goToChat({ chatId: 'new' })}
          />
          <View style={styles.list}>
            {loading ? (
              <ActivityIndicator style={{ marginTop: spacing.unit * 8 }} color={theme.colors.primary} />
            ) : null}
            {error ? (
              <ThemedText variant="bodyMd" center color={theme.colors.onSurfaceVariant} style={{ marginTop: spacing.unit * 4 }}>
                {error}
              </ThemedText>
            ) : null}
            {!loading && !error && threads.length === 0 ? (
              <ThemedText variant="bodyMd" center color={theme.colors.onSurfaceVariant} style={{ marginTop: spacing.unit * 4 }}>
                No conversations yet. Start a new chat.
              </ThemedText>
            ) : null}
            {threads.map((item) => (
              <ThreadRowItem
                key={item.id}
                item={item}
                onPress={() => goToChat({ chatId: item.id, threadTitle: item.title })}
              />
            ))}
          </View>
        </ScrollView>
        <FabNewChat bottomOffset={fabBottom} onPress={() => goToChat({ chatId: 'new' })} />
        <ThreadsBottomNav />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
  list: { marginTop: spacing.unit * 4 },
});
