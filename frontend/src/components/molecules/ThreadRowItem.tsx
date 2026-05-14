import { Pressable, View, StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';
import type { ThreadListEntry } from '../../data/threadsMock';
import { useAppTheme } from '../../state/ThemeContext';
import { IconSymbol } from '../atoms/IconSymbol';
import { ThemedText } from '../atoms/ThemedText';

type Props = {
  item: ThreadListEntry;
  onPress?: () => void;
};

const AVATAR = 48;

export function ThreadRowItem({ item, onPress }: Props) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const iconBg =
    item.iconVariant === 'accent' ? colors.primary : colors.surfaceContainerHighest;
  const iconFg = item.iconVariant === 'accent' ? colors.onPrimary : colors.primary;

  const timeColor = item.timeEmphasis === 'primary' ? colors.primary : colors.onSurfaceVariant;
  const previewColor = item.previewEmphasis === 'strong' ? colors.onSurface : colors.onSurfaceVariant;
  const previewWeight: '400' | '600' = item.previewEmphasis === 'strong' ? '600' : '400';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.surfaceContainerHigh : 'transparent' },
      ]}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: iconBg, borderRadius: radius.lg },
        ]}
      >
        <IconSymbol name={item.icon} size={22} color={iconFg} />
      </View>
      <View
        style={[
          styles.body,
          {
            borderBottomColor: colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <ThemedText
            variant="bodyLg"
            color={colors.onSurface}
            style={{ fontWeight: '700', flex: 1, paddingRight: spacing.stackSm }}
            numberOfLines={1}
          >
            {item.title}
          </ThemedText>
          <ThemedText variant="labelMd" color={timeColor} style={item.timeEmphasis === 'primary' ? { fontWeight: '700' } : undefined}>
            {item.timeLabel}
          </ThemedText>
        </View>
        <View style={styles.previewRow}>
          <ThemedText
            variant="bodyMd"
            color={previewColor}
            numberOfLines={1}
            style={{ fontWeight: previewWeight, flex: 1, maxWidth: 240 }}
          >
            {item.preview}
          </ThemedText>
          {item.pinned ? <IconSymbol name="push-pin" size={18} color={colors.primary} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.unit * 4,
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.unit * 4,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.unit * 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.unit,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.stackSm,
  },
});
