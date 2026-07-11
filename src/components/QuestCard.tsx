import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/design/tokens';
import { DashboardQuest } from '@/domain/dashboard';
import { CATEGORY_LABELS } from '@/domain/xp/types';
import { AppText } from './AppText';
import { CutCard } from './CutCard';

interface QuestCardProps {
  quest: DashboardQuest;
  completed: boolean;
  featured?: boolean;
  onComplete: (questId: string) => void;
}

const KIND_META = {
  verified_progress: {
    icon: 'shield-checkmark-outline' as const,
    color: colors.verified,
    label: 'PROGRESSION VÉRIFIÉE',
  },
  quality: {
    icon: 'checkmark-done-outline' as const,
    color: colors.volt,
    label: 'STREAK QUALITÉ',
  },
  presence: {
    icon: 'calendar-outline' as const,
    color: colors.textMuted,
    label: 'PRÉSENCE FAIBLE VALEUR',
  },
};

export function QuestCard({
  quest,
  completed,
  featured = false,
  onComplete,
}: QuestCardProps) {
  const meta = KIND_META[quest.kind];

  return (
    <CutCard
      style={[
        styles.card,
        featured && styles.featuredCard,
        completed && styles.completedCard,
      ]}
      elevated={featured}
      cutSize={featured ? 22 : 14}
      cutoutColor={colors.abyss}
    >
      <View style={styles.topRow}>
        <View style={[styles.kindPill, { borderColor: meta.color }]}>
          <Ionicons
            name={meta.icon}
            size={14}
            color={meta.color}
          />

          <AppText
            variant="micro"
            style={{
              color: meta.color,
              letterSpacing: 1.1,
            }}
          >
            {meta.label}
          </AppText>
        </View>

        <View style={styles.timeRow}>
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.textMuted}
          />

          <AppText variant="caption" color="textMuted">
            {quest.estimatedMinutes} min
          </AppText>
        </View>
      </View>

      <View style={styles.content}>
        <AppText variant={featured ? 'h2' : 'titleLarge'}>
          {quest.title}
        </AppText>

        <AppText variant="bodySmall" color="textSecondary">
          {quest.description}
        </AppText>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCell}>
          <AppText
            variant="micro"
            color="textMuted"
            style={styles.uppercase}
          >
            PREUVE
          </AppText>

          <AppText
            variant="caption"
            color={
              quest.kind === 'verified_progress'
                ? 'verified'
                : 'textSecondary'
            }
          >
            {quest.evidenceLabel}
          </AppText>
        </View>

        <View style={styles.infoCell}>
          <AppText
            variant="micro"
            color="textMuted"
            style={styles.uppercase}
          >
            CATÉGORIE
          </AppText>

          <AppText variant="caption" color="volt">
            {CATEGORY_LABELS[quest.event.category]}
          </AppText>
        </View>
      </View>

      <View style={styles.whyPanel}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.information}
        />

        <AppText
          variant="caption"
          color="textSecondary"
          style={styles.whyText}
        >
          {quest.whyItMatters}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          completed
            ? `${quest.title}, terminée`
            : quest.actionLabel
        }
        disabled={completed}
        onPress={() => onComplete(quest.id)}
        style={({ pressed }) => [
          styles.button,
          quest.kind !== 'verified_progress' && styles.secondaryButton,
          completed && styles.completedButton,
          pressed && !completed && styles.buttonPressed,
        ]}
      >
        <Ionicons
          name={
            completed
              ? 'checkmark-circle'
              : quest.kind === 'verified_progress'
                ? 'sparkles-outline'
                : 'arrow-forward-outline'
          }
          size={19}
          color={
            completed
              ? colors.textMuted
              : quest.kind === 'verified_progress'
                ? colors.textOnVolt
                : colors.volt
          }
        />

        <AppText
          variant="label"
          color={
            completed
              ? 'textMuted'
              : quest.kind === 'verified_progress'
                ? 'textOnVolt'
                : 'volt'
          }
        >
          {completed ? 'Terminée' : quest.actionLabel}
        </AppText>
      </Pressable>
    </CutCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[5],
    gap: spacing[4],
  },
  featuredCard: {
    borderColor: colors.voltDeep,
    backgroundColor: colors.surface2,
  },
  completedCard: {
    opacity: 0.66,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  kindPill: {
    maxWidth: '74%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  content: {
    gap: spacing[2],
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  infoCell: {
    flex: 1,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.small,
    padding: spacing[3],
    gap: spacing[1],
  },
  uppercase: {
    letterSpacing: 1.2,
  },
  whyPanel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    backgroundColor: colors.surface1,
    borderRadius: radii.medium,
    padding: spacing[3],
  },
  whyText: {
    flex: 1,
  },
  button: {
    minHeight: 48,
    borderRadius: radii.medium,
    backgroundColor: colors.volt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  secondaryButton: {
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.voltDeep,
  },
  completedButton: {
    backgroundColor: colors.surface3,
    borderColor: colors.borderSubtle,
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.88,
  },
});
