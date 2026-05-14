import { View, StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';
import { useAppTheme } from '../../state/ThemeContext';

const DOT = 32;

export function AvatarStack() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const tones = [colors.tertiaryContainer, colors.primary, colors.secondary] as const;

  return (
    <View style={styles.row}>
      {tones.map((c, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: c,
              borderColor: colors.surface,
              marginLeft: i === 0 ? 0 : -10,
              zIndex: 3 - i,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.full,
    borderWidth: 2,
  },
});
