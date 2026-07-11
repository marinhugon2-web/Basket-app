import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/design/tokens';
import { getGlobalRatioSnapshot, getLevelSnapshot } from '@/domain/xp/engine';
import { XpState } from '@/domain/xp/types';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { AppText } from './AppText';
import { CutCard } from './CutCard';

interface PlayerSummaryCardProps {
  state: XpState;
}

export function PlayerSummaryCard({ state }: PlayerSummaryCardProps) {
  const level = getLevelSnapshot(state.globalTotalXp, 'global');
  const ratio = getGlobalRatioSnapshot(state);
  const verifiedPercent = Math.round(ratio.verifiedShare * 100);
  const regularityPercent = Math.round(ratio.regularityShare * 100);

  return (
    <CutCard style={styles.card} elevated cutSize={24}>
      <View style={styles.topRow}>
        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            <Ionicons name="basketball-outline" size={24} color={colors.volt} />
          </View>

          <View style={styles.identityText}>
            <AppText variant="micro" color="textMuted" style={styles.uppercase}>
              CARTE JOUEUR
            </AppText>

            <AppText variant="titleLarge">
              MARIN
            </AppText>

            <AppText variant="caption" color="textSecondary">
              Arrière · Saison 01
            </AppText>
          </View>
        </View>

        <View style={styles.rankPill}>
          <Ionicons name="layers-outline" size={14} color={colors.warning} />

          <AppText variant="caption" color="warning">
            NIVEAU {level.level}
          </AppText>
        </View>
      </View>

      <View style={styles.levelRow}>
        <View>
          <AppText variant="micro" color="textMuted" style={styles.uppercase}>
            NIVEAU GLOBAL
          </AppText>

          <View style={styles.levelInline}>
            <AppText variant="scoreHero">
              {level.level}
            </AppText>

            <AppText variant="metric" color="volt">
              LVL
            </AppText>
          </View>
        </View>

        <View style={styles.totalXpBlock}>
          <AppText variant="metricLarge">
            {state.globalTotalXp}
          </AppText>

          <AppText variant="caption" color="textMuted">
            XP TOTAL
          </AppText>
        </View>
      </View>

      <AnimatedProgressBar progress={level.progress} height={8} />

      <View style={styles.progressLegend}>
        <AppText variant="metricSmall" color="textSecondary">
          {level.xpIntoLevel} / {level.xpNeededForNext}
        </AppText>

        <AppText variant="caption" color="textMuted">
          prochain niveau
        </AppText>
      </View>

      <View style={styles.ratioPanel}>
        <View style={styles.ratioHeader}>
          <View style={styles.ratioTitleRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color={colors.verified}
            />

            <AppText variant="label">
              INTÉGRITÉ XP
            </AppText>
          </View>

          <AppText
            variant="caption"
            color={ratio.isCompliant ? 'verified' : 'danger'}
          >
            {ratio.isCompliant ? 'CONFORME' : 'À CONTRÔLER'}
          </AppText>
        </View>

        <View style={styles.ratioTrack}>
          <View
            style={[
              styles.verifiedSegment,
              {
                flex: Math.max(ratio.verifiedShare, 0.001),
              },
            ]}
          />

          <View
            style={[
              styles.regularitySegment,
              {
                flex: Math.max(ratio.regularityShare, 0.001),
              },
            ]}
          />
        </View>

        <View style={styles.ratioLegend}>
          <AppText variant="caption" color="verified">
            {verifiedPercent}% vérifié
          </AppText>

          <AppText variant="caption" color="textSecondary">
            {regularityPercent}% régularité
          </AppText>
        </View>
      </View>
    </CutCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[6],
    gap: spacing[5],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  identityText: {
    gap: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.volt,
    backgroundColor: colors.voltWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.pill,
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  uppercase: {
    letterSpacing: 1.4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  levelInline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  totalXpBlock: {
    alignItems: 'flex-end',
    paddingBottom: spacing[1],
  },
  progressLegend: {
    marginTop: -spacing[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratioPanel: {
    backgroundColor: colors.surface1,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing[4],
    gap: spacing[3],
  },
  ratioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  ratioTrack: {
    height: 7,
    borderRadius: radii.pill,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: colors.surface4,
  },
  verifiedSegment: {
    backgroundColor: colors.verified,
  },
  regularitySegment: {
    backgroundColor: colors.textMuted,
  },
  ratioLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
