import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { colors, radii, spacing } from '@/design/tokens';
import {
  getGlobalRatioSnapshot,
  getLevelSnapshot,
} from '@/domain/xp/engine';
import {
  CATEGORY_LABELS,
  XP_CATEGORIES,
  XpState,
} from '@/domain/xp/types';
import { AppText } from './AppText';
import { CutCard } from './CutCard';

export type SectionId =
  | 'progress'
  | 'measure'
  | 'competition'
  | 'player';

interface QuickAccessProps {
  state: XpState;
  selectedSection: SectionId | null;
  onSelectedSectionChange: (section: SectionId | null) => void;
}

const sections: {
  id: SectionId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'progress',
    label: 'Progresser',
    subtitle: 'Niveaux et axes',
    icon: 'trending-up-outline',
  },
  {
    id: 'measure',
    label: 'Mesurer',
    subtitle: 'Preuves et ratios',
    icon: 'analytics-outline',
  },
  {
    id: 'competition',
    label: 'Compétition',
    subtitle: 'Données éligibles',
    icon: 'trophy-outline',
  },
  {
    id: 'player',
    label: 'Joueur',
    subtitle: 'Carte et streaks',
    icon: 'person-outline',
  },
];

export function QuickAccess({
  state,
  selectedSection,
  onSelectedSectionChange,
}: QuickAccessProps) {
  const ratio = getGlobalRatioSnapshot(state);
  const globalLevel = getLevelSnapshot(
    state.globalTotalXp,
    'global',
  );

  const content = useMemo(() => {
    const categories = XP_CATEGORIES.map((category) => ({
      category,
      ledger: state.categories[category],
      level: getLevelSnapshot(
        state.categories[category].totalXp,
        'category',
      ),
    })).sort(
      (a, b) => b.ledger.totalXp - a.ledger.totalXp,
    );

    const strongest = categories[0];
    const weakest = categories[categories.length - 1];

    const pendingTotal = categories.reduce(
      (total, item) =>
        total + item.ledger.pendingRegularityXp,
      0,
    );

    if (selectedSection === 'progress') {
      const remaining = strongest
        ? strongest.level.xpNeededForNext -
          strongest.level.xpIntoLevel
        : 0;

      return {
        title: 'Progresser',
        metric: strongest
          ? CATEGORY_LABELS[strongest.category]
          : '—',
        detail: strongest
          ? `${strongest.ledger.totalXp} XP sur ton axe le plus avancé, avec ${remaining} XP avant le niveau suivant. ${
              weakest
                ? `${CATEGORY_LABELS[weakest.category]} est l’axe à renforcer ensuite.`
                : ''
            }`
          : 'Aucune donnée de progression disponible.',
      };
    }

    if (selectedSection === 'measure') {
      return {
        title: 'Mesurer',
        metric: `${Math.round(
          ratio.verifiedShare * 100,
        )} %`,
        detail: `${ratio.verifiedXp} XP proviennent de preuves vérifiées et ${ratio.regularityXp} XP de la régularité. ${pendingTotal} XP de régularité attendent encore une preuve suffisante pour être libérés.`,
      };
    }

    if (selectedSection === 'competition') {
      return {
        title: 'Compétition',
        metric: `${ratio.verifiedXp} XP`,
        detail:
          'Ce volume vérifié est éligible aux comparaisons compétitives. Les XP en réserve et la présence brute restent exclus des résultats classés.',
      };
    }

    return {
      title: 'Joueur',
      metric: `LVL ${globalLevel.level}`,
      detail: `${state.globalTotalXp} XP au total, ${state.qualityStreak} jours de streak qualité et ${state.presenceStreak} jours de présence. Le streak qualité reste la référence principale.`,
    };
  }, [
    globalLevel.level,
    ratio,
    selectedSection,
    state,
  ]);

  return (
    <>
      <View style={styles.sectionHeader}>
        <View>
          <AppText
            variant="micro"
            color="textMuted"
            style={styles.uppercase}
          >
            ACCÈS RAPIDE
          </AppText>

          <AppText variant="titleLarge">
            Les quatre espaces
          </AppText>
        </View>
      </View>

      <View style={styles.grid}>
        {sections.map((section) => (
          <Pressable
            key={section.id}
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir ${section.label}`}
            onPress={() =>
              onSelectedSectionChange(section.id)
            }
            style={({ pressed }) => [
              styles.tilePressable,
              pressed && styles.pressed,
            ]}
          >
            <CutCard style={styles.tile} cutSize={12}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={section.icon}
                  size={21}
                  color={colors.volt}
                />
              </View>

              <View style={styles.tileText}>
                <AppText variant="label">
                  {section.label}
                </AppText>

                <AppText
                  variant="caption"
                  color="textMuted"
                >
                  {section.subtitle}
                </AppText>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </CutCard>
          </Pressable>
        ))}
      </View>

      <Modal
        visible={selectedSection !== null}
        transparent
        animationType="fade"
        onRequestClose={() =>
          onSelectedSectionChange(null)
        }
      >
        <Pressable
          style={styles.backdrop}
          onPress={() =>
            onSelectedSectionChange(null)
          }
        >
          <Pressable
            style={styles.sheet}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.handle} />

            <ScrollView
              contentContainerStyle={styles.sheetContent}
            >
              <View style={styles.sheetHeader}>
                <View style={styles.sheetIcon}>
                  <Ionicons
                    name={
                      sections.find(
                        (item) =>
                          item.id === selectedSection,
                      )?.icon ?? 'apps-outline'
                    }
                    size={24}
                    color={colors.volt}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fermer"
                  onPress={() =>
                    onSelectedSectionChange(null)
                  }
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={colors.textPrimary}
                  />
                </Pressable>
              </View>

              <AppText variant="h2">
                {content.title}
              </AppText>

              <AppText
                variant="scoreHero"
                color="volt"
              >
                {content.metric}
              </AppText>

              <AppText
                variant="body"
                color="textSecondary"
              >
                {content.detail}
              </AppText>

              <View style={styles.rulePanel}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.verified}
                />

                <AppText
                  variant="bodySmall"
                  color="textSecondary"
                  style={styles.ruleText}
                >
                  Cet accès lit directement les ledgers du
                  moteur XP. Aucune action secondaire ne peut
                  attribuer une récompense sans passer par sa
                  validation.
                </AppText>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  onSelectedSectionChange(null)
                }
                style={styles.closeCta}
              >
                <AppText
                  variant="label"
                  color="textOnVolt"
                >
                  Revenir à aujourd’hui
                </AppText>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: spacing[2],
  },
  uppercase: {
    letterSpacing: 1.4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  tilePressable: {
    width: '48%',
    flexGrow: 1,
  },
  tile: {
    minHeight: 98,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.voltDeep,
    backgroundColor: colors.voltWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    flex: 1,
    gap: spacing[1],
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#000000B3',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: colors.surface2,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginTop: spacing[3],
  },
  sheetContent: {
    padding: spacing[6],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.voltWash,
    borderWidth: 1,
    borderColor: colors.voltDeep,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surface3,
  },
  rulePanel: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radii.medium,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  ruleText: {
    flex: 1,
  },
  closeCta: {
    minHeight: 50,
    borderRadius: radii.medium,
    backgroundColor: colors.volt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
