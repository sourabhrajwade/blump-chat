import { View, StyleSheet, useWindowDimensions } from 'react-native';

import { radius, spacing } from '../../theme';
import { useAppNavigation } from '../../state/NavigationContext';
import { useAppTheme } from '../../state/ThemeContext';
import { AppButton } from '../atoms/AppButton';
import { IconSymbol } from '../atoms/IconSymbol';
import { PillBadge } from '../atoms/PillBadge';
import { ThemedText } from '../atoms/ThemedText';

export function HeroBlock() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const { theme } = useAppTheme();
  const { goToThreads } = useAppNavigation();

  return (
    <View style={styles.section}>
      <PillBadge icon="verified" label="Version 2.0 Now Available" />
      <ThemedText
        variant="headlineLg"
        center
        style={[styles.title, isWide && styles.titleWide, { color: theme.colors.onSurface }]}
      >
        Your AI Intelligence Partner
      </ThemedText>
      <ThemedText variant="bodyLg" center style={styles.subtitle}>
        Streamline your professional workflow with a cognitive assistant designed for precision, speed, and absolute
        simplicity.
      </ThemedText>
      <View style={[styles.ctaRow, isWide && styles.ctaRowWide]}>
        <AppButton
          variant="primary"
          label="Get Started"
          onPress={goToThreads}
          containerStyle={[
            styles.heroPrimary,
            isWide ? { minWidth: 220, alignSelf: 'center' } : { alignSelf: 'stretch' },
          ]}
          iconEnd={<IconSymbol name="arrow-forward" size={20} color={theme.colors.onPrimary} />}
        />
        <AppButton
          variant="outline"
          label="Continue as Guest"
          onPress={goToThreads}
          containerStyle={isWide ? { minWidth: 220, alignSelf: 'center' } : { alignSelf: 'stretch' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.marginMobile,
    alignItems: 'center',
    marginBottom: spacing.unit * 10,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    marginTop: spacing.stackLg,
    marginBottom: spacing.stackSm,
  },
  titleWide: {
    fontSize: 40,
    lineHeight: 46,
  },
  subtitle: {
    maxWidth: 520,
    marginBottom: spacing.stackLg,
  },
  ctaRow: {
    width: '100%',
    gap: spacing.unit * 4,
  },
  ctaRowWide: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  heroPrimary: {
    paddingVertical: spacing.unit * 4,
    paddingHorizontal: spacing.unit * 8,
    borderRadius: radius.full,
  },
});
