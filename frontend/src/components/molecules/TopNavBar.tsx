import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../../theme';
import { useAppNavigation } from '../../state/NavigationContext';
import { useAppTheme } from '../../state/ThemeContext';
import { AppButton } from '../atoms/AppButton';
import { GhostTextButton } from '../atoms/GhostTextButton';
import { BrandMark } from './BrandMark';

export function TopNavBar() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { goToThreads } = useAppNavigation();
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
        <BrandMark />
        <View style={styles.actions}>
          <GhostTextButton label="Sign In" />
          <AppButton variant="primary" label="Get Started" compact textVariant="labelMd" onPress={goToThreads} />
        </View>
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
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.unit * 4 },
});
