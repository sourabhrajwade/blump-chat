import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing } from '../../theme';
import type { TextVariant } from '../../theme/types';
import { useAppTheme } from '../../state/ThemeContext';
import { ThemedText } from './ThemedText';

type Variant = 'primary' | 'outline' | 'ghost';

type Props = PressableProps & {
  variant: Variant;
  label: string;
  iconEnd?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  compact?: boolean;
  textVariant?: TextVariant;
};

export function AppButton({
  variant,
  label,
  iconEnd,
  containerStyle,
  disabled,
  compact,
  textVariant,
  ...pressable
}: Props) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'outline'
        ? colors.surfaceContainerLowest
        : 'transparent';
  const borderColor = variant === 'outline' ? colors.outlineVariant : 'transparent';
  const borderWidth = variant === 'outline' ? 1 : 0;
  const fg =
    variant === 'primary' ? colors.onPrimary : variant === 'ghost' ? colors.onSurfaceVariant : colors.onSurface;

  const resolvedText = textVariant ?? (compact ? 'labelMd' : 'headlineMd');

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      {...pressable}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : null,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        containerStyle,
      ]}
    >
      <ThemedText variant={resolvedText} color={fg}>
        {label}
      </ThemedText>
      {iconEnd}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.stackSm,
    paddingVertical: spacing.unit * 3,
    paddingHorizontal: spacing.stackLg,
    borderRadius: radius.full,
  },
  compact: {
    paddingVertical: spacing.unit * 2,
    paddingHorizontal: spacing.unit * 4,
  },
});
