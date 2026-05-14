import { Text, type TextProps } from 'react-native';

import { useAppTheme } from '../../state/ThemeContext';
import type { TextVariant } from '../../theme/types';

type Props = TextProps & {
  variant: TextVariant;
  color?: string;
  center?: boolean;
};

export function ThemedText({ variant, color, center, style, ...rest }: Props) {
  const { textStyles } = useAppTheme();
  return (
    <Text
      {...rest}
      style={[
        textStyles[variant],
        color ? { color } : null,
        center ? { textAlign: 'center' as const } : null,
        style,
      ]}
    />
  );
}
