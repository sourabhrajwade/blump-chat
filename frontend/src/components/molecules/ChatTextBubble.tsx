import { View, StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';
import { cardShadow } from '../../styles/layout';
import { useAppTheme } from '../../state/ThemeContext';
import { IconSymbol } from '../atoms/IconSymbol';
import { ThemedText } from '../atoms/ThemedText';

type Props = {
  side: 'left' | 'right';
  body: string;
  time: string;
  readReceipt?: boolean;
};

const BUBBLE_R = 16;
const TAIL = 4;

export function ChatTextBubble({ side, body, time, readReceipt }: Props) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const isRight = side === 'right';
  const bubbleBg = isRight ? colors.primary : colors.surfaceContainerLowest;
  const bubbleFg = isRight ? colors.onPrimary : colors.onSurface;
  const borderColor = isRight ? 'transparent' : `${colors.outlineVariant}4D`;

  const radii = isRight
    ? {
        borderTopLeftRadius: BUBBLE_R,
        borderTopRightRadius: BUBBLE_R,
        borderBottomLeftRadius: BUBBLE_R,
        borderBottomRightRadius: TAIL,
      }
    : {
        borderTopLeftRadius: BUBBLE_R,
        borderTopRightRadius: BUBBLE_R,
        borderBottomRightRadius: BUBBLE_R,
        borderBottomLeftRadius: TAIL,
      };

  return (
    <View style={[styles.column, isRight && styles.columnEnd, { maxWidth: '85%' }]}>
      <View
        style={[
          styles.bubble,
          radii,
          {
            backgroundColor: bubbleBg,
            borderWidth: isRight ? 0 : 1,
            borderColor,
          },
          !isRight && cardShadow,
          isRight && styles.bubbleRightShadow,
        ]}
      >
        <ThemedText variant="chatText" color={bubbleFg}>
          {body}
        </ThemedText>
      </View>
      <View style={[styles.meta, isRight && styles.metaEnd]}>
        <ThemedText variant="labelMd" color={colors.onSurfaceVariant} style={{ marginTop: spacing.unit }}>
          {time}
        </ThemedText>
        {readReceipt ? <IconSymbol name="done-all" size={16} color={colors.primary} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  columnEnd: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: {
    padding: spacing.unit * 4,
  },
  bubbleRightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.unit,
    marginTop: 2,
  },
  metaEnd: { justifyContent: 'flex-end' },
});
