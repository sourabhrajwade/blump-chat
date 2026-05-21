import { Image, useWindowDimensions, View, StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';
import { cardShadow } from '../../styles/layout';
import { useAppTheme } from '../../state/ThemeContext';
import { IconSymbol } from '../atoms/IconSymbol';
import { ThemedText } from '../atoms/ThemedText';

type Props = {
  side?: 'left' | 'right';
  uri: string;
  caption: string;
  time: string;
  readReceipt?: boolean;
};

const IMG_H = 192;

export function ChatImageBubble({ side = 'left', uri, caption, time, readReceipt }: Props) {
  const isRight = side === 'right';
  const { width: winW } = useWindowDimensions();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const innerW = Math.min(winW * 0.7 - 32, 300);

  return (
    <View
      style={[
        styles.column,
        { maxWidth: winW * 0.7, alignSelf: isRight ? 'flex-end' : 'flex-start', alignItems: isRight ? 'flex-end' : 'flex-start' },
      ]}
    >
      <View
        style={[
          styles.shell,
          {
            width: innerW + spacing.unit * 4,
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: `${colors.outlineVariant}4D`,
            borderRadius: OUTER_R,
          },
          cardShadow,
        ]}
      >
        <Image source={{ uri }} style={{ width: innerW, height: IMG_H, borderRadius: radius.lg }} resizeMode="cover" />
        <ThemedText
          variant="labelMd"
          color={colors.onSurfaceVariant}
          style={{ paddingHorizontal: spacing.unit * 2, paddingTop: spacing.unit * 2 }}
        >
          {caption}
        </ThemedText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.unit, marginTop: spacing.unit }}>
        <ThemedText variant="labelMd" color={colors.onSurfaceVariant}>
          {time}
        </ThemedText>
        {isRight && readReceipt ? (
          <IconSymbol name="done-all" size={14} color={colors.primary} />
        ) : null}
      </View>
    </View>
  );
}

const OUTER_R = 16;

const styles = StyleSheet.create({
  column: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  shell: {
    borderWidth: 1,
    padding: spacing.unit * 2,
    overflow: 'hidden',
  },
});
