import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import {
  QUEST_CATALOG,
  STREAK_FREEZE_MAX_OWNED,
  STREAK_FREEZE_PRICE,
  useBuyStreakFreeze,
} from '@ecency/sdk';

import { Icon, QueryErrorRetry } from '../../../components';
import { useAuth } from '../../../hooks';
import { useGetQuestsQuery } from '../../../providers/queries/pointQueries';
import RootNavigation from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';
import styles from '../styles/perksStyles';

// Map the shared SDK catalog icon hints to MaterialCommunityIcons names.
const ICONS: Record<string, string> = {
  'check-circle': 'progress-check',
  pencil: 'pencil-outline',
  comment: 'comment-outline',
  'chevron-up-circle': 'chevron-up-circle-outline',
  repeat: 'repeat',
};

const TIERS = ['daily', 'weekly', 'monthly'] as const;

const byId = (arr?: { id: string }[]) => Object.fromEntries((arr || []).map((q) => [q.id, q]));

const QuestsCard = () => {
  const intl = useIntl();
  const { username, code } = useAuth();
  const { data, isError, error, isFetching, refetch } = useGetQuestsQuery(username);
  const [tier, setTier] = useState<(typeof TIERS)[number]>('daily');

  const { mutateAsync: buyFreeze, isPending: isBuyingFreeze } = useBuyStreakFreeze(username, code);

  const _handleBuyFreeze = async () => {
    try {
      await buyFreeze();
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 402) {
        // Not enough Points -> send them to buy Points (the top-up funnel). Pass
        // username so the Boost screen shows the user-context ribbon like other callers.
        RootNavigation.navigate({ name: ROUTES.SCREENS.BOOST, params: { username } });
      } else if (status !== 409) {
        // 409 = already at max; the count refetches and the button hides.
        Alert.alert(intl.formatMessage({ id: 'perks.streak_freeze_error' }));
      }
    }
  };

  const progressByTier: Record<(typeof TIERS)[number], any> = {
    daily: byId(data?.daily),
    weekly: byId(data?.weekly),
    monthly: byId(data?.monthly),
  };

  const streak = data?.streak;
  const tierEntries = QUEST_CATALOG.filter((q) => q.tier === tier && q.id !== 'spin');

  const _renderQuest = (entry: any) => {
    const item = progressByTier[tier][entry.id];
    const progress = item?.progress ?? 0;
    const { goal } = entry;
    const completed = progress >= goal;
    const pct = goal > 0 ? Math.min(100, Math.round((progress / goal) * 100)) : 0;

    return (
      <View key={`${tier}-${entry.id}`} style={styles.questRow}>
        <View style={styles.iconWrap}>
          <Icon
            iconType="MaterialCommunityIcons"
            name={completed ? 'check-circle' : ICONS[entry.icon] || 'star-outline'}
            size={18}
            color={EStyleSheet.value(completed ? '$primaryGreen' : '$primaryBlue')}
          />
        </View>
        <View style={styles.questBody}>
          <View style={styles.rowHeader}>
            <Text style={styles.questTitle}>
              {intl.formatMessage({ id: `perks.${entry.i18nKey}` })}
            </Text>
            <Text style={styles.questCount}>{`${progress}/${goal}`}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, completed && styles.fillDone, { width: `${pct}%` }]} />
          </View>
        </View>
      </View>
    );
  };

  // Without this the card renders every quest at 0/goal when the request fails,
  // which is indistinguishable from a user who has done nothing today. Wrong
  // progress is worse than no progress, so say so and offer the retry.
  if (isError && !data) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{intl.formatMessage({ id: 'perks.quests_title' })}</Text>
        <QueryErrorRetry error={error} onRetry={refetch} isRetrying={isFetching} compact />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{intl.formatMessage({ id: 'perks.quests_title' })}</Text>
      <Text style={styles.cardSubtitle}>{intl.formatMessage({ id: 'perks.quests_subtitle' })}</Text>

      {!!streak && streak.current > 0 && (
        <View style={styles.streakBadge}>
          <Icon
            iconType="MaterialCommunityIcons"
            name="fire"
            size={16}
            color={EStyleSheet.value('$primaryBlack')}
          />
          <Text style={styles.streakText}>
            {intl.formatMessage({ id: 'perks.streak' }, { n: streak.current })}
          </Text>
        </View>
      )}

      {!!streak && streak.current > 0 && (
        <View style={styles.freezeRow}>
          {(streak.freezes_owned ?? 0) > 0 && (
            <View style={styles.freezeCount}>
              <Icon
                iconType="MaterialCommunityIcons"
                name="snowflake"
                size={14}
                color={EStyleSheet.value('$primaryBlue')}
              />
              <Text style={styles.freezeCountText}>
                {intl.formatMessage(
                  { id: 'perks.streak_freeze_owned' },
                  { n: streak.freezes_owned },
                )}
              </Text>
            </View>
          )}
          {(streak.freezes_owned ?? 0) < STREAK_FREEZE_MAX_OWNED && (
            <TouchableOpacity
              style={[styles.freezeBtn, isBuyingFreeze && styles.freezeBtnDisabled]}
              onPress={_handleBuyFreeze}
              disabled={isBuyingFreeze}
            >
              <Text style={styles.freezeBtnText}>
                {isBuyingFreeze
                  ? intl.formatMessage({ id: 'perks.streak_freeze_buying' })
                  : intl.formatMessage(
                      { id: 'perks.streak_freeze_buy' },
                      { price: STREAK_FREEZE_PRICE },
                    )}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.tabRow}>
        {TIERS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, t === tier && styles.tabActive]}
            onPress={() => setTier(t)}
          >
            <Text style={[styles.tabText, t === tier && styles.tabTextActive]}>
              {intl.formatMessage({ id: `perks.${t}` })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tierEntries.length > 0 ? (
        tierEntries.map((entry) => _renderQuest(entry))
      ) : (
        <Text style={styles.questsEmpty}>{intl.formatMessage({ id: 'perks.quests_empty' })}</Text>
      )}
    </View>
  );
};

export default QuestsCard;
