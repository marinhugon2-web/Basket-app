import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, motion, radii } from '@/design/tokens';

interface AnimatedProgressBarProps {
  progress: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: StyleProp<ViewStyle>;
  duration?: number;
}

export function AnimatedProgressBar({
  progress,
  height = 6,
  trackColor = colors.surface4,
  fillColor = colors.volt,
  style,
  duration = motion.xpGain,
}: AnimatedProgressBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const animatedWidth = useSharedValue(0);
  const safeProgress = Math.min(1, Math.max(0, progress));

  useEffect(() => {
    if (trackWidth <= 0) {
      return;
    }

    animatedWidth.value = withTiming(trackWidth * safeProgress, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedWidth, duration, safeProgress, trackWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
  }));

  function handleLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: fillColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radii.pill,
  },
  fill: {
    borderRadius: radii.pill,
    shadowColor: colors.volt,
    shadowOpacity: 0.35,
    shadowRadius: 7,
  },
});
