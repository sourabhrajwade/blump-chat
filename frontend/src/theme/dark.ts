import type { Theme } from './types';

/**
 * Placeholder dark palette — swap values when you add a designed dark theme.
 * Shape matches `lightTheme` so components stay theme-agnostic.
 */
const colors = {
  background: '#0e0e0f',
  onBackground: '#e5e1e5',
  surface: '#1a1a1c',
  onSurface: '#f1edef',
  onSurfaceVariant: '#9f9c9d',
  primary: '#d5d3de',
  onPrimary: '#3f3e47',
  primaryContainer: '#5b5a64',
  onPrimaryContainer: '#efecf8',
  surfaceContainerLow: '#242426',
  surfaceContainerHigh: '#2e2e31',
  surfaceContainer: '#222224',
  surfaceContainerLowest: '#0e0e0f',
  surfaceContainerHighest: '#333235',
  outlineVariant: '#5c5b5f',
  outline: '#7c7a7d',
  tertiaryContainer: '#4c566f',
  onTertiaryContainer: '#d0d9f7',
  secondary: '#d6d3d8',
  onSecondary: '#403f43',
  secondaryContainer: '#525155',
  surfaceBackdrop: 'rgba(26, 26, 28, 0.92)',
} as const;

export const darkTheme: Theme = {
  id: 'dark',
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
