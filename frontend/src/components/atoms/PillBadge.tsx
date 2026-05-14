import type { ComponentProps } from 'react';
import { View, StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';
import { useAppTheme } from '../../state/ThemeContext';
import { IconSymbol } from './IconSymbol';
import { ThemedText } from './ThemedText';

type Props = {
  icon: ComponentProps<typeof IconSymbol>['name'];
  label: string;
};

export function PillBadge({ icon, label }: Props) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[styles.wrap, { backgroundColor: theme.colors.surfaceContainerHigh }]}
    >
      <IconSymbol name={icon} size={16} color={theme.colors.primary} />
      <ThemedText variant="labelMd">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    paddingVertical: spacing.unit,
    paddingHorizontal: spacing.unit * 3,
    borderRadius: radius.full,
    alignSelf: 'center',
  },
});
