import {
  describe,
  expect,
  it,
} from 'vitest';

import { dashboardQuests } from '../src/domain/dashboard';
import {
  applyXpEvent,
  applyXpEvents,
  assertXpStateInvariants,
  calculateRawXp,
  createInitialXpState,
  getGlobalRatioSnapshot,
  getLevelSnapshot,
  getRatioSnapshot,
  maxRegularityXpForVerified,
  REGULARITY_SHARE_MAXIMUM,
  VERIFIED_SHARE_MINIMUM,
} from '../src/domain/xp/engine';
import { createSeedXpState } from '../src/domain/xp/seed';
import {
  RegularityXpEvent,
  VerifiedXpEvent,
  XpCategory,
  XpEvent,
} from '../src/domain/xp/types';

function verifiedEvent(
  id: string,
  category: XpCategory = 'tir',
  progressDelta = 0.1,
  occurredAt =
    '2026-07-11T10:00:00.000Z',
): VerifiedXpEvent {
  return {
    id,
    category,
    source: 'verified_test',
    difficulty: 2,
    progressDelta,
    occurredAt,
    label: `Preuve ${id}`,
    receipt: {
      verificationId:
        `verification-${id}`,
      protocolId:
        'protocol-standard',
      integrityHash:
        `sha256-${id}`,
      verifiedAt: new Date(
        Date.parse(occurredAt) +
          60_000,
      ).toISOString(),
      verifier: 'server',
    },
  };
}

function qualityEvent(
  id: string,
  category: XpCategory = 'tir',
  occurredAt =
    '2026-07-11T12:00:00.000Z',
): RegularityXpEvent {
  return {
    id,
    category,
    source: 'quality_session',
    difficulty: 2,
    progressDelta: 0,
    occurredAt,
    label: `Séance ${id}`,
    session: {
      completedAt: new Date(
        Date.parse(occurredAt) +
          45 * 60_000,
      ).toISOString(),
      measuredFields: 5,
      qualityScore: 0.9,
      durationMinutes: 45,
    },
  };
}

function presenceEvent(
  id: string,
  category: XpCategory = 'tir',
  occurredAt =
    '2026-07-11T08:00:00.000Z',
): RegularityXpEvent {
  return {
    id,
    category,
    source: 'presence',
    difficulty: 1,
    progressDelta: 0,
    occurredAt,
    label: `Présence ${id}`,
  };
}

describe(
  'moteur XP Court Forge',
  () => {
    it(
      'place toute régularité en réserve tant qu’aucune preuve vérifiée n’existe',
      () => {
        const initial =
          createInitialXpState();

        const result = applyXpEvent(
          initial,
          qualityEvent(
            'quality-without-proof',
          ),
        );

        const ledger =
          result.state.categories.tir;

        expect(
          result.outcome.totalAwardedXp,
        ).toBe(0);

        expect(
          result.outcome
            .queuedRegularityXp,
        ).toBe(
          calculateRawXp(
            qualityEvent('raw-check'),
          ),
        );

        expect(
          ledger.regularityXp,
        ).toBe(0);

        expect(
          ledger.pendingRegularityXp,
        ).toBeGreaterThan(0);

        expect(
          getRatioSnapshot(ledger)
            .isCompliant,
        ).toBe(true);
      },
    );

    it(
      'libère la réserve après une preuve, sans jamais dépasser 30 % de régularité',
      () => {
        let state =
          createInitialXpState();

        state = applyXpEvent(
          state,
          qualityEvent(
            'quality-queued',
          ),
        ).state;

        const pendingBefore =
          state.categories.tir
            .pendingRegularityXp;

        const result = applyXpEvent(
          state,
          verifiedEvent(
            'proof-releases-pending',
          ),
        );

        const ledger =
          result.state.categories.tir;

        const ratio =
          getRatioSnapshot(ledger);

        expect(
          result.outcome
            .awardedVerifiedXp,
        ).toBeGreaterThan(0);

        expect(
          result.outcome
            .releasedRegularityXp,
        ).toBeGreaterThan(0);

        expect(
          result.outcome
            .releasedRegularityXp,
        ).toBeLessThanOrEqual(
          pendingBefore,
        );

        expect(
          ledger.regularityXp,
        ).toBeLessThanOrEqual(
          maxRegularityXpForVerified(
            ledger.verifiedXp,
          ),
        );

        expect(
          ratio.verifiedShare,
        ).toBeGreaterThanOrEqual(
          VERIFIED_SHARE_MINIMUM,
        );

        expect(
          ratio.regularityShare,
        ).toBeLessThanOrEqual(
          REGULARITY_SHARE_MAXIMUM,
        );

        expect(
          ratio.isCompliant,
        ).toBe(true);
      },
    );

    it(
      'plafonne une longue série de présences et conserve l’excédent en réserve',
      () => {
        let state = applyXpEvent(
          createInitialXpState(),
          verifiedEvent(
            'initial-proof',
          ),
        ).state;

        const events: XpEvent[] =
          Array.from(
            {
              length: 20,
            },
            (_, index) =>
              presenceEvent(
                `presence-${index}`,
                'tir',
                `2026-07-${String(
                  11 + index,
                ).padStart(
                  2,
                  '0',
                )}T08:00:00.000Z`,
              ),
          );

        state = applyXpEvents(
          state,
          events,
        );

        const ledger =
          state.categories.tir;

        const ratio =
          getRatioSnapshot(ledger);

        expect(
          ledger.pendingRegularityXp,
        ).toBeGreaterThan(0);

        expect(
          ledger.regularityXp,
        ).toBe(
          maxRegularityXpForVerified(
            ledger.verifiedXp,
          ),
        );

        expect(
          ratio.regularityShare,
        ).toBeLessThanOrEqual(0.3);

        expect(
          ratio.verifiedShare,
        ).toBeGreaterThanOrEqual(
          0.7,
        );

        assertXpStateInvariants(state);
      },
    );

    it(
      'applique le ratio indépendamment dans chacune des six catégories',
      () => {
        const categories: XpCategory[] =
          [
            'finition',
            'tir',
            'explosivite',
            'defense',
            'handle',
            'endurance',
          ];

        const events =
          categories.flatMap(
            (
              category,
              index,
            ): XpEvent[] => [
              verifiedEvent(
                `proof-${category}`,
                category,
                0.05 +
                  index * 0.01,
              ),
              qualityEvent(
                `quality-${category}`,
                category,
              ),
              presenceEvent(
                `presence-${category}`,
                category,
              ),
            ],
          );

        const state = applyXpEvents(
          createInitialXpState(),
          events,
        );

        categories.forEach(
          (category) => {
            expect(
              getRatioSnapshot(
                state.categories[
                  category
                ],
              ).isCompliant,
            ).toBe(true);
          },
        );

        expect(
          getGlobalRatioSnapshot(
            state,
          ).isCompliant,
        ).toBe(true);

        assertXpStateInvariants(state);
      },
    );

    it(
      'refuse une preuve vérifiée sans amélioration positive',
      () => {
        expect(() =>
          applyXpEvent(
            createInitialXpState(),
            verifiedEvent(
              'no-progress',
              'tir',
              0,
            ),
          ),
        ).toThrow(
          /progression positive/i,
        );

        expect(() =>
          applyXpEvent(
            createInitialXpState(),
            verifiedEvent(
              'negative-progress',
              'tir',
              -0.02,
            ),
          ),
        ).toThrow(
          /progression positive/i,
        );
      },
    );

    it(
      'ne compte jamais deux fois le même événement',
      () => {
        const event =
          verifiedEvent(
            'unique-proof',
          );

        const first = applyXpEvent(
          createInitialXpState(),
          event,
        );

        const second = applyXpEvent(
          first.state,
          event,
        );

        expect(
          second.outcome.duplicate,
        ).toBe(true);

        expect(
          second.outcome
            .totalAwardedXp,
        ).toBe(0);

        expect(second.state).toBe(
          first.state,
        );
      },
    );

    it(
      'calcule les niveaux avec des seuils croissants et une progression bornée',
      () => {
        const levelOne =
          getLevelSnapshot(
            0,
            'category',
          );

        const levelTwo =
          getLevelSnapshot(
            levelOne.nextLevelXp,
            'category',
          );

        const global =
          getLevelSnapshot(
            5_000,
            'global',
          );

        expect(
          levelOne.level,
        ).toBe(1);

        expect(
          levelTwo.level,
        ).toBe(2);

        expect(
          levelTwo.nextLevelXp,
        ).toBeGreaterThan(
          levelTwo.currentLevelXp,
        );

        expect(
          global.level,
        ).toBeGreaterThan(1);

        expect(
          global.progress,
        ).toBeGreaterThanOrEqual(
          0,
        );

        expect(
          global.progress,
        ).toBeLessThanOrEqual(1);
      },
    );

    it(
      'déclenche réellement une montée de niveau avec la quête vérifiée principale de la démo',
      () => {
        const state =
          createSeedXpState();

        const featuredQuest =
          dashboardQuests.find(
            (quest) =>
              quest.kind ===
              'verified_progress',
          );

        expect(
          featuredQuest,
        ).toBeDefined();

        const result =
          applyXpEvent(
            state,
            featuredQuest!.event,
          );

        expect(
          result.outcome
            .categoryLevelAfter >
            result.outcome
              .categoryLevelBefore ||
            result.outcome
              .globalLevelAfter >
              result.outcome
                .globalLevelBefore,
        ).toBe(true);
      },
    );

    it(
      'fait évoluer les streaks par jour calendaire et non par nombre d’événements',
      () => {
        let state =
          createInitialXpState();

        state = applyXpEvent(
          state,
          qualityEvent(
            'quality-day-one',
            'tir',
            '2026-07-09T10:00:00.000Z',
          ),
        ).state;

        state = applyXpEvent(
          state,
          qualityEvent(
            'quality-same-day',
            'handle',
            '2026-07-09T18:00:00.000Z',
          ),
        ).state;

        expect(
          state.qualityStreak,
        ).toBe(1);

        expect(
          state.presenceStreak,
        ).toBe(1);

        state = applyXpEvent(
          state,
          presenceEvent(
            'presence-next-day',
            'tir',
            '2026-07-10T08:00:00.000Z',
          ),
        ).state;

        expect(
          state.qualityStreak,
        ).toBe(1);

        expect(
          state.presenceStreak,
        ).toBe(2);

        state = applyXpEvent(
          state,
          qualityEvent(
            'quality-after-gap',
            'tir',
            '2026-07-11T10:00:00.000Z',
          ),
        ).state;

        expect(
          state.qualityStreak,
        ).toBe(1);

        expect(
          state.presenceStreak,
        ).toBe(3);
      },
    );
  },
);
