import { TextStyle } from 'react-native';

import type { TextVariant, Theme } from '../theme/types';

export type ThemeTextStyles = Record<TextVariant, TextStyle>;

export function createThemeTextStyles(theme: Theme): ThemeTextStyles {
  const { colors, fonts } = theme;

  return {
    headlineLg: {
      fontFamily: fonts.sansBold,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.56,
      fontWeight: '700',
      color: colors.onSurface,
    },
    headlineMd: {
      fontFamily: fonts.sansSemiBold,
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: -0.2,
      fontWeight: '600',
      color: colors.onSurface,
    },
    bodyLg: {
      fontFamily: fonts.sansRegular,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      color: colors.onSurfaceVariant,
    },
    bodyMd: {
      fontFamily: fonts.sansRegular,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      color: colors.onSurfaceVariant,
    },
    labelMd: {
      fontFamily: fonts.sansSemiBold,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.6,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
    },
    chatText: {
      fontFamily: fonts.sansRegular,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400',
      color: colors.onSurface,
    },
  };
}

export function createDisplayHeadlineStyle(theme: Theme, fontSize = 32): TextStyle {
  return {
    fontFamily: theme.fonts.display,
    fontSize,
    lineHeight: fontSize * 1.15,
    color: theme.colors.onSurface,
    textAlign: 'center',
  };
}

export function createBodyDisplayStyle(theme: Theme, fontSize = 16): TextStyle {
  return {
    fontFamily: theme.fonts.bodyDisplay,
    fontSize,
    lineHeight: fontSize * 1.2,
    letterSpacing: 0.3,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  };
}
