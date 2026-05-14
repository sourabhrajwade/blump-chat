import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationProvider } from '../../state/NavigationContext';
import { ThemeProvider } from '../../state/ThemeContext';

type Props = {
  children: ReactNode;
};

export function AppRoot({ children }: Props) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
