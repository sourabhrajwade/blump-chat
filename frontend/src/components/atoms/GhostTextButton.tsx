import { Pressable } from 'react-native';

import { useAppTheme } from '../../state/ThemeContext';
import { ThemedText } from './ThemedText';

type Props = {
  label: string;
  onPress?: () => void;
};

export function GhostTextButton({ label, onPress }: Props) {
  const { theme } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <ThemedText variant="labelMd" color={theme.colors.onSurfaceVariant}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
