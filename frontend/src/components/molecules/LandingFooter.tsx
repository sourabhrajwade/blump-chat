import { Pressable, View, StyleSheet, useWindowDimensions } from 'react-native';

import { radius, spacing } from '../../theme';
import { useAppTheme } from '../../state/ThemeContext';
import { IconSymbol } from '../atoms/IconSymbol';
import { ThemedText } from '../atoms/ThemedText';
import { BrandMark } from './BrandMark';

const PRODUCT = ['Features', 'Security', 'Enterprise'] as const;
const COMPANY = ['About', 'Careers', 'Blog'] as const;
const LEGAL = ['Privacy', 'Terms'] as const;

export function LandingFooter() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const year = new Date().getFullYear();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.surfaceContainerHigh }]}>
      <View style={[styles.upper, isWide && styles.upperWide]}>
        <View style={styles.about}>
          <BrandMark />
          <ThemedText variant="bodyMd" style={{ marginTop: spacing.unit * 4 }}>
            Premium minimalist AI tools for the modern professional ecosystem.
          </ThemedText>
        </View>
        <View style={[styles.columns, isWide && styles.columnsWide]}>
          <FooterColumn title="Product" links={PRODUCT} />
          <FooterColumn title="Company" links={COMPANY} />
          <FooterColumn title="Legal" links={LEGAL} />
        </View>
      </View>
      <View style={[styles.lower, { borderTopColor: colors.surfaceContainerHigh }, !isWide && styles.lowerStack]}>
        <ThemedText variant="labelMd" color={colors.onSurfaceVariant}>
          © {year} Intelligence AI. All rights reserved.
        </ThemedText>
        <View style={styles.social}>
          <Pressable hitSlop={8}>
            <IconSymbol name="public" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable hitSlop={8}>
            <IconSymbol name="mail" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly string[] }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.column}>
      <ThemedText variant="labelMd" color={theme.colors.onSurface} style={{ fontWeight: '700' }}>
        {title}
      </ThemedText>
      {links.map((label) => (
        <Pressable key={label} hitSlop={6}>
          <ThemedText variant="labelMd" color={theme.colors.onSurfaceVariant}>
            {label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: spacing.unit * 12,
    paddingHorizontal: spacing.marginMobile,
    borderTopWidth: 1,
    paddingBottom: spacing.unit * 10,
  },
  upper: {
    gap: spacing.unit * 8,
    maxWidth: 1152,
    alignSelf: 'center',
    width: '100%',
  },
  upperWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  about: { maxWidth: 320 },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.unit * 12,
  },
  columnsWide: {
    gap: spacing.unit * 14,
  },
  column: { gap: spacing.unit * 3, minWidth: 120 },
  lower: {
    marginTop: spacing.unit * 12,
    paddingTop: spacing.unit * 8,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1152,
    alignSelf: 'center',
    width: '100%',
  },
  social: { flexDirection: 'row', gap: spacing.unit * 4 },
  lowerStack: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.unit * 3,
  },
});
