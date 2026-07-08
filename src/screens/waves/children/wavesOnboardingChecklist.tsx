import React, { useEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter, Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { SheetManager } from 'react-native-actions-sheet';

import { Icon } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { useGetQuestsQuery } from '../../../providers/queries/pointQueries';
import { getItemFromStorage, setItemToStorage } from '../../../realm/realm';
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

const DISMISS_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * Dismissible "Getting started" checklist for new accounts, nudging the first
 * Wave as the entry action. Completion is derived from the daily quests API and
 * latched per-user in AsyncStorage so items never un-check when the daily quest
 * window resets at 00:00 UTC. Once every item is done it celebrates once, then
 * hides for good. Mirrors the web (vision-next) WavesOnboardingChecklist.
 */
const WavesOnboardingChecklist = () => {
  const intl = useIntl();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const username = currentAccount?.name as string | undefined;
  const { data: quests } = useGetQuestsQuery(username);

  // null until the per-user flags load, so the card never flashes before the
  // dismissed/latched state is known.
  const [persisted, setPersisted] = useState<PersistedOnboarding | null>(null);
  // True only for the mount where the last item completes: the celebration
  // renders once, then the persisted flag hides the card on later mounts.
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    let mounted = true;
    setPersisted(null);
    setCelebrating(false);
    if (!username) {
      return undefined;
    }
    getItemFromStorage(_storageKey(username)).then((data: PersistedOnboarding | null) => {
      if (mounted) {
        setPersisted(data || {});
      }
    });
    return () => {
      mounted = false;
    };
  }, [username]);

  const state = useMemo(
    () =>
      persisted ? deriveWavesOnboardingState(quests, currentAccount, persisted.done ?? []) : null,
    [quests, currentAccount, persisted],
  );

  const _persist = (next: PersistedOnboarding) => {
    if (!username) {
      return;
    }
    setPersisted(next);
    setItemToStorage(_storageKey(username), next);
  };

  // Latch items completed by the submit path (a wave has no live quest signal,
  // see WAVES_ONBOARDING_LATCH_EVENT). Functional update keeps this safe next
  // to the effect below; both instances of the card (feed + waves tabs) write
  // the same merged value, so the double storage write is idempotent.
  useEffect(() => {
    if (!username) {
      return undefined;
    }
    const sub = DeviceEventEmitter.addListener(
      WAVES_ONBOARDING_LATCH_EVENT,
      (id: WavesOnboardingItemId) => {
        setPersisted((prev) => {
          if (!prev || (prev.done ?? []).includes(id)) {
            return prev;
          }
          const next = { ...prev, done: [...(prev.done ?? []), id] };
          setItemToStorage(_storageKey(username), next);
          return next;
        });
      },
    );
    return () => sub.remove();
  }, [username]);

  // Latch newly-completed items (daily quest progress resets at 00:00 UTC, so a
  // checklist item must never un-check itself the next day) and celebrate once
  // everything is done, in a SINGLE write: two separate effects would race on
  // the same persisted snapshot and the celebration write could drop the
  // just-latched final item.
  useEffect(() => {
    if (!state || !persisted) {
      return;
    }
    const done = state.items.filter((i) => i.completed).map((i) => i.id);
    const prev = persisted.done ?? [];
    const latchNeeded = done.some((id) => !prev.includes(id));
    const celebrationNeeded = state.allComplete && !persisted.celebrated;
    if (celebrationNeeded) {
      setCelebrating(true);
    }
    if (latchNeeded || celebrationNeeded) {
      _persist({
        ...persisted,
        done: latchNeeded ? done : prev,
        celebrated: persisted.celebrated || celebrationNeeded,
      });
    }
  }, [state, persisted]);

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
    if (persisted) {
      _persist({ ...persisted, dismissed: true });
    }
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
