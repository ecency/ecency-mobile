import React, { useEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter, Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { SheetManager } from 'react-native-actions-sheet';

import { Icon } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { useGetQuestsQuery } from '../../../providers/queries/pointQueries';
import { getItemFromStorage, setItemToStorage } from '../../../storage/storage';
import { selectCurrentAccount } from '../../../redux/selectors';
import { SheetNames } from '../../../navigation/sheets';
import RootNavigation from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';
import {
  deriveWavesOnboardingState,
  WAVES_ONBOARDING_LATCH_EVENT,
  WavesOnboardingItem,
  WavesOnboardingItemId,
} from '../../../utils/wavesOnboarding';
import styles from '../styles/wavesOnboardingChecklist.styles';

interface PersistedOnboarding {
  dismissed?: boolean;
  celebrated?: boolean;
  done?: WavesOnboardingItemId[];
}

const _storageKey = (username: string) => `waves_onboarding_${username}`;

/**
 * The checklist is mounted from both the Feed and Waves tabs at once, so the
 * per-user flags live here at module scope as the single source of truth.
 * Updates are synchronous read-modify-write against this map, so no instance
 * can overwrite another's flags from a stale snapshot; storage is
 * write-through and the state event keeps every mounted instance in sync.
 */
const WAVES_ONBOARDING_STATE_EVENT = 'wavesOnboarding:state';
const memoryState = new Map<string, PersistedOnboarding>();
const writeQueues = new Map<string, Promise<unknown>>();

const _updatePersisted = (
  username: string,
  updater: (prev: PersistedOnboarding) => PersistedOnboarding,
) => {
  const next = updater(memoryState.get(username) ?? {});
  memoryState.set(username, next);
  // Chain same-user disk writes so ordering never depends on AsyncStorage
  // internals: an older object can never land after a newer one. A failed
  // write is logged, not rethrown — memoryState stays authoritative for the
  // session and the next write persists the newest merged value anyway.
  const queue = writeQueues.get(username) ?? Promise.resolve();
  writeQueues.set(
    username,
    queue
      .then(() => setItemToStorage(_storageKey(username), next))
      .catch((err) => console.warn('waves onboarding: failed to persist flags', err)),
  );
  DeviceEventEmitter.emit(WAVES_ONBOARDING_STATE_EVENT, { username, next });
};

const DISMISS_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * Dismissible "Getting started" checklist for new accounts, nudging the first
 * Wave as the entry action. Completion is derived from the daily quests API and
 * latched per-user in AsyncStorage so items never un-check when the daily quest
 * window resets at 00:00 UTC. Once every item is done it celebrates once, then
 * hides for good. Mirrors the web (vision-web) WavesOnboardingChecklist.
 */
const WavesOnboardingChecklist = () => {
  const intl = useIntl();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const username = currentAccount?.name as string | undefined;
  const { data: quests } = useGetQuestsQuery(username);

  // null until the per-user flags load, so the card never flashes before the
  // dismissed/latched state is known.
  const [persisted, setPersisted] = useState<PersistedOnboarding | null>(null);
  // Items latched by submit-path events, held in state only: the merged effect
  // below is the SINGLE storage writer, so an event write can never clobber a
  // concurrent celebration/latch write to the same key.
  const [pendingLatches, setPendingLatches] = useState<WavesOnboardingItemId[]>([]);
  // True only for the mount where the last item completes: the celebration
  // renders once, then the persisted flag hides the card on later mounts.
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    let mounted = true;
    setPersisted(null);
    setPendingLatches([]);
    setCelebrating(false);
    if (!username) {
      return undefined;
    }
    const cached = memoryState.get(username);
    if (cached) {
      setPersisted(cached);
    } else {
      getItemFromStorage(_storageKey(username)).then((data: PersistedOnboarding | null) => {
        if (!memoryState.has(username)) {
          memoryState.set(username, data || {});
        }
        if (mounted) {
          setPersisted(memoryState.get(username) ?? {});
        }
      });
    }
    const sub = DeviceEventEmitter.addListener(
      WAVES_ONBOARDING_STATE_EVENT,
      (payload: { username: string; next: PersistedOnboarding }) => {
        if (payload.username === username) {
          setPersisted(payload.next);
        }
      },
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [username]);

  const state = useMemo(
    () =>
      persisted
        ? deriveWavesOnboardingState(quests, currentAccount, [
            ...(persisted.done ?? []),
            ...pendingLatches,
          ])
        : null,
    [quests, currentAccount, persisted, pendingLatches],
  );

  // Items completed by the submit path (a wave has no live quest signal, see
  // WAVES_ONBOARDING_LATCH_EVENT) only buffer into state here; the derivation
  // treats them as completed and the merged effect below persists them.
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      WAVES_ONBOARDING_LATCH_EVENT,
      (id: WavesOnboardingItemId) => {
        setPendingLatches((prev) => (prev.includes(id) ? prev : [...prev, id]));
      },
    );
    return () => sub.remove();
  }, []);

  // Latch newly-completed items (daily quest progress resets at 00:00 UTC, so a
  // checklist item must never un-check itself the next day) and celebrate once
  // everything is done, in a SINGLE updater-style write: the updater merges
  // against the authoritative module-scope value, never this render's snapshot.
  useEffect(() => {
    if (!username || !state || !persisted) {
      return;
    }
    const done = state.items.filter((i) => i.completed).map((i) => i.id);
    const latchNeeded = done.some((id) => !(persisted.done ?? []).includes(id));
    const celebrationNeeded = state.allComplete && !persisted.celebrated;
    if (celebrationNeeded) {
      setCelebrating(true);
    }
    if (latchNeeded || celebrationNeeded) {
      _updatePersisted(username, (prev) => ({
        ...prev,
        done: Array.from(new Set([...(prev.done ?? []), ...done])),
        celebrated: prev.celebrated || celebrationNeeded,
      }));
    }
  }, [username, state, persisted]);

  if (
    !username ||
    !state ||
    !state.eligible ||
    persisted?.dismissed ||
    (state.allComplete && !celebrating)
  ) {
    return null;
  }

  const _onDismiss = () => {
    _updatePersisted(username, (prev) => ({ ...prev, dismissed: true }));
  };

  const _onCreateWavePress = () => {
    SheetManager.show(SheetNames.QUICK_POST, {
      payload: { mode: 'wave' },
    });
  };

  const _onCheckinPress = () => {
    RootNavigation.navigate({ name: ROUTES.SCREENS.PERKS });
  };

  const _renderItem = (item: WavesOnboardingItem) => {
    const label = intl.formatMessage({ id: `waves_onboarding.item_${item.id}` });
    const actionable = !item.completed && (item.id === 'wave' || item.id === 'checkin');
    const content = (
      <>
        <Icon
          iconType="MaterialCommunityIcons"
          name={item.completed ? 'check-circle' : 'checkbox-blank-circle-outline'}
          size={20}
          color={EStyleSheet.value(item.completed ? '$primaryGreen' : '$iconColor')}
        />
        <Text
          style={[
            styles.itemLabel,
            item.completed && styles.itemLabelDone,
            actionable && styles.itemLabelAction,
          ]}
        >
          {label}
        </Text>
      </>
    );

    if (actionable) {
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.itemRow}
          onPress={item.id === 'wave' ? _onCreateWavePress : _onCheckinPress}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return (
      <View key={item.id} style={styles.itemRow}>
        {content}
      </View>
    );
  };

  const pct = Math.round((state.completedCount / state.totalCount) * 100);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={_onDismiss}
        hitSlop={DISMISS_HIT_SLOP}
        accessibilityLabel={intl.formatMessage({ id: 'waves_onboarding.dismiss' })}
      >
        <Icon
          iconType="MaterialCommunityIcons"
          name="close"
          size={18}
          color={EStyleSheet.value('$primaryDarkGray')}
        />
      </TouchableOpacity>

      {state.allComplete ? (
        <>
          <Text style={styles.cardTitle}>
            {intl.formatMessage({ id: 'waves_onboarding.all_done_title' })}
          </Text>
          <Text style={styles.cardSubtitle}>
            {intl.formatMessage({ id: 'waves_onboarding.all_done_subtitle' })}
          </Text>
        </>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle}>
              {intl.formatMessage({ id: 'waves_onboarding.title' })}
            </Text>
            <Text style={styles.progressText}>
              {intl.formatMessage(
                { id: 'waves_onboarding.progress' },
                { completed: state.completedCount, total: state.totalCount },
              )}
            </Text>
          </View>
          <Text style={styles.cardSubtitle}>
            {intl.formatMessage({ id: 'waves_onboarding.subtitle' })}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <View style={styles.itemsWrap}>{state.items.map(_renderItem)}</View>
        </>
      )}
    </View>
  );
};

export default WavesOnboardingChecklist;
