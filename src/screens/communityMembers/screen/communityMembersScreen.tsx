import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCommunityQueryOptions, ROLES } from '@ecency/sdk';

import { BasicHeader, UserListItem } from '../../../components';
import ROUTES from '../../../constants/routeNames';
import { useAppSelector } from '../../../hooks';
import { useCommunitySubscribersQuery } from '../../../providers/queries';
import { selectCurrentAccount, selectIsDarkTheme } from '../../../redux/selectors';
import { isCommunity } from '../../../utils/communityValidation';
import styles from '../styles/communityMembersScreen.styles';

// hivemind returns both `community.team` and each subscriber row as positional
// tuples of [account, role, title]. Never index these inline elsewhere; the
// helpers in utils/communityModeration.ts exist for that reason.
const ACCOUNT_INDEX = 0;
const ROLE_INDEX = 1;
const TITLE_INDEX = 2;

// Order the list the way the roster reads: authority first, then everyone else.
const ROLE_ORDER: Record<string, number> = {
  [ROLES.OWNER]: 0,
  [ROLES.ADMIN]: 1,
  [ROLES.MOD]: 2,
  [ROLES.MEMBER]: 3,
  [ROLES.GUEST]: 4,
  [ROLES.MUTED]: 5,
};

interface Member {
  account: string;
  role: string;
  title: string;
}

const CommunityMembersScreen = ({ route }) => {
  const intl = useIntl();
  const navigation = useNavigation();

  const communityId: string = route.params?.communityId ?? '';
  const communityTitle: string = route.params?.communityTitle ?? '';

  const currentAccount = useAppSelector(selectCurrentAccount);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  const communityQuery = useQuery(
    getCommunityQueryOptions(communityId, currentAccount?.name, !!communityId),
  );
  const subscribersQuery = useCommunitySubscribersQuery(communityId);

  const members: Member[] = useMemo(() => {
    const byAccount = new Map<string, Member>();

    const add = (tuple?: string[]) => {
      const account = tuple?.[ACCOUNT_INDEX];
      // The community account itself appears in its own team. It is not a
      // person and has no role worth showing, so drop it as web does.
      if (!account || isCommunity(account)) {
        return;
      }
      // The team carries the authoritative role, so it wins over the
      // subscriber entry for the same account.
      if (byAccount.has(account)) {
        return;
      }
      byAccount.set(account, {
        account,
        role: tuple?.[ROLE_INDEX] || ROLES.GUEST,
        title: tuple?.[TITLE_INDEX] || '',
      });
    };

    (communityQuery.data?.team || []).forEach(add);
    (subscribersQuery.data?.pages?.flat() || []).forEach(add);

    return [...byAccount.values()].sort((a, b) => {
      const rank = (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99);
      return rank !== 0 ? rank : a.account.localeCompare(b.account);
    });
  }, [communityQuery.data, subscribersQuery.data]);

  const isLoading = communityQuery.isLoading || subscribersQuery.isLoading;
  // Surfaced separately from the empty case: a failed query also yields zero
  // rows, and rendering "no members" for it reads as an authoritative answer
  // when the roster is simply unknown.
  const isError = communityQuery.isError || subscribersQuery.isError;

  const _refresh = () => {
    communityQuery.refetch();
    subscribersQuery.refetch();
  };

  const _loadMore = () => {
    if (subscribersQuery.hasNextPage && !subscribersQuery.isFetchingNextPage) {
      subscribersQuery.fetchNextPage();
    }
  };

  const _handleOnUserPress = (username: string) => {
    navigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      key: username,
      params: { username },
    });
  };

  const _renderRoleChip = (member: Member) => (
    <View style={styles.roleChip}>
      <Text style={styles.roleChipText}>
        {intl.formatMessage({ id: `community.role_${member.role}` })}
      </Text>
    </View>
  );

  const _renderItem = ({ item, index }: { item: Member; index: number }) => (
    <UserListItem
      index={index}
      username={item.account}
      description={item.title}
      handleOnPress={() => _handleOnUserPress(item.account)}
      rightItemRenderer={() => _renderRoleChip(item)}
    />
  );

  const _renderEmpty = () => {
    if (isLoading) {
      return <ActivityIndicator style={styles.loading} />;
    }
    return (
      <Text style={styles.emptyText}>
        {intl.formatMessage({
          id: isError ? 'community.members_load_failed' : 'community.no_members',
        })}
      </Text>
    );
  };

  const _renderFooter = () => {
    if (subscribersQuery.isFetchingNextPage) {
      return <ActivityIndicator style={styles.loading} />;
    }
    // A partially loaded roster must not read as complete.
    if (isError && members.length > 0) {
      return (
        <Text style={styles.footerNote}>
          {intl.formatMessage({ id: 'community.members_incomplete' })}
        </Text>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader
        title={`${communityTitle || communityId} ${intl.formatMessage({
          id: 'community.members',
        })}`}
      />
      <FlatList
        data={members}
        keyExtractor={(item) => item.account}
        renderItem={_renderItem}
        ListEmptyComponent={_renderEmpty}
        ListFooterComponent={_renderFooter}
        onEndReachedThreshold={0.5}
        onEndReached={_loadMore}
        refreshControl={
          <RefreshControl
            refreshing={communityQuery.isRefetching || subscribersQuery.isRefetching}
            onRefresh={_refresh}
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

export default gestureHandlerRootHOC(CommunityMembersScreen);
