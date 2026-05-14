import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing } from '../../theme';
import { bottomNavShadow } from '../../styles/layout';
import { useAppTheme } from '../../state/ThemeContext';
import { IconSymbol } from '../atoms/IconSymbol';
import { ThemedText } from '../atoms/ThemedText';

type TabId = 'threads' | 'saved' | 'discover' | 'settings';

const TABS: { id: TabId; label: string; icon: ComponentProps<typeof IconSymbol>['name'] }[] = [
  { id: 'threads', label: 'Threads', icon: 'history' },
  { id: 'saved', label: 'Saved', icon: 'star' },
  { id: 'discover', label: 'Discover', icon: 'auto-awesome' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export function ThreadsBottomNav() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [active, setActive] = useState<TabId>('threads');

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, spacing.unit * 4) }]}>
      <BlurView
        intensity={theme.id === 'dark' ? 28 : 36}
        tint={theme.id === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.tint, { backgroundColor: theme.colors.surfaceBackdrop }]} />
      <View style={[styles.row, bottomNavShadow]}>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => setActive(tab.id)}
              style={({ pressed }) => [
                styles.tab,
                isActive && {
                  backgroundColor: theme.colors.primaryContainer,
                  borderRadius: radius.full,
                },
                pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
              ]}
            >
              <IconSymbol
                name={tab.icon}
                size={22}
                color={isActive ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant}
              />
              <ThemedText
                variant="labelMd"
                color={isActive ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 55,
    overflow: 'hidden',
    paddingTop: spacing.unit * 2,
    paddingHorizontal: spacing.unit * 4,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.unit * 4,
    paddingVertical: spacing.unit,
    gap: 2,
    minWidth: 72,
  },
});
