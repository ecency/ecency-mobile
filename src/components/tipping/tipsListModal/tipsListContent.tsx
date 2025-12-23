import React from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { tipsQueries } from '../../../providers/queries';
import { EmptyScreen, UserListItem } from '../../basicUIElements';
import { getTimeFromNow } from '../../../utils/time';
import ROUTES from '../../../constants/routeNames';
import { PostTip } from '../../../providers/ecency/ecency.types';

interface TipsListContentProps {
  author: string;
  permlink: string;
}

export const TipsListContent: React.FC<TipsListContentProps> = ({ author, permlink }) => {
  const intl = useIntl();
  const navigation = useNavigation();
  const { data, isLoading } = tipsQueries.usePostTipsQuery({ author, permlink });

  const _handleOnUserPress = (username: string) => {
    navigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      params: { username },
      key: username,
    } as never);
  };

  const _renderTipItem = ({ item, index }: { item: PostTip; index: number }) => {
    const timeString = item.timestamp ? getTimeFromNow(item.timestamp) : null;
    const amountText = `${item.amount} ${item.currency}`;

    return (
      <UserListItem
        index={index}
        username={item.sender}
        description={timeString}
        isHasRightItem
        rightText={amountText}
        isLoggedIn
        handleOnPress={() => _handleOnUserPress(item.sender)}
        isClickable
      />
    );
  };

  const _renderHeader = () => {
    if (!data?.meta) return null;

    const totalsByLine =
      data.meta.totals && Object.keys(data.meta.totals).length > 0
        ? Object.entries(data.meta.totals)
            .map(([currency, amount]) => `${amount} ${currency}`)
            .join(', ')
        : '';

    return (
      <View style={styles.header}>
        <Text style={styles.title}>
          {intl.formatMessage({ id: 'tipping.tips_received' })} ({data.meta.count || 0})
        </Text>
        {totalsByLine && <Text style={styles.totals}>{totalsByLine}</Text>}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} />
      </View>
    );
  }

  if (!data || !data.list || data.list.length === 0) {
    return (
      <View style={styles.container}>
        {_renderHeader()}
        <EmptyScreen
          textMessage={intl.formatMessage({ id: 'tipping.no_tips' })}
          style={styles.emptyContainer}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {_renderHeader()}
      <FlatList
        data={data.list}
        keyExtractor={(item, idx) => `${item.sender}-${item.timestamp}-${idx}`}
        renderItem={_renderTipItem}
        removeClippedSubviews={false}
      />
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    minHeight: 200,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '$primaryLightGray',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '$primaryBlack',
    marginBottom: 4,
  },
  totals: {
    fontSize: 14,
    color: '$primaryDarkGray',
  },
});
