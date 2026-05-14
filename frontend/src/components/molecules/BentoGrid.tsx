import { Image, View, StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';
import { cardShadow } from '../../styles/layout';
import { useAppTheme } from '../../state/ThemeContext';
import { AvatarStack } from '../atoms/AvatarStack';
import { IconSymbol } from '../atoms/IconSymbol';
import { ThemedText } from '../atoms/ThemedText';

const NEURAL_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBxYPmRLzchNmjqy2vmT5wcEeWnIpqf9ByVB-DMsq3zIl_vz_O3xDKJYZqt7NdDNDDVsGhUB9Wa_te8dDHvUASI5_ar4VJLpgMO5KgwjhujXN9X6nhvtjvmVTFhUPjQc1wKkGBUov-21Bns40MNDH4J6HV8pfSokxXto-oLEumjHqjrcUQDoVcXcKZfPvXCZEKIB6F0fwnl3FuMbBDgfonn5DgeXoo2oXuN5Z12vKyCbEnOyqGppPZ8HStNkkJWUZ4kxGxx8bijqdk';

type Props = { isWide: boolean };

export function BentoGrid({ isWide }: Props) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.wrap, isWide && styles.wrapWide]}>
      <View
        style={[
          styles.neural,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: colors.surfaceContainerHigh,
          },
          isWide ? styles.neuralWide : styles.neuralNarrow,
          cardShadow,
        ]}
      >
        <View style={[styles.neuralCopy, isWide ? styles.neuralCopyWide : styles.neuralCopyNarrow]}>
          <IconSymbol name="psychology" size={40} color={colors.primary} />
          <ThemedText variant="headlineMd" style={{ color: colors.onSurface }}>
            Neural Processing
          </ThemedText>
          <ThemedText variant="bodyMd" style={{ maxWidth: 280, marginTop: spacing.stackSm }}>
            Instant synthesis of complex data into actionable insights using our proprietary engine.
          </ThemedText>
        </View>
        <View style={[styles.neuralImageShell, isWide ? styles.neuralImageWide : styles.neuralImageNarrow]}>
          <Image source={{ uri: NEURAL_IMAGE }} style={styles.neuralImage} resizeMode="cover" />
        </View>
      </View>

      <View style={[styles.side, isWide && styles.sideWide]}>
        <View
          style={[
            styles.privacy,
            isWide && styles.privacyWide,
            { backgroundColor: colors.primaryContainer },
            cardShadow,
          ]}
        >
          <IconSymbol name="lock" size={32} color={colors.onPrimaryContainer} />
          <View>
            <ThemedText variant="headlineMd" color={colors.onPrimaryContainer}>
              Privacy First
            </ThemedText>
            <ThemedText variant="labelMd" color={colors.onPrimaryContainer} style={{ opacity: 0.8, marginTop: 4 }}>
              Encrypted at the kernel level.
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.team,
            isWide && styles.teamWide,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.surfaceContainerHigh,
            },
            cardShadow,
          ]}
        >
          <AvatarStack />
          <View>
            <ThemedText variant="headlineMd" color={colors.onSurface} style={{ marginTop: spacing.stackLg }}>
              Multi-User
            </ThemedText>
            <ThemedText variant="labelMd" color={colors.onSurfaceVariant} style={{ marginTop: 4 }}>
              Seamless team collaboration.
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.gutterMd,
    marginBottom: spacing.unit * 12,
    maxWidth: 1152,
    alignSelf: 'center',
    width: '100%',
  },
  wrapWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  neural: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.unit * 8,
    overflow: 'hidden',
    position: 'relative',
  },
  neuralNarrow: {
    minHeight: 360,
  },
  neuralWide: {
    flex: 8,
    minHeight: 400,
  },
  neuralCopy: { zIndex: 2 },
  neuralCopyWide: { maxWidth: '55%' },
  neuralCopyNarrow: { maxWidth: '65%' },
  neuralImageShell: {
    position: 'absolute',
    overflow: 'hidden',
  },
  neuralImageNarrow: {
    bottom: 0,
    right: 0,
    width: '72%',
    height: '55%',
    borderTopLeftRadius: radius.xl * 2,
  },
  neuralImageWide: {
    bottom: 0,
    right: 0,
    width: '58%',
    height: '68%',
    borderTopLeftRadius: radius.xl * 2,
  },
  neuralImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  side: {
    gap: spacing.gutterMd,
  },
  sideWide: {
    flex: 4,
    minWidth: 0,
    minHeight: 400,
    flexDirection: 'column',
  },
  privacy: {
    borderRadius: radius.lg,
    padding: spacing.unit * 6,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  privacyWide: { flex: 1 },
  team: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.unit * 6,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  teamWide: { flex: 1 },
});
