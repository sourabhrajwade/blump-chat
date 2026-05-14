import { ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOCK_THREADS, MOCK_TOPIC_CHIPS } from '../data/threadsMock';
import { spacing } from '../theme';
import { useAppNavigation } from '../state/NavigationContext';
import { useAppTheme } from '../state/ThemeContext';
import { FabNewChat } from '../components/molecules/FabNewChat';
import { ThreadRowItem } from '../components/molecules/ThreadRowItem';
import { ThreadsAppBar } from '../components/molecules/ThreadsAppBar';
import { ThreadsBottomNav } from '../components/molecules/ThreadsBottomNav';
import { TopicQuickActionsRow } from '../components/molecules/TopicQuickActionsRow';

export function ThreadsHomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { goToChat } = useAppNavigation();
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
            {MOCK_THREADS.map((item) => (
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
