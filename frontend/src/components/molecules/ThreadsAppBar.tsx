import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../../theme';
import { useAppNavigation } from '../../state/NavigationContext';
import { useAppTheme } from '../../state/ThemeContext';
import { IconGhostButton } from '../atoms/IconGhostButton';
import { ThemedText } from '../atoms/ThemedText';

export function ThreadsAppBar() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { goToLanding } = useAppNavigation();
  const height = insets.top + spacing.navHeight;

  return (
    <View style={[styles.shell, { height }]}>
      <BlurView
        intensity={theme.id === 'dark' ? 28 : 36}
        tint={theme.id === 'dark' ? 'dark' : 'light'}
        style={[styles.blur, { height }]}
      />
      <View style={[styles.tint, { height, backgroundColor: theme.colors.surfaceBackdrop }]} />
      <View style={[styles.row, { paddingTop: insets.top }]}>
        <View style={styles.left}>
          <IconGhostButton name="menu" accessibilityLabel="Open menu" onPress={goToLanding} />
          <ThemedText variant="headlineMd" color={theme.colors.onSurface}>
            AI Threads
          </ThemedText>
        </View>
        <IconGhostButton name="search" accessibilityLabel="Search threads" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    overflow: 'hidden',
  },
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  row: {
    flex: 1,
    paddingHorizontal: spacing.marginMobile,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.unit * 4 },
});
