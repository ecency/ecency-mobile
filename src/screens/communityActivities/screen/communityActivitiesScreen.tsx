import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountNotification, getAccountNotificationsInfiniteQueryOptions } from '@ecency/sdk';
import { useInfiniteQuery } from '@tanstack/react-query';

import { BasicHeader, UserAvatar } from '../../../components';
import ROUTES from '../../../constants/routeNames';
import { useAppSelector } from '../../../hooks';

import { selectIsDarkTheme } from '../../../redux/selectors';
import { getTimeFromNow } from '../../../utils/time';
import styles from '../styles/communityActivitiesScreen.styles';

const PAGE_SIZE = 50;

// A set_props entry embeds the whole props payload in its message, which runs to
// hundreds of characters. Cap the row rather than let one entry dominate the list.
const MAX_LINES = 4;

// Account names, and post references of the form @author/permlink.
const MENTION_REGEX = /@[\w.\d-]+(?:\/[\w.\d-]+)?/gi;

const CommunityActivitiesScreen = ({ route }: any) => {
  const intl = useIntl();
  const navigation = useNavigation();

  const communityId: string = route.params?.communityId ?? '';
  const communityTitle: string = route.params?.communityTitle ?? '';

  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  const activitiesQuery = useInfiniteQuery({
    ...getAccountNotificationsInfiniteQueryOptions(communityId, PAGE_SIZE),
    enabled: !!communityId,
  });

  const activities: AccountNotification[] = useMemo(
    () => activitiesQuery.data?.pages?.flat() ?? [],
    [activitiesQuery.data],
  );

  const _loadMore = () => {
    if (activitiesQuery.hasNextPage && !activitiesQuery.isFetchingNextPage) {
      activitiesQuery.fetchNextPage();
    }
  };

  const _openAccount = (username: string) =>
    navigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      key: username,
      params: { username },
    });

  const _openPost = (author: string, permlink: string) =>
    navigation.navigate({
      name: ROUTES.SCREENS.POST,
      key: `${author}/${permlink}`,
      params: { author, permlink },
    });

  /**
   * Splits the message so `@account` and `@author/permlink` references become
   * tappable, leaving the rest as plain text. Mirrors what web does, except web
   * drops any entry without a mention; here they still render, just without
   * links, so the log stays complete.
   */
  const _renderMessage = (activity: AccountNotification) => {
    const parts = activity.msg.split(new RegExp(`(${MENTION_REGEX.source})`, 'gi'));

    return (
      <Text style={styles.message} numberOfLines={MAX_LINES}>
        {parts
          .filter((part) => part !== '' && part !== undefined)
          .map((part, index) => {
            if (!part.startsWith('@')) {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <Text key={`t-${index}`}>{part}</Text>
              );
            }

            const [account, permlink] = part.slice(1).split('/');
            return (
              <Text
                // eslint-disable-next-line react/no-array-index-key
                key={`l-${index}`}
                style={styles.link}
                onPress={() => (permlink ? _openPost(account, permlink) : _openAccount(account))}
              >
                {part}
              </Text>
            );
          })}
      </Text>
    );
  };

  const _renderItem = ({ item }: { item: AccountNotification }) => {
    // The acting account is the first mention; entries without one (rare) still
    // render, just without an avatar.
    const actor = item.msg.match(MENTION_REGEX)?.[0]?.slice(1).split('/')[0];

    return (
      <View style={styles.row}>
        <View style={styles.avatarColumn}>
          {!!actor && <UserAvatar username={actor} size="small" noAction />}
        </View>
        <View style={styles.contentColumn}>
          {_renderMessage(item)}
          <Text style={styles.date}>{getTimeFromNow(item.date) ?? ''}</Text>
        </View>
      </View>
    );
  };

  const _renderEmpty = () => {
    if (activitiesQuery.isLoading) {
      return <ActivityIndicator style={styles.loading} />;
    }
    return (
      <Text style={styles.emptyText}>
        {intl.formatMessage({
          id: activitiesQuery.isError
            ? 'community.activities_load_failed'
            : 'community.no_activities',
        })}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader
        title={`${communityTitle || communityId} ${intl.formatMessage({
          id: 'community.activities',
        })}`}
      />
      <FlatList
        data={activities}
        keyExtractor={(item: any) => item.id}
        renderItem={_renderItem}
        ListEmptyComponent={_renderEmpty}
        ListFooterComponent={
          activitiesQuery.isFetchingNextPage ? <ActivityIndicator style={styles.loading} /> : null
        }
        onEndReachedThreshold={0.5}
        onEndReached={_loadMore}
        refreshControl={
          <RefreshControl
            refreshing={activitiesQuery.isRefetching && !activitiesQuery.isFetchingNextPage}
            onRefresh={activitiesQuery.refetch}
            progressBackgroundColor="#357CE6"
            tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
            titleColor="#fff"
            colors={['#fff']}
          />
        }
      />
    </SafeAreaView>
  );
};

export default gestureHandlerRootHOC(CommunityActivitiesScreen);
