import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  name: IconName;
  size?: number;
  color: string;
};

export function IconSymbol({ name, size = 24, color }: Props) {
  return <MaterialIcons name={name} size={size} color={color} />;
}
