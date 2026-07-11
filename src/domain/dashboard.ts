import { XpEvent } from './xp/types';

export type QuestKind =
  | 'verified_progress'
  | 'quality'
  | 'presence';

export interface DashboardQuest {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  evidenceLabel: string;
  estimatedMinutes: number;
  kind: QuestKind;
  actionLabel: string;
  event: XpEvent;
}

const now = new Date().toISOString();

export const dashboardQuests: DashboardQuest[] = [
  {
    id: 'today-shooting-proof',
    title: '5 spots — 25 tirs',
    description:
      'Résultat déjà contrôlé : 18/25, contre 15/25 sur la baseline.',
    whyItMatters:
      'La validation confirme une amélioration réelle de 20 % sur le protocole.',
    evidenceLabel: 'VIDÉO VÉRIFIÉE',
    estimatedMinutes: 12,
    kind: 'verified_progress',
    actionLabel: 'Réclamer l’XP',
    event: {
      id: 'today-shooting-proof-event',
      category: 'tir',
      source: 'verified_test',
      difficulty: 3,
      progressDelta: 0.3,
      occurredAt: now,
      label: 'Test 5 spots validé',
      receipt: {
        verificationId: 'verify-today-shooting-proof',
        protocolId: 'shoot-five-spots-25',
        integrityHash:
          'sha256-server-signed-today-shooting-proof',
        verifiedAt: now,
        verifier: 'server',
      },
    },
  },
  {
    id: 'today-handle-quality',
    title: 'Handle sous fatigue',
    description:
      '6 séries, erreurs et temps de récupération déjà renseignés dans le journal.',
    whyItMatters:
      'Les données structurées alimentent le streak de qualité, sous le plafond 30 %.',
    evidenceLabel: 'DONNÉES SAISIES',
    estimatedMinutes: 38,
    kind: 'quality',
    actionLabel: 'Valider la séance',
    event: {
      id: 'today-handle-quality-event',
      category: 'handle',
      source: 'quality_session',
      difficulty: 2,
      progressDelta: 0,
      occurredAt: now,
      label: 'Séance handle documentée',
      session: {
        completedAt: now,
        measuredFields: 6,
        qualityScore: 0.91,
        durationMinutes: 38,
      },
    },
  },
  {
    id: 'today-presence-endurance',
    title: 'Présence — récupération active',
    description:
      'Confirmer uniquement la présence à la session de mobilité légère.',
    whyItMatters:
      'Le streak de présence reste secondaire et ne vaut que quelques XP bruts.',
    evidenceLabel: 'PRÉSENCE',
    estimatedMinutes: 15,
    kind: 'presence',
    actionLabel: 'Confirmer',
    event: {
      id: 'today-presence-endurance-event',
      category: 'endurance',
      source: 'presence',
      difficulty: 1,
      progressDelta: 0,
      occurredAt: now,
      label: 'Présence récupération active',
    },
  },
];
