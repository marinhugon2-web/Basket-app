import React, { PropsWithChildren } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { colors, typography } from '@/design/tokens';

type TextVariant = keyof typeof typography;

type TextColor = keyof Pick<
  typeof colors,
  | 'textPrimary'
  | 'textSecondary'
  | 'textMuted'
  | 'textDisabled'
  | 'textOnVolt'
  | 'volt'
  | 'verified'
  | 'warning'
  | 'danger'
  | 'information'
  | 'pending'
>;

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  style?: StyleProp<TextStyle>;
}

export function AppText({
  children,
  variant = 'body',
  color = 'textPrimary',
  style,
  ...textProps
}: PropsWithChildren<AppTextProps>) {
  return (
    <Text
      {...textProps}
      style={[typography[variant], { color: colors[color] }, style]}
      allowFontScaling
    >
      {children}
    </Text>
  );
}
