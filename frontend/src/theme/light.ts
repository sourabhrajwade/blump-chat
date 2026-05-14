import type { Theme } from './types';

const colors = {
  background: '#fcf8f9',
  onBackground: '#333235',
  surface: '#fcf8f9',
  onSurface: '#333235',
  onSurfaceVariant: '#605e61',
  primary: '#5e5d67',
  onPrimary: '#faf6ff',
  primaryContainer: '#e4e1ec',
  onPrimaryContainer: '#51515a',
  surfaceContainerLow: '#f6f2f4',
  surfaceContainerHigh: '#ebe7ea',
  surfaceContainer: '#f1edef',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHighest: '#e5e1e5',
  outlineVariant: '#b4b1b4',
  outline: '#7c7a7d',
  tertiaryContainer: '#d0d9f7',
  onTertiaryContainer: '#434c65',
  secondary: '#605e62',
  onSecondary: '#fbf8fc',
  secondaryContainer: '#e5e1e6',
  surfaceBackdrop: 'rgba(252, 248, 249, 0.88)',
} as const;

export const lightTheme: Theme = {
  id: 'light',
  colors: { ...colors },
  fonts: {
    display: 'ClimateCrisis_400Regular',
    bodyDisplay: 'BebasNeue_400Regular',
    sansRegular: 'Inter_400Regular',
    sansMedium: 'Inter_500Medium',
    sansSemiBold: 'Inter_600SemiBold',
    sansBold: 'Inter_700Bold',
  },
};
