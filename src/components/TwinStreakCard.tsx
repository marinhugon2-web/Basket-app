import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/design/tokens';
import { AppText } from './AppText';
import { CutCard } from './CutCard';

interface TwinStreakCardProps {
  qualityStreak: number;
  presenceStreak: number;
}

export function TwinStreakCard({
  qualityStreak,
  presenceStreak,
}: TwinStreakCardProps) {
  return (
    <CutCard style={styles.card} cutSize={14}>
      <View style={styles.header}>
        <AppText
          variant="micro"
          color="textMuted"
          style={styles.uppercase}
        >
          STREAKS PARALLÈLES
        </AppText>

        <Ionicons
          name="pulse-outline"
          size={18}
          color={colors.volt}
        />
      </View>

      <View style={styles.streakGrid}>
        <View style={[styles.streakBlock, styles.qualityBlock]}>
          <View style={styles.labelRow}>
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={colors.volt}
            />

            <AppText variant="label">
              Qualité
            </AppText>
          </View>

          <AppText variant="metricLarge">
            {qualityStreak} j
          </AppText>

          <AppText
            variant="caption"
            color="textSecondary"
          >
            Données réelles · économie principale
          </AppText>
        </View>

        <View style={styles.streakBlock}>
          <View style={styles.labelRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.textMuted}
            />

            <AppText
              variant="label"
              color="textSecondary"
            >
              Présence
            </AppText>
          </View>

          <AppText
            variant="metricLarge"
            color="textSecondary"
          >
            {presenceStreak} j
          </AppText>

          <AppText
            variant="caption"
            color="textMuted"
          >
            Valeur faible · plafond strict
          </AppText>
        </View>
      </View>
    </CutCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[5],
    gap: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uppercase: {
    letterSpacing: 1.4,
  },
  streakGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  streakBlock: {
    flex: 1,
    minHeight: 126,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    padding: spacing[4],
    gap: spacing[2],
  },
  qualityBlock: {
    borderColor: colors.voltDeep,
    backgroundColor: colors.voltWash,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
