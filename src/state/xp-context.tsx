import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { dashboardQuests } from '@/domain/dashboard';
import {
  applyXpEvent,
  assertXpStateInvariants,
} from '@/domain/xp/engine';
import { createSeedXpState } from '@/domain/xp/seed';
import {
  XpOutcome,
  XpState,
} from '@/domain/xp/types';

const STORAGE_KEY =
  '@court-forge/dashboard-xp/v2';

interface PersistedStore {
  version: 2;
  xpState: XpState;
  completedQuestIds: string[];
}

interface XpContextValue {
  xpState: XpState;
  completedQuestIds: string[];
  lastOutcome: XpOutcome | null;
  isHydrated: boolean;
  completeQuest: (
    questId: string,
  ) => XpOutcome;
  clearLastOutcome: () => void;
  resetDemo: () => Promise<void>;
}

const XpContext =
  createContext<XpContextValue | null>(null);

function createInitialStore(): PersistedStore {
  return {
    version: 2,
    xpState: createSeedXpState(),
    completedQuestIds: [],
  };
}

function isPersistedStore(
  value: unknown,
): value is PersistedStore {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate =
    value as Partial<PersistedStore>;

  return (
    candidate.version === 2 &&
    Boolean(candidate.xpState) &&
    Array.isArray(
      candidate.completedQuestIds,
    )
  );
}

export function XpProvider({
  children,
}: PropsWithChildren) {
  const [store, setStore] =
    useState<PersistedStore>(
      () => createInitialStore(),
    );

  const [
    lastOutcome,
    setLastOutcome,
  ] = useState<XpOutcome | null>(null);

  const [
    isHydrated,
    setIsHydrated,
  ] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const raw =
          await AsyncStorage.getItem(
            STORAGE_KEY,
          );

        if (!raw || !active) {
          return;
        }

        const parsed: unknown =
          JSON.parse(raw);

        if (isPersistedStore(parsed)) {
          assertXpStateInvariants(
            parsed.xpState,
          );

          setStore(parsed);
        }
      } catch {
        await AsyncStorage.removeItem(
          STORAGE_KEY,
        );
      } finally {
        if (active) {
          setIsHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(store),
    ).catch(() => undefined);
  }, [isHydrated, store]);

  const completeQuest = useCallback(
    (questId: string): XpOutcome => {
      const quest = dashboardQuests.find(
        (candidate) =>
          candidate.id === questId,
      );

      if (!quest) {
        throw new Error('Quête inconnue.');
      }

      const result = applyXpEvent(
        store.xpState,
        quest.event,
      );

      const completedQuestIds =
        result.outcome.duplicate
          ? store.completedQuestIds
          : Array.from(
              new Set([
                ...store.completedQuestIds,
                questId,
              ]),
            );

      setStore({
        version: 2,
        xpState: result.state,
        completedQuestIds,
      });

      setLastOutcome(result.outcome);

      return result.outcome;
    },
    [store],
  );

  const clearLastOutcome =
    useCallback(
      () => setLastOutcome(null),
      [],
    );

  const resetDemo = useCallback(
    async () => {
      const initial =
        createInitialStore();

      setStore(initial);
      setLastOutcome(null);

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initial),
      );
    },
    [],
  );

  const value =
    useMemo<XpContextValue>(
      () => ({
        xpState: store.xpState,
        completedQuestIds:
          store.completedQuestIds,
        lastOutcome,
        isHydrated,
        completeQuest,
        clearLastOutcome,
        resetDemo,
      }),
      [
        clearLastOutcome,
        completeQuest,
        isHydrated,
        lastOutcome,
        resetDemo,
        store,
      ],
    );

  return (
    <XpContext.Provider value={value}>
      {children}
    </XpContext.Provider>
  );
}

export function useXp(): XpContextValue {
  const value = useContext(XpContext);

  if (!value) {
    throw new Error(
      'useXp doit être utilisé dans XpProvider.',
    );
  }

  return value;
}
