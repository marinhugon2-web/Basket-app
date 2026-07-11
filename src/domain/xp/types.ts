export const XP_CATEGORIES = [
  'finition',
  'tir',
  'explosivite',
  'defense',
  'handle',
  'endurance',
] as const;

export type XpCategory = (typeof XP_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<XpCategory, string> = {
  finition: 'Finition',
  tir: 'Tir',
  explosivite: 'Explosivité',
  defense: 'Défense',
  handle: 'Handle',
  endurance: 'Endurance',
};

export const VERIFIED_SOURCES = [
  'verified_test',
  'verified_video',
  'standard_measurement',
] as const;

export const REGULARITY_SOURCES = [
  'quality_session',
  'presence',
] as const;

export type VerifiedSource =
  (typeof VERIFIED_SOURCES)[number];

export type RegularitySource =
  (typeof REGULARITY_SOURCES)[number];

export type XpSource =
  | VerifiedSource
  | RegularitySource;

export type XpBucket =
  | 'verified'
  | 'regularity';

export type Difficulty = 1 | 2 | 3;

export interface VerificationReceipt {
  verificationId: string;
  protocolId: string;
  integrityHash: string;
  verifiedAt: string;
  verifier: 'server' | 'coach';
}

export interface StructuredSessionData {
  completedAt: string;
  measuredFields: number;
  qualityScore: number;
  durationMinutes: number;
}

export interface XpEventBase {
  id: string;
  category: XpCategory;
  occurredAt: string;
  difficulty: Difficulty;
  progressDelta: number;
  source: XpSource;
  label: string;
}

export interface VerifiedXpEvent
  extends XpEventBase {
  source: VerifiedSource;
  receipt: VerificationReceipt;
}

export interface RegularityXpEvent
  extends XpEventBase {
  source: RegularitySource;
  session?: StructuredSessionData;
}

export type XpEvent =
  | VerifiedXpEvent
  | RegularityXpEvent;

export interface CategoryLedger {
  verifiedXp: number;
  regularityXp: number;
  pendingRegularityXp: number;
  totalXp: number;
  eventCount: number;
}

export interface XpState {
  categories: Record<
    XpCategory,
    CategoryLedger
  >;
  appliedEventIds: string[];
  globalTotalXp: number;
  qualityStreak: number;
  presenceStreak: number;
  lastQualityStreakDate: string | null;
  lastPresenceStreakDate: string | null;
}

export interface LevelSnapshot {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  progress: number;
}

export interface RatioSnapshot {
  verifiedXp: number;
  regularityXp: number;
  totalXp: number;
  verifiedShare: number;
  regularityShare: number;
  isCompliant: boolean;
}

export interface XpOutcome {
  eventId: string;
  category: XpCategory;
  source: XpSource;
  rawXp: number;
  awardedVerifiedXp: number;
  awardedRegularityXp: number;
  queuedRegularityXp: number;
  releasedRegularityXp: number;
  totalAwardedXp: number;
  globalLevelBefore: number;
  globalLevelAfter: number;
  categoryLevelBefore: number;
  categoryLevelAfter: number;
  duplicate: boolean;
  message: string;
}
