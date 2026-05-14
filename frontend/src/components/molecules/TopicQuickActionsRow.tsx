import { Pressable, ScrollView, View, StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';
import { useAppTheme } from '../../state/ThemeContext';
import type { TopicQuickItem } from '../../data/threadsMock';
import { IconSymbol } from '../atoms/IconSymbol';
import { ThemedText } from '../atoms/ThemedText';

type Props = {
  topics: TopicQuickItem[];
  onNewChat?: () => void;
};

const ORB = 56;

export function TopicQuickActionsRow({ topics, onNewChat }: Props) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      nestedScrollEnabled
    >
      {topics.map((t) => {
        const orb = t.variant === 'new' ? (
          <View style={[styles.ring, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
            <View style={[styles.orb, { backgroundColor: colors.primaryContainer }]}>
              <IconSymbol name={t.icon} size={28} color={colors.onPrimaryContainer} />
            </View>
          </View>
        ) : (
          <View style={[styles.orbPlain, { backgroundColor: colors.surfaceContainerHigh }]}>
            <IconSymbol name={t.icon} size={24} color={colors.primary} />
          </View>
        );

        return (
          <View key={t.id} style={styles.item}>
            {t.variant === 'new' && onNewChat ? (
              <Pressable onPress={onNewChat} style={styles.pressCol}>
                {orb}
                <ThemedText variant="labelMd" center style={{ marginTop: spacing.stackSm }}>
                  {t.label}
                </ThemedText>
              </Pressable>
            ) : (
              <View style={styles.pressCol}>
                {orb}
                <ThemedText variant="labelMd" center style={{ marginTop: spacing.stackSm }}>
                  {t.label}
                </ThemedText>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.stackSm,
    columnGap: spacing.stackLg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  item: {
    minWidth: 64,
    alignItems: 'center',
  },
  pressCol: { alignItems: 'center' },
  ring: {
    borderRadius: radius.full,
    borderWidth: 2,
    padding: 2,
  },
  orb: {
    width: ORB,
    height: ORB,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbPlain: {
    width: ORB,
    height: ORB,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
