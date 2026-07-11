import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/design/tokens';
import { getLevelSnapshot } from '@/domain/xp/engine';
import { CATEGORY_LABELS, XP_CATEGORIES, XpCategory, XpState } from '@/domain/xp/types';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { AppText } from './AppText';
import { CutCard } from './CutCard';

const CATEGORY_ICONS: Record<XpCategory, keyof typeof Ionicons.glyphMap> = {
  finition: 'locate-outline',
  tir: 'basketball-outline',
  explosivite: 'flash-outline',
  defense: 'shield-outline',
  handle: 'git-branch-outline',
  endurance: 'heart-outline',
};

interface CategoryProgressListProps {
  state: XpState;
}

export function CategoryProgressList({ state }: CategoryProgressListProps) {
  return (
    <CutCard style={styles.card} cutSize={16}>
      <View style={styles.header}>
        <View>
          <AppText variant="micro" color="textMuted" style={styles.uppercase}>
            PROGRESSION RAPIDE
          </AppText>

          <AppText variant="titleLarge">
            Six axes, une preuve
          </AppText>
        </View>

        <Ionicons
          name="analytics-outline"
          size={22}
          color={colors.volt}
        />
      </View>

      <View style={styles.list}>
        {XP_CATEGORIES.map((category) => {
          const ledger = state.categories[category];
          const level = getLevelSnapshot(ledger.totalXp, 'category');

          return (
            <View key={category} style={styles.row}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={CATEGORY_ICONS[category]}
                  size={18}
                  color={colors.volt}
                />
              </View>

              <View style={styles.rowContent}>
                <View style={styles.rowHeader}>
                  <AppText variant="label">
                    {CATEGORY_LABELS[category]}
                  </AppText>

                  <View style={styles.rowMetrics}>
                    <AppText variant="metricSmall" color="textSecondary">
                      LVL {level.level}
                    </AppText>

                    <AppText variant="metricSmall" color="volt">
                      {ledger.totalXp} XP
                    </AppText>
                  </View>
                </View>

                <AnimatedProgressBar
                  progress={level.progress}
                  height={5}
                  duration={500}
                />

                {ledger.pendingRegularityXp > 0 ? (
                  <AppText variant="micro" color="warning">
                    {ledger.pendingRegularityXp} XP régularité en réserve
                  </AppText>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </CutCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[5],
    gap: spacing[5],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uppercase: {
    letterSpacing: 1.4,
  },
  list: {
    gap: spacing[4],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.small,
    backgroundColor: colors.voltWash,
    borderWidth: 1,
    borderColor: colors.voltDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: spacing[2],
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[2],
  },
  rowMetrics: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});
