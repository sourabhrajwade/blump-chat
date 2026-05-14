import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing } from '../../theme';
import { fabPrimaryShadow } from '../../styles/layout';
import { useAppTheme } from '../../state/ThemeContext';
import { IconSymbol } from '../atoms/IconSymbol';
import { ThemedText } from '../atoms/ThemedText';

type Props = {
  bottomOffset: number;
  onPress?: () => void;
};

export function FabNewChat({ bottomOffset, onPress }: Props) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.wrap, { bottom: bottomOffset }]} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start a new chat"
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
          fabPrimaryShadow,
        ]}
      >
        <IconSymbol name="add" size={24} color={theme.colors.onPrimary} />
        <ThemedText
          variant="labelMd"
          color={theme.colors.onPrimary}
          style={{ letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '700' }}
        >
          New Chat
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: spacing.unit * 6,
    zIndex: 60,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    paddingVertical: spacing.unit * 3,
    paddingHorizontal: spacing.unit * 6,
    borderRadius: radius.lg,
  },
});
