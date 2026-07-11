import { Ionicons } from '@expo/vector-icons';
import React, {
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { CategoryProgressList } from '@/components/CategoryProgressList';
import { CutCard } from '@/components/CutCard';
import { PlayerSummaryCard } from '@/components/PlayerSummaryCard';
import { QuestCard } from '@/components/QuestCard';
import {
  QuickAccess,
  SectionId,
} from '@/components/QuickAccess';
import { RewardFeedback } from '@/components/RewardFeedback';
import { TwinStreakCard } from '@/components/TwinStreakCard';
import {
  colors,
  radii,
  spacing,
} from '@/design/tokens';
import { dashboardQuests } from '@/domain/dashboard';
import { useXp } from '@/state/xp-context';

function formatToday(): string {
  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    },
  )
    .format(new Date())
    .toUpperCase();
}

export function TodayDashboard() {
  const { width } =
    useWindowDimensions();

  const scrollRef =
    useRef<ScrollView>(null);

  const [
    selectedSection,
    setSelectedSection,
  ] = useState<SectionId | null>(null);

  const {
    xpState,
    completedQuestIds,
    completeQuest,
    lastOutcome,
    clearLastOutcome,
    resetDemo,
    isHydrated,
  } = useXp();

  const wide = width >= 900;

  const featuredQuest = useMemo(
    () =>
      dashboardQuests.find(
        (quest) =>
          !completedQuestIds.includes(
            quest.id,
          ),
      ) ?? dashboardQuests[0],
    [completedQuestIds],
  );

  const secondaryQuests =
    dashboardQuests.filter(
      (quest) =>
        quest.id !== featuredQuest?.id,
    );

  const allDone =
    dashboardQuests.every((quest) =>
      completedQuestIds.includes(
        quest.id,
      ),
    );

  function handleComplete(
    questId: string,
  ) {
    try {
      completeQuest(questId);
    } catch (error) {
      Alert.alert(
        'Récompense refusée',
        error instanceof Error
          ? error.message
          : 'Le moteur XP a refusé cet événement.',
      );
    }
  }

  function confirmReset() {
    const execute = () =>
      resetDemo().catch(
        () => undefined,
      );

    if (Platform.OS === 'web') {
      const accepted =
        typeof window !== 'undefined'
          ? window.confirm(
              'Réinitialiser la démonstration Court Forge ?',
            )
          : false;

      if (accepted) {
        execute();
      }

      return;
    }

    Alert.alert(
      'Réinitialiser la démonstration',
      'Les quêtes du jour et les XP locaux seront restaurés.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: execute,
        },
      ],
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
        'bottom',
      ]}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <AppText
              variant="micro"
              color="volt"
              style={styles.eyebrow}
            >
              COURT//FORGE
            </AppText>

            <AppText variant="h1">
              AUJOURD’HUI
            </AppText>

            <AppText
              variant="caption"
              color="textSecondary"
            >
              {formatToday()}
            </AppText>
          </View>

          <View style={styles.headerActions}>
            {!isHydrated ? (
              <View style={styles.syncPill}>
                <View
                  style={styles.syncDot}
                />

                <AppText
                  variant="caption"
                  color="textSecondary"
                >
                  Synchronisation
                </AppText>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Réinitialiser la démonstration"
              onPress={confirmReset}
              style={({ pressed }) => [
                styles.iconButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={21}
                color={
                  colors.textSecondary
                }
              />
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.dashboardGrid,
            wide &&
              styles.dashboardGridWide,
          ]}
        >
          <View
            style={[
              styles.column,
              wide &&
                styles.primaryColumn,
            ]}
          >
            <PlayerSummaryCard
              state={xpState}
            />

            <View
              style={styles.sectionTitleRow}
            >
              <View>
                <AppText
                  variant="micro"
                  color="textMuted"
                  style={styles.eyebrow}
                >
                  PROCHAINE ACTION
                </AppText>

                <AppText variant="titleLarge">
                  Ce qui compte maintenant
                </AppText>
              </View>

              <View
                style={styles.priorityPill}
              >
                <Ionicons
                  name="navigate-outline"
                  size={15}
                  color={colors.volt}
                />

                <AppText
                  variant="caption"
                  color="volt"
                >
                  PRIORITÉ
                </AppText>
              </View>
            </View>

            {allDone ? (
              <CutCard
                style={styles.completePanel}
                elevated
                cutSize={22}
              >
                <View
                  style={styles.completeIcon}
                >
                  <Ionicons
                    name="checkmark-done"
                    size={30}
                    color={
                      colors.textOnVolt
                    }
                  />
                </View>

                <View
                  style={styles.completeText}
                >
                  <AppText variant="h3">
                    Journée validée
                  </AppText>

                  <AppText
                    variant="bodySmall"
                    color="textSecondary"
                  >
                    Toutes les actions du
                    jour sont enregistrées.
                    Les XP en réserve restent
                    bloqués jusqu’à une
                    nouvelle preuve vérifiée.
                  </AppText>
                </View>
              </CutCard>
            ) : featuredQuest ? (
              <QuestCard
                quest={featuredQuest}
                completed={completedQuestIds.includes(
                  featuredQuest.id,
                )}
                featured
                onComplete={
                  handleComplete
                }
              />
            ) : null}

            <TwinStreakCard
              qualityStreak={
                xpState.qualityStreak
              }
              presenceStreak={
                xpState.presenceStreak
              }
            />

            <View
              style={styles.sectionTitleRow}
            >
              <View>
                <AppText
                  variant="micro"
                  color="textMuted"
                  style={styles.eyebrow}
                >
                  QUÊTES DU JOUR
                </AppText>

                <AppText variant="titleLarge">
                  Mesurer avant de
                  récompenser
                </AppText>
              </View>

              <AppText
                variant="metricSmall"
                color="textSecondary"
              >
                {completedQuestIds.length}/
                {dashboardQuests.length}
              </AppText>
            </View>

            <View
              style={styles.questList}
            >
              {secondaryQuests.map(
                (quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    completed={completedQuestIds.includes(
                      quest.id,
                    )}
                    onComplete={
                      handleComplete
                    }
                  />
                ),
              )}

              {allDone &&
              featuredQuest ? (
                <QuestCard
                  quest={featuredQuest}
                  completed
                  onComplete={
                    handleComplete
                  }
                />
              ) : null}
            </View>
          </View>

          <View
            style={[
              styles.column,
              wide &&
                styles.secondaryColumn,
            ]}
          >
            <CategoryProgressList
              state={xpState}
            />

            <QuickAccess
              state={xpState}
              selectedSection={
                selectedSection
              }
              onSelectedSectionChange={
                setSelectedSection
              }
            />

            <CutCard
              style={styles.principleCard}
              cutSize={14}
            >
              <View
                style={
                  styles.principleIcon
                }
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color={colors.verified}
                />
              </View>

              <View
                style={
                  styles.principleText
                }
              >
                <AppText variant="label">
                  Règle active
                </AppText>

                <AppText
                  variant="bodySmall"
                  color="textSecondary"
                >
                  La régularité ne peut
                  jamais dépasser 30 % des
                  XP attribués. Tout
                  excédent attend dans une
                  réserve invisible du
                  classement jusqu’à
                  validation d’un progrès
                  réel.
                </AppText>
              </View>
            </CutCard>
          </View>
        </View>
      </ScrollView>

      <View
        style={
          styles.bottomNavigationShell
        }
      >
        <View
          style={styles.bottomNavigation}
        >
          {[
            {
              icon:
                'today-outline' as const,
              label: 'Aujourd’hui',
              active: true,
            },
            {
              icon:
                'trending-up-outline' as const,
              label: 'Progresser',
              active: false,
            },
            {
              icon:
                'analytics-outline' as const,
              label: 'Mesurer',
              active: false,
            },
            {
              icon:
                'trophy-outline' as const,
              label: 'Compétition',
              active: false,
            },
            {
              icon:
                'person-outline' as const,
              label: 'Joueur',
              active: false,
            },
          ].map((item) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={
                item.label
              }
              onPress={() => {
                if (item.active) {
                  scrollRef.current?.scrollTo(
                    {
                      y: 0,
                      animated: true,
                    },
                  );

                  return;
                }

                const sectionMap: Record<
                  string,
                  SectionId
                > = {
                  Progresser:
                    'progress',
                  Mesurer: 'measure',
                  Compétition:
                    'competition',
                  Joueur: 'player',
                };

                setSelectedSection(
                  sectionMap[item.label] ??
                    null,
                );
              }}
              style={styles.navItem}
            >
              <Ionicons
                name={item.icon}
                size={21}
                color={
                  item.active
                    ? colors.volt
                    : colors.textMuted
                }
              />

              <AppText
                variant="micro"
                color={
                  item.active
                    ? 'volt'
                    : 'textMuted'
                }
              >
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <RewardFeedback
        outcome={lastOutcome}
        onFinished={clearLastOutcome}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.abyss,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[6],
  },
  header: {
    minHeight: 96,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[4],
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  eyebrow: {
    letterSpacing: 1.6,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface1,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.pending,
  },
  dashboardGrid: {
    gap: spacing[6],
  },
  dashboardGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    gap: spacing[5],
  },
  primaryColumn: {
    flex: 1.35,
  },
  secondaryColumn: {
    flex: 0.9,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing[4],
    marginTop: spacing[1],
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.voltDeep,
    backgroundColor: colors.voltWash,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  questList: {
    gap: spacing[4],
  },
  completePanel: {
    minHeight: 160,
    padding: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    borderColor: colors.voltDeep,
  },
  completeIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.volt,
  },
  completeText: {
    flex: 1,
    gap: spacing[2],
  },
  principleCard: {
    padding: spacing[5],
    flexDirection: 'row',
    gap: spacing[4],
  },
  principleIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.medium,
    backgroundColor: '#2CE0C11A',
    borderWidth: 1,
    borderColor: colors.verified,
    alignItems: 'center',
    justifyContent: 'center',
  },
  principleText: {
    flex: 1,
    gap: spacing[2],
  },
  bottomNavigationShell: {
    backgroundColor: colors.courtBlack,
    borderTopWidth: 1,
    borderTopColor:
      colors.borderSubtle,
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
  },
  bottomNavigation: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    backgroundColor: colors.courtBlack,
    borderWidth: 1,
    borderColor:
      colors.borderSubtle,
    borderRadius: radii.large,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
  },
  navItem: {
    minWidth: 56,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
});
