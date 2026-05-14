import { Image, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing } from '../../theme';
import type { ChatPeerMeta } from '../../data/chatMock';
import { useAppNavigation } from '../../state/NavigationContext';
import { useAppTheme } from '../../state/ThemeContext';
import { IconGhostButton } from '../atoms/IconGhostButton';
import { IconSymbol } from '../atoms/IconSymbol';
import { ThemedText } from '../atoms/ThemedText';

const AVATAR = 40;

type Props = {
  peer: ChatPeerMeta;
};

export function ChatHeaderBar({ peer }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { goToThreads } = useAppNavigation();
  const height = insets.top + spacing.navHeight;

  return (
    <View style={[styles.shell, { height }]}>
      <BlurView
        intensity={theme.id === 'dark' ? 28 : 36}
        tint={theme.id === 'dark' ? 'dark' : 'light'}
        style={[styles.blur, { height }]}
      />
      <View style={[styles.tint, { height, backgroundColor: theme.colors.surfaceBackdrop }]} />
      <View style={[styles.row, { paddingTop: insets.top }]}>
        <View style={styles.left}>
          <IconGhostButton name="arrow-back" accessibilityLabel="Back to threads" onPress={goToThreads} />
          <View style={styles.identity}>
            <View style={styles.avatarWrap}>
              {peer.avatarUri ? (
                <Image source={{ uri: peer.avatarUri }} style={[styles.avatarImg, { borderRadius: radius.full }]} />
              ) : (
                <View
                  style={[
                    styles.avatarImg,
                    {
                      borderRadius: radius.full,
                      backgroundColor: theme.colors.primaryContainer,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}
                >
                  <IconSymbol name="chat" size={22} color={theme.colors.onPrimaryContainer} />
                </View>
              )}
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: theme.colors.tertiaryContainer,
                    borderColor: theme.colors.surface,
                  },
                ]}
              />
            </View>
            <View>
              <ThemedText variant="headlineMd" color={theme.colors.onSurface} numberOfLines={1}>
                {peer.peerName}
              </ThemedText>
              <ThemedText variant="labelMd" color={theme.colors.tertiaryContainer}>
                {peer.status}
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.right}>
          <IconGhostButton name="search" accessibilityLabel="Search in chat" />
          <IconGhostButton name="more-vert" accessibilityLabel="More options" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    overflow: 'hidden',
  },
  blur: { position: 'absolute', top: 0, left: 0, right: 0 },
  tint: { position: 'absolute', top: 0, left: 0, right: 0 },
  row: {
    flex: 1,
    paddingHorizontal: spacing.marginMobile,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm, flex: 1, minWidth: 0 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.unit * 3, flex: 1, minWidth: 0 },
  avatarWrap: { width: AVATAR, height: AVATAR, position: 'relative' },
  avatarImg: { width: AVATAR, height: AVATAR },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: radius.full,
    borderWidth: 2,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
