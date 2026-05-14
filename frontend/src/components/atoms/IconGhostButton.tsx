import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { radius } from '../../theme';
import { useAppTheme } from '../../state/ThemeContext';
import { IconSymbol } from './IconSymbol';

type IconName = ComponentProps<typeof IconSymbol>['name'];

type Props = {
  name: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
};

export function IconGhostButton({ name, onPress, accessibilityLabel }: Props) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.hit,
        { backgroundColor: pressed ? theme.colors.surfaceContainerLow : 'transparent' },
      ]}
    >
      <IconSymbol name={name} size={22} color={theme.colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
