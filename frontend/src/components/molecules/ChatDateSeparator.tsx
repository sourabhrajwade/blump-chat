import { View, StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';
import { useAppTheme } from '../../state/ThemeContext';
import { ThemedText } from '../atoms/ThemedText';

type Props = { label: string };

export function ChatDateSeparator({ label }: Props) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.pill, { backgroundColor: theme.colors.surfaceContainerLow }]}>
        <ThemedText variant="labelMd" color={theme.colors.onSurfaceVariant}>
          {label}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: spacing.stackLg,
  },
  pill: {
    paddingHorizontal: spacing.unit * 4,
    paddingVertical: spacing.unit,
    borderRadius: radius.full,
  },
});
