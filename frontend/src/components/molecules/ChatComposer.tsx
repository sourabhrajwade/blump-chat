import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing } from '../../theme';
import { useAppTheme } from '../../state/ThemeContext';
import { IconSymbol } from '../atoms/IconSymbol';

export function ChatComposer() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const [message, setMessage] = useState('');

  return (
    <View style={[styles.outer, { borderTopColor: colors.outlineVariant }]}>
      <BlurView
        intensity={theme.id === 'dark' ? 28 : 36}
        tint={theme.id === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.tint, { backgroundColor: colors.surfaceBackdrop }]} />
      <View
        style={[
          styles.row,
          { paddingBottom: Math.max(insets.bottom, spacing.unit * 6), paddingTop: spacing.unit * 3 },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach file"
          style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.8 }]}
        >
          <IconSymbol name="attach-file" size={22} color={colors.onSurfaceVariant} />
        </Pressable>
        <View
          style={[
            styles.inputShell,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: `${colors.outlineVariant}33`,
            },
          ]}
        >
          <Pressable hitSlop={8}>
            <IconSymbol name="sentiment-satisfied" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={`${colors.onSurfaceVariant}99`}
            multiline
            style={[
              styles.input,
              { color: colors.onSurface, fontFamily: theme.fonts.sansRegular },
            ]}
          />
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voice message"
            style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.8 }]}
          >
            <IconSymbol name="mic" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <IconSymbol name="send" size={22} color={colors.onPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.stackSm,
    paddingHorizontal: spacing.unit * 3,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: spacing.unit * 4,
    paddingVertical: spacing.unit * 2,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: spacing.unit * 2,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.unit,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
