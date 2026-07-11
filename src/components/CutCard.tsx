import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radii } from '@/design/tokens';

interface CutCardProps {
  style?: StyleProp<ViewStyle>;
  cutoutColor?: string;
  elevated?: boolean;
  cutSize?: number;
}

export function CutCard({
  children,
  style,
  cutoutColor = colors.abyss,
  elevated = false,
  cutSize = 18,
}: PropsWithChildren<CutCardProps>) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
      <View
        pointerEvents="none"
        style={[
          styles.cut,
          {
            width: cutSize,
            height: cutSize,
            right: -cutSize / 2,
            top: -cutSize / 2,
            backgroundColor: cutoutColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.surface1,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.large,
  },
  elevated: {
    backgroundColor: colors.surface2,
    borderColor: colors.borderStrong,
  },
  cut: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
});
