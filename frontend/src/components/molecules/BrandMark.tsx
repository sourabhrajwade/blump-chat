import { View, StyleSheet } from 'react-native';

import { spacing } from '../../theme';
import { useAppTheme } from '../../state/ThemeContext';
import { IconSymbol } from '../atoms/IconSymbol';
import { ThemedText } from '../atoms/ThemedText';

export function BrandMark() {
  const { theme } = useAppTheme();
  return (
    <View style={styles.row}>
      <IconSymbol name="auto-awesome" size={22} color={theme.colors.primary} />
      <ThemedText variant="headlineMd" color={theme.colors.onSurface}>
        Intelligence
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm },
});
