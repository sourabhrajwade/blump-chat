import { View, StyleSheet, useWindowDimensions } from 'react-native';

import { spacing } from '../../theme';
import { useAppTheme } from '../../state/ThemeContext';
import { StatFigure } from '../atoms/StatFigure';

const STATS = [
  { value: '99.9%', caption: 'Uptime SLA' },
  { value: '20ms', caption: 'Inference Latency' },
  { value: '50M+', caption: 'Tasks Automated' },
  { value: '256-bit', caption: 'AES Encryption' },
] as const;

export function StatsBand() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.surfaceContainerLowest,
          borderTopColor: theme.colors.surfaceContainerHigh,
          borderBottomColor: theme.colors.surfaceContainerHigh,
        },
      ]}
    >
      <View style={[styles.grid, isWide && styles.gridWide]}>
        {STATS.map((s) => (
          <View key={s.caption} style={[styles.cell, isWide ? styles.cellWide : styles.cellNarrow]}>
            <StatFigure value={s.value} caption={s.caption} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.unit * 10,
    paddingHorizontal: spacing.marginMobile,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.unit * 8,
    columnGap: spacing.unit * 4,
    maxWidth: 1152,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  gridWide: {
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
  cell: {
    alignItems: 'center',
  },
  cellNarrow: {
    width: '47%',
  },
  cellWide: {
    flex: 1,
    minWidth: 0,
  },
});
