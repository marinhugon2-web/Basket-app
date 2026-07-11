import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  colors,
  motion,
  radii,
  spacing,
} from '@/design/tokens';
import {
  CATEGORY_LABELS,
  XpOutcome,
} from '@/domain/xp/types';
import { AppText } from './AppText';

interface RewardFeedbackProps {
  outcome: XpOutcome | null;
  onFinished: () => void;
}

export function RewardFeedback({
  outcome,
  onFinished,
}: RewardFeedbackProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-24);
  const scale = useSharedValue(0.86);
  const scan = useSharedValue(-180);

  const levelUp = Boolean(
    outcome &&
      (
        outcome.globalLevelAfter >
          outcome.globalLevelBefore ||
        outcome.categoryLevelAfter >
          outcome.categoryLevelBefore
      ),
  );

  useEffect(() => {
    if (!outcome) {
      return;
    }

    opacity.value = 0;
    translateY.value = -24;
    scale.value = 0.86;
    scan.value = -180;

    if (levelUp) {
      opacity.value = withSequence(
        withTiming(1, {
          duration: 120,
        }),
        withDelay(
          760,
          withTiming(0, {
            duration: 180,
          }),
        ),
      );

      translateY.value = withTiming(0, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });

      scale.value = withSequence(
        withTiming(1.04, {
          duration: 280,
          easing: Easing.out(Easing.back(1.4)),
        }),
        withTiming(1, {
          duration: 150,
        }),
      );

      scan.value = withTiming(520, {
        duration: 760,
        easing: Easing.inOut(Easing.cubic),
      });

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(
          Haptics.ImpactFeedbackStyle.Heavy,
        ).catch(() => undefined);
      }
    } else {
      opacity.value = withSequence(
        withTiming(1, {
          duration: 130,
        }),
        withDelay(
          470,
          withTiming(0, {
            duration: 170,
          }),
        ),
      );

      translateY.value = withSequence(
        withTiming(0, {
          duration: 230,
          easing: Easing.out(Easing.cubic),
        }),
        withDelay(
          350,
          withTiming(-12, {
            duration: 160,
          }),
        ),
      );

      scale.value = withSequence(
        withTiming(1.04, {
          duration: 180,
          easing: Easing.out(Easing.back(1.2)),
        }),
        withTiming(1, {
          duration: 120,
        }),
      );

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => undefined);
      }
    }

    const timeout = setTimeout(
      onFinished,
      levelUp
        ? motion.forgeBreak
        : motion.xpGain,
    );

    return () => clearTimeout(timeout);
  }, [
    levelUp,
    onFinished,
    opacity,
    outcome,
    scale,
    scan,
    translateY,
  ]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        translateY: translateY.value,
      },
      {
        scale: scale.value,
      },
    ],
  }));

  const scanStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: scan.value,
      },
      {
        rotate: '-8deg',
      },
    ],
  }));

  if (!outcome) {
    return null;
  }

  if (levelUp) {
    const isGlobal =
      outcome.globalLevelAfter >
      outcome.globalLevelBefore;

    const level = isGlobal
      ? outcome.globalLevelAfter
      : outcome.categoryLevelAfter;

    const scope = isGlobal
      ? 'NIVEAU GLOBAL'
      : CATEGORY_LABELS[
          outcome.category
        ].toUpperCase();

    return (
      <Modal
        visible
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={onFinished}
      >
        <View
          pointerEvents="none"
          style={styles.forgeBackdrop}
        >
          <Animated.View
            style={[styles.scanLine, scanStyle]}
          />

          <Animated.View
            style={[
              styles.forgeCard,
              containerStyle,
            ]}
          >
            <View style={styles.forgeArc}>
              <View style={styles.forgeArcGap} />

              <Ionicons
                name="flash"
                size={28}
                color={colors.textOnVolt}
              />
            </View>

            <AppText
              variant="micro"
              color="verified"
              style={styles.letterSpacing}
            >
              FORGE BREAK · {scope}
            </AppText>

            <AppText variant="displayXXL">
              {level}
            </AppText>

            <AppText variant="h3" color="volt">
              NIVEAU DÉBLOQUÉ
            </AppText>

            <AppText
              variant="bodySmall"
              color="textSecondary"
              style={styles.centerText}
            >
              {outcome.message}
            </AppText>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  const onlyQueued =
    outcome.totalAwardedXp === 0 &&
    outcome.queuedRegularityXp > 0;

  const duplicate = outcome.duplicate;

  const title = duplicate
    ? 'DÉJÀ COMPTÉ'
    : onlyQueued
      ? 'XP EN RÉSERVE'
      : `+${outcome.totalAwardedXp} XP`;

  const icon = duplicate
    ? 'checkmark-circle-outline'
    : onlyQueued
      ? 'lock-closed-outline'
      : 'sparkles-outline';

  const accent = duplicate
    ? colors.textSecondary
    : onlyQueued
      ? colors.warning
      : colors.volt;

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onFinished}
    >
      <View
        pointerEvents="none"
        style={styles.toastLayer}
      >
        <Animated.View
          style={[
            styles.toast,
            containerStyle,
            {
              borderColor: accent,
            },
          ]}
        >
          <View
            style={[
              styles.toastIcon,
              {
                backgroundColor: `${accent}1A`,
                borderColor: accent,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={22}
              color={accent}
            />
          </View>

          <View style={styles.toastText}>
            <AppText
              variant="metricLarge"
              style={{
                color: accent,
              }}
            >
              {title}
            </AppText>

            <AppText
              variant="caption"
              color="textSecondary"
              numberOfLines={2}
            >
              {CATEGORY_LABELS[outcome.category]} ·{' '}
              {outcome.message}
            </AppText>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  toastLayer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 72,
    paddingHorizontal: spacing[5],
  },
  toast: {
    width: '100%',
    maxWidth: 520,
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderRadius: radii.large,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 12,
  },
  toastIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.medium,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    flex: 1,
    gap: spacing[1],
  },
  forgeBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.overlay,
    padding: spacing[6],
  },
  forgeCard: {
    width: '100%',
    maxWidth: 430,
    minHeight: 430,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: spacing[8],
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.volt,
    backgroundColor: colors.surface1,
    shadowColor: colors.volt,
    shadowOpacity: 0.36,
    shadowRadius: 32,
    elevation: 18,
  },
  forgeArc: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 8,
    borderColor: colors.volt,
    backgroundColor: colors.volt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  forgeArcGap: {
    position: 'absolute',
    width: 24,
    height: 14,
    top: -10,
    backgroundColor: colors.surface1,
    transform: [
      {
        rotate: '12deg',
      },
    ],
  },
  scanLine: {
    position: 'absolute',
    left: -80,
    right: -80,
    height: 4,
    backgroundColor: colors.verified,
    shadowColor: colors.verified,
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
  letterSpacing: {
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  centerText: {
    textAlign: 'center',
    maxWidth: 320,
  },
});
