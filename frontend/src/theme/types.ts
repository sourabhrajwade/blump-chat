export type ThemeId = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  onSurfaceVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainer: string;
  surfaceContainerLowest: string;
  surfaceContainerHighest: string;
  outlineVariant: string;
  outline: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  surfaceBackdrop: string;
}

export interface ThemeFonts {
  display: string;
  bodyDisplay: string;
  sansRegular: string;
  sansMedium: string;
  sansSemiBold: string;
  sansBold: string;
}

export interface Theme {
  id: ThemeId;
  colors: ThemeColors;
  fonts: ThemeFonts;
}

export type TextVariant =
  | 'headlineLg'
  | 'headlineMd'
  | 'bodyLg'
  | 'bodyMd'
  | 'labelMd'
  | 'chatText';
