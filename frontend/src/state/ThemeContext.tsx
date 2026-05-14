import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { darkTheme } from '../theme/dark';
import { lightTheme } from '../theme/light';
import type { Theme, ThemeId } from '../theme/types';
import { createThemeTextStyles, type ThemeTextStyles } from '../styles/typography';

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  textStyles: ThemeTextStyles;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(id: ThemeId): Theme {
  return id === 'dark' ? darkTheme : lightTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('light');
  const theme = useMemo(() => resolveTheme(themeId), [themeId]);
  const textStyles = useMemo(() => createThemeTextStyles(theme), [theme]);

  const value = useMemo(
    () => ({
      theme,
      themeId,
      setThemeId,
      textStyles,
    }),
    [theme, themeId, textStyles],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return ctx;
}
