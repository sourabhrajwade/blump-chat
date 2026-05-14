import { View, StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';
import { useAppTheme } from '../../state/ThemeContext';
import { ThemedText } from './ThemedText';

type Props = {
  value: string;
  caption: string;
};

export function StatFigure({ value, caption }: Props) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.cell}>
      <ThemedText variant="headlineLg" color={theme.colors.primary} style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText variant="labelMd" center>
        {caption}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { alignItems: 'center', gap: spacing.unit },
  value: { marginBottom: spacing.unit },
});
