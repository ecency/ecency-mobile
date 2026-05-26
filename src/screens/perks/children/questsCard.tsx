import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { QUEST_CATALOG } from '@ecency/sdk';

import { Icon } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccountName } from '../../../redux/selectors';
import { useGetQuestsQuery } from '../../../providers/queries/pointQueries';
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
  const username = useAppSelector(selectCurrentAccountName);
  const { data } = useGetQuestsQuery(username);
  const [tier, setTier] = useState<(typeof TIERS)[number]>('daily');

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
