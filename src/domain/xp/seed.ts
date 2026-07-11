import {
  applyXpEvents,
  createInitialXpState,
} from './engine';

import {
  XpEvent,
  XpState,
} from './types';

const verifiedReceipt = (
  id: string,
  protocolId: string,
  date: string,
) => ({
  verificationId: `verify-${id}`,
  protocolId,
  integrityHash:
    `sha256-${id}-court-forge-signed`,
  verifiedAt: date,
  verifier: 'server' as const,
});

export const seedEvents: XpEvent[] = [
  {
    id: 'seed-finishing-test-01',
    category: 'finition',
    source: 'verified_test',
    difficulty: 2,
    progressDelta: 0.08,
    occurredAt:
      '2026-07-05T17:00:00.000Z',
    label: 'Mikan drill standardisé',
    receipt: verifiedReceipt(
      'finishing-01',
      'finish-mikan-60',
      '2026-07-05T17:08:00.000Z',
    ),
  },
  {
    id: 'seed-shooting-video-01',
    category: 'tir',
    source: 'verified_video',
    difficulty: 3,
    progressDelta: 0.11,
    occurredAt:
      '2026-07-06T16:00:00.000Z',
    label: 'Série vidéo 5 spots',
    receipt: verifiedReceipt(
      'shooting-01',
      'shoot-five-spots-25',
      '2026-07-06T16:12:00.000Z',
    ),
  },
  {
    id: 'seed-jump-measurement-01',
    category: 'explosivite',
    source: 'standard_measurement',
    difficulty: 2,
    progressDelta: 0.06,
    occurredAt:
      '2026-07-07T09:00:00.000Z',
    label: 'Saut vertical standardisé',
    receipt: verifiedReceipt(
      'jump-01',
      'vertical-jump-reach',
      '2026-07-07T09:05:00.000Z',
    ),
  },
  {
    id: 'seed-defense-test-01',
    category: 'defense',
    source: 'verified_test',
    difficulty: 2,
    progressDelta: 0.04,
    occurredAt:
      '2026-07-08T10:00:00.000Z',
    label: 'Lane agility test',
    receipt: verifiedReceipt(
      'defense-01',
      'lane-agility-standard',
      '2026-07-08T10:06:00.000Z',
    ),
  },
  {
    id: 'seed-handle-video-01',
    category: 'handle',
    source: 'verified_video',
    difficulty: 2,
    progressDelta: 0.09,
    occurredAt:
      '2026-07-09T15:00:00.000Z',
    label: 'Handle two-ball chronométré',
    receipt: verifiedReceipt(
      'handle-01',
      'two-ball-45',
      '2026-07-09T15:09:00.000Z',
    ),
  },
  {
    id: 'seed-endurance-test-01',
    category: 'endurance',
    source: 'verified_test',
    difficulty: 2,
    progressDelta: 0.07,
    occurredAt:
      '2026-07-10T08:00:00.000Z',
    label: 'Suicides 6 lignes',
    receipt: verifiedReceipt(
      'endurance-01',
      'suicides-six-lines',
      '2026-07-10T08:11:00.000Z',
    ),
  },
  ...(
    [
      'finition',
      'tir',
      'explosivite',
      'defense',
      'handle',
      'endurance',
    ] as const
  ).flatMap(
    (
      category,
      index,
    ): XpEvent[] => {
      const day = String(
        index + 5,
      ).padStart(2, '0');

      return [
        {
          id:
            `seed-quality-${category}-01`,
          category,
          source: 'quality_session',
          difficulty: 2,
          progressDelta: 0,
          occurredAt:
            `2026-07-${day}T18:00:00.000Z`,
          label:
            `Séance ${category} documentée`,
          session: {
            completedAt:
              `2026-07-${day}T18:55:00.000Z`,
            measuredFields: 5,
            qualityScore: 0.84,
            durationMinutes: 55,
          },
        },
        {
          id:
            `seed-presence-${category}-01`,
          category,
          source: 'presence',
          difficulty: 1,
          progressDelta: 0,
          occurredAt:
            `2026-07-${day}T17:55:00.000Z`,
          label:
            `Présence ${category}`,
        },
      ];
    },
  ),
];

export function createSeedXpState(): XpState {
  return applyXpEvents(
    createInitialXpState(),
    seedEvents,
  );
}
