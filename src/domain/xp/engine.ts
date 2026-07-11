import {
  CategoryLedger,
  Difficulty,
  LevelSnapshot,
  RatioSnapshot,
  REGULARITY_SOURCES,
  RegularityXpEvent,
  VERIFIED_SOURCES,
  VerifiedXpEvent,
  XP_CATEGORIES,
  XpBucket,
  XpCategory,
  XpEvent,
  XpOutcome,
  XpSource,
  XpState,
} from './types';

export const VERIFIED_SHARE_MINIMUM = 0.7;
export const REGULARITY_SHARE_MAXIMUM = 0.3;

const REGULARITY_TO_VERIFIED_RATIO =
  REGULARITY_SHARE_MAXIMUM / VERIFIED_SHARE_MINIMUM;

const MILLISECONDS_PER_DAY = 86_400_000;

const SOURCE_BASE_XP: Record<XpSource, number> = {
  verified_test: 96,
  verified_video: 84,
  standard_measurement: 72,
  quality_session: 28,
  presence: 5,
};

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  1: 0.9,
  2: 1,
  3: 1.18,
};

const emptyLedger = (): CategoryLedger => ({
  verifiedXp: 0,
  regularityXp: 0,
  pendingRegularityXp: 0,
  totalXp: 0,
  eventCount: 0,
});

export function createInitialXpState(): XpState {
  return {
    categories: {
      finition: emptyLedger(),
      tir: emptyLedger(),
      explosivite: emptyLedger(),
      defense: emptyLedger(),
      handle: emptyLedger(),
      endurance: emptyLedger(),
    },
    appliedEventIds: [],
    globalTotalXp: 0,
    qualityStreak: 0,
    presenceStreak: 0,
    lastQualityStreakDate: null,
    lastPresenceStreakDate: null,
  };
}

export function getBucket(source: XpSource): XpBucket {
  return REGULARITY_SOURCES.includes(
    source as (typeof REGULARITY_SOURCES)[number],
  )
    ? 'regularity'
    : 'verified';
}

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(max, Math.max(min, value));
}

function assertFiniteNumber(
  value: number,
  field: string,
): void {
  if (!Number.isFinite(value)) {
    throw new Error(
      `${field} doit être un nombre fini.`,
    );
  }
}

function isValidIsoDate(value: string): boolean {
  return (
    Boolean(value.trim()) &&
    !Number.isNaN(Date.parse(value))
  );
}

function validateVerifiedEvent(
  event: VerifiedXpEvent,
): void {
  const receipt = event.receipt;

  if (
    !receipt ||
    !receipt.verificationId.trim() ||
    !receipt.protocolId.trim() ||
    !receipt.integrityHash.trim() ||
    !isValidIsoDate(receipt.verifiedAt) ||
    (
      receipt.verifier !== 'server' &&
      receipt.verifier !== 'coach'
    )
  ) {
    throw new Error(
      'Une source vérifiée exige un reçu de validation complet et daté.',
    );
  }

  if (
    Date.parse(receipt.verifiedAt) <
    Date.parse(event.occurredAt)
  ) {
    throw new Error(
      'La validation ne peut pas précéder la mesure.',
    );
  }

  if (
    event.progressDelta <= 0 ||
    event.progressDelta > 1
  ) {
    throw new Error(
      'Une preuve vérifiée ne génère de l’XP que pour une progression positive mesurée.',
    );
  }
}

function validateRegularityEvent(
  event: RegularityXpEvent,
): void {
  if (Math.abs(event.progressDelta) > 1e-9) {
    throw new Error(
      'La régularité ne peut pas déclarer directement une progression technique.',
    );
  }

  if (event.source === 'presence') {
    if (event.difficulty !== 1) {
      throw new Error(
        'Une présence brute utilise toujours la difficulté minimale.',
      );
    }

    return;
  }

  const session = event.session;

  if (!session) {
    throw new Error(
      'Une séance de qualité exige des données structurées.',
    );
  }

  if (
    !Number.isInteger(session.measuredFields) ||
    session.measuredFields < 3
  ) {
    throw new Error(
      'Une séance de qualité exige au moins trois champs mesurés.',
    );
  }

  if (
    session.qualityScore < 0.6 ||
    session.qualityScore > 1
  ) {
    throw new Error(
      'Le score de qualité doit être compris entre 0,60 et 1,00.',
    );
  }

  if (
    session.durationMinutes < 15 ||
    session.durationMinutes > 240
  ) {
    throw new Error(
      'La durée mesurée doit être comprise entre 15 et 240 minutes.',
    );
  }

  if (!isValidIsoDate(session.completedAt)) {
    throw new Error(
      'La séance de qualité exige une date valide.',
    );
  }

  if (
    Date.parse(session.completedAt) <
    Date.parse(event.occurredAt)
  ) {
    throw new Error(
      'La fin de séance ne peut pas précéder son début.',
    );
  }
}

export function validateXpEvent(event: XpEvent): void {
  if (!event || typeof event !== 'object') {
    throw new Error('Événement XP invalide.');
  }

  if (!event.id.trim()) {
    throw new Error(
      "L'événement XP exige un identifiant.",
    );
  }

  if (!event.label.trim()) {
    throw new Error(
      "L'événement XP exige un libellé.",
    );
  }

  if (!XP_CATEGORIES.includes(event.category)) {
    throw new Error('Catégorie XP inconnue.');
  }

  if (![1, 2, 3].includes(event.difficulty)) {
    throw new Error('Difficulté XP inconnue.');
  }

  if (
    ![
      ...VERIFIED_SOURCES,
      ...REGULARITY_SOURCES,
    ].includes(event.source)
  ) {
    throw new Error('Source XP inconnue.');
  }

  if (!isValidIsoDate(event.occurredAt)) {
    throw new Error(
      "La date de l'événement XP est invalide.",
    );
  }

  assertFiniteNumber(
    event.progressDelta,
    'progressDelta',
  );

  if (getBucket(event.source) === 'verified') {
    validateVerifiedEvent(event as VerifiedXpEvent);
  } else {
    validateRegularityEvent(
      event as RegularityXpEvent,
    );
  }
}

export function calculateRawXp(
  event: XpEvent,
): number {
  validateXpEvent(event);

  if (event.source === 'presence') {
    return SOURCE_BASE_XP.presence;
  }

  if (event.source === 'quality_session') {
    const session = event.session;

    if (!session) {
      throw new Error(
        'Données structurées absentes.',
      );
    }

    const qualityMultiplier =
      0.7 + session.qualityScore * 0.35;

    const durationMultiplier = clamp(
      session.durationMinutes / 60,
      0.75,
      1.2,
    );

    return Math.max(
      1,
      Math.round(
        SOURCE_BASE_XP.quality_session *
          DIFFICULTY_MULTIPLIER[
            event.difficulty
          ] *
          qualityMultiplier *
          durationMultiplier,
      ),
    );
  }

  const positiveDelta = clamp(
    event.progressDelta,
    0,
    0.3,
  );

  const progressMultiplier =
    1 + positiveDelta * 2.2;

  return Math.max(
    1,
    Math.round(
      SOURCE_BASE_XP[event.source] *
        DIFFICULTY_MULTIPLIER[
          event.difficulty
        ] *
        progressMultiplier,
    ),
  );
}

export function maxRegularityXpForVerified(
  verifiedXp: number,
): number {
  return Math.floor(
    Math.max(0, verifiedXp) *
      REGULARITY_TO_VERIFIED_RATIO,
  );
}

function levelThreshold(
  level: number,
  scope: 'category' | 'global',
): number {
  if (level <= 1) {
    return 0;
  }

  const base =
    scope === 'category' ? 110 : 700;

  return Math.round(
    base * Math.pow(level - 1, 1.55),
  );
}

export function getLevelSnapshot(
  totalXp: number,
  scope: 'category' | 'global' = 'category',
): LevelSnapshot {
  const safeXp = Math.max(
    0,
    Math.floor(totalXp),
  );

  let level = 1;

  while (
    levelThreshold(level + 1, scope) <= safeXp
  ) {
    level += 1;
  }

  const currentLevelXp = levelThreshold(
    level,
    scope,
  );

  const nextLevelXp = levelThreshold(
    level + 1,
    scope,
  );

  const xpIntoLevel =
    safeXp - currentLevelXp;

  const xpNeededForNext =
    nextLevelXp - currentLevelXp;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpNeededForNext,
    progress:
      xpNeededForNext === 0
        ? 1
        : clamp(
            xpIntoLevel / xpNeededForNext,
            0,
            1,
          ),
  };
}

export function getRatioSnapshot(
  ledger: CategoryLedger,
): RatioSnapshot {
  const totalXp =
    ledger.verifiedXp + ledger.regularityXp;

  const verifiedShare =
    totalXp === 0
      ? 1
      : ledger.verifiedXp / totalXp;

  const regularityShare =
    totalXp === 0
      ? 0
      : ledger.regularityXp / totalXp;

  return {
    verifiedXp: ledger.verifiedXp,
    regularityXp: ledger.regularityXp,
    totalXp,
    verifiedShare,
    regularityShare,
    isCompliant:
      totalXp === 0 ||
      (
        verifiedShare + 1e-9 >=
          VERIFIED_SHARE_MINIMUM &&
        regularityShare <=
          REGULARITY_SHARE_MAXIMUM + 1e-9
      ),
  };
}

export function getGlobalRatioSnapshot(
  state: XpState,
): RatioSnapshot {
  const totals = XP_CATEGORIES.reduce(
    (accumulator, category) => {
      const ledger =
        state.categories[category];

      accumulator.verifiedXp +=
        ledger.verifiedXp;

      accumulator.regularityXp +=
        ledger.regularityXp;

      return accumulator;
    },
    {
      verifiedXp: 0,
      regularityXp: 0,
    },
  );

  return getRatioSnapshot({
    ...emptyLedger(),
    verifiedXp: totals.verifiedXp,
    regularityXp: totals.regularityXp,
    totalXp:
      totals.verifiedXp +
      totals.regularityXp,
  });
}

function cloneState(state: XpState): XpState {
  return {
    ...state,
    appliedEventIds: [
      ...state.appliedEventIds,
    ],
    categories: {
      finition: {
        ...state.categories.finition,
      },
      tir: {
        ...state.categories.tir,
      },
      explosivite: {
        ...state.categories.explosivite,
      },
      defense: {
        ...state.categories.defense,
      },
      handle: {
        ...state.categories.handle,
      },
      endurance: {
        ...state.categories.endurance,
      },
    },
  };
}

function sumGlobalXp(state: XpState): number {
  return XP_CATEGORIES.reduce(
    (total, category) =>
      total +
      state.categories[category].totalXp,
    0,
  );
}

function toDayKey(isoDate: string): string {
  return new Date(isoDate)
    .toISOString()
    .slice(0, 10);
}

function dayDistance(
  fromDay: string,
  toDay: string,
): number {
  const from = Date.parse(
    `${fromDay}T00:00:00.000Z`,
  );

  const to = Date.parse(
    `${toDay}T00:00:00.000Z`,
  );

  return Math.round(
    (to - from) / MILLISECONDS_PER_DAY,
  );
}

function updateDailyStreak(
  currentStreak: number,
  lastDay: string | null,
  occurredAt: string,
): {
  streak: number;
  lastDay: string;
} {
  const eventDay = toDayKey(occurredAt);

  if (!lastDay) {
    return {
      streak: 1,
      lastDay: eventDay,
    };
  }

  const distance = dayDistance(
    lastDay,
    eventDay,
  );

  if (distance < 0) {
    return {
      streak: currentStreak,
      lastDay,
    };
  }

  if (distance === 0) {
    return {
      streak: currentStreak,
      lastDay,
    };
  }

  if (distance === 1) {
    return {
      streak: currentStreak + 1,
      lastDay: eventDay,
    };
  }

  return {
    streak: 1,
    lastDay: eventDay,
  };
}

function applyRegularityStreaks(
  state: XpState,
  event: RegularityXpEvent,
): void {
  const presence = updateDailyStreak(
    state.presenceStreak,
    state.lastPresenceStreakDate,
    event.occurredAt,
  );

  state.presenceStreak = presence.streak;
  state.lastPresenceStreakDate =
    presence.lastDay;

  if (event.source === 'quality_session') {
    const quality = updateDailyStreak(
      state.qualityStreak,
      state.lastQualityStreakDate,
      event.occurredAt,
    );

    state.qualityStreak = quality.streak;
    state.lastQualityStreakDate =
      quality.lastDay;
  }
}

function assertCategoryInvariant(
  category: XpCategory,
  ledger: CategoryLedger,
): void {
  const ratio = getRatioSnapshot(ledger);

  if (!ratio.isCompliant) {
    throw new Error(
      `Invariant 70/30 violé pour la catégorie ${category}.`,
    );
  }

  if (
    ledger.totalXp !==
    ledger.verifiedXp + ledger.regularityXp
  ) {
    throw new Error(
      `Total XP incohérent pour la catégorie ${category}.`,
    );
  }

  if (ledger.pendingRegularityXp < 0) {
    throw new Error(
      `Réserve de régularité négative pour la catégorie ${category}.`,
    );
  }

  if (
    ledger.eventCount < 0 ||
    !Number.isInteger(ledger.eventCount)
  ) {
    throw new Error(
      `Compteur d’événements incohérent pour la catégorie ${category}.`,
    );
  }
}

export function assertXpStateInvariants(
  state: XpState,
): void {
  XP_CATEGORIES.forEach((category) =>
    assertCategoryInvariant(
      category,
      state.categories[category],
    ),
  );

  if (
    state.globalTotalXp !==
    sumGlobalXp(state)
  ) {
    throw new Error(
      'Le total XP global est incohérent.',
    );
  }

  if (
    state.qualityStreak < 0 ||
    state.presenceStreak < 0
  ) {
    throw new Error(
      'Un streak ne peut pas être négatif.',
    );
  }

  if (
    new Set(state.appliedEventIds).size !==
    state.appliedEventIds.length
  ) {
    throw new Error(
      'Un identifiant d’événement XP est dupliqué dans le registre.',
    );
  }
}

export function applyXpEvent(
  state: XpState,
  event: XpEvent,
): {
  state: XpState;
  outcome: XpOutcome;
} {
  validateXpEvent(event);
  assertXpStateInvariants(state);

  const rawXp = calculateRawXp(event);

  const globalLevelBefore = getLevelSnapshot(
    state.globalTotalXp,
    'global',
  ).level;

  const categoryLedgerBefore =
    state.categories[event.category];

  const categoryLevelBefore =
    getLevelSnapshot(
      categoryLedgerBefore.totalXp,
      'category',
    ).level;

  if (
    state.appliedEventIds.includes(event.id)
  ) {
    return {
      state,
      outcome: {
        eventId: event.id,
        category: event.category,
        source: event.source,
        rawXp,
        awardedVerifiedXp: 0,
        awardedRegularityXp: 0,
        queuedRegularityXp: 0,
        releasedRegularityXp: 0,
        totalAwardedXp: 0,
        globalLevelBefore,
        globalLevelAfter:
          globalLevelBefore,
        categoryLevelBefore,
        categoryLevelAfter:
          categoryLevelBefore,
        duplicate: true,
        message:
          'Événement déjà comptabilisé.',
      },
    };
  }

  const nextState = cloneState(state);

  const ledger =
    nextState.categories[event.category];

  let awardedVerifiedXp = 0;
  let awardedRegularityXp = 0;
  let queuedRegularityXp = 0;
  let releasedRegularityXp = 0;

  if (
    getBucket(event.source) === 'verified'
  ) {
    awardedVerifiedXp = rawXp;

    ledger.verifiedXp +=
      awardedVerifiedXp;

    const allowedRegularity =
      maxRegularityXpForVerified(
        ledger.verifiedXp,
      );

    const freeRegularityCapacity =
      Math.max(
        0,
        allowedRegularity -
          ledger.regularityXp,
      );

    releasedRegularityXp = Math.min(
      ledger.pendingRegularityXp,
      freeRegularityCapacity,
    );

    ledger.pendingRegularityXp -=
      releasedRegularityXp;

    ledger.regularityXp +=
      releasedRegularityXp;

    awardedRegularityXp =
      releasedRegularityXp;
  } else {
    const regularityEvent =
      event as RegularityXpEvent;

    const allowedRegularity =
      maxRegularityXpForVerified(
        ledger.verifiedXp,
      );

    const freeRegularityCapacity =
      Math.max(
        0,
        allowedRegularity -
          ledger.regularityXp,
      );

    awardedRegularityXp = Math.min(
      rawXp,
      freeRegularityCapacity,
    );

    queuedRegularityXp =
      rawXp - awardedRegularityXp;

    ledger.regularityXp +=
      awardedRegularityXp;

    ledger.pendingRegularityXp +=
      queuedRegularityXp;

    applyRegularityStreaks(
      nextState,
      regularityEvent,
    );
  }

  ledger.totalXp =
    ledger.verifiedXp +
    ledger.regularityXp;

  ledger.eventCount += 1;

  nextState.appliedEventIds.push(
    event.id,
  );

  nextState.globalTotalXp =
    sumGlobalXp(nextState);

  assertXpStateInvariants(nextState);

  const globalLevelAfter =
    getLevelSnapshot(
      nextState.globalTotalXp,
      'global',
    ).level;

  const categoryLevelAfter =
    getLevelSnapshot(
      ledger.totalXp,
      'category',
    ).level;

  const totalAwardedXp =
    awardedVerifiedXp +
    awardedRegularityXp;

  let message =
    `+${totalAwardedXp} XP attribués.`;

  if (
    queuedRegularityXp > 0 &&
    totalAwardedXp === 0
  ) {
    message =
      `${queuedRegularityXp} XP de régularité placés en réserve.`;
  } else if (queuedRegularityXp > 0) {
    message =
      `+${totalAwardedXp} XP, ${queuedRegularityXp} XP placés en réserve.`;
  } else if (releasedRegularityXp > 0) {
    message =
      `+${awardedVerifiedXp} XP vérifiés et +${releasedRegularityXp} XP de régularité libérés.`;
  }

  return {
    state: nextState,
    outcome: {
      eventId: event.id,
      category: event.category,
      source: event.source,
      rawXp,
      awardedVerifiedXp,
      awardedRegularityXp,
      queuedRegularityXp,
      releasedRegularityXp,
      totalAwardedXp,
      globalLevelBefore,
      globalLevelAfter,
      categoryLevelBefore,
      categoryLevelAfter,
      duplicate: false,
      message,
    },
  };
}

export function applyXpEvents(
  initialState: XpState,
  events: XpEvent[],
): XpState {
  return events.reduce(
    (currentState, event) =>
      applyXpEvent(
        currentState,
        event,
      ).state,
    initialState,
  );
}
