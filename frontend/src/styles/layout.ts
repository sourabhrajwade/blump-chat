import { Platform, ViewStyle } from 'react-native';

export const maxContentWidth = 720;
export const wideContentWidth = 1152;

export const sectionHorizontalPadding = 16;

export const cardShadow: ViewStyle =
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }) ?? {};

export const ctaBarShadow: ViewStyle =
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {},
  }) ?? {};

export const fabPrimaryShadow: ViewStyle =
  Platform.select({
    ios: {
      shadowColor: 'rgb(70, 72, 212)',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
    },
    android: { elevation: 12 },
    default: {},
  }) ?? {};

export const bottomNavShadow: ViewStyle =
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 8 },
    default: {},
  }) ?? {};
