import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheetManager } from 'react-native-actions-sheet';
import {
  getCommunityQueryOptions,
  getCommunitySubscribersInfiniteQueryOptions,
  ROLES,
  roleMap,
} from '@ecency/sdk';

import { BasicHeader, UserListItem } from '../../../components';
import ROUTES from '../../../constants/routeNames';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { SheetNames } from '../../../navigation/sheets';
import { useSetCommunityRoleMutation } from '../../../providers/sdk/mutations';
import { toastNotification } from '../../../redux/actions/uiAction';
import { getCommunityRole } from '../../../utils/communityModeration';
import {
  applyRoleToSubscribersCache,
  communitySubscribersQueryKey,
} from '../../../providers/queries';
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

const CommunityMembersScreen = ({ route }: any) => {
  const intl = useIntl();
  const navigation = useNavigation();

  const communityId: string = route.params?.communityId ?? '';
  const communityTitle: string = route.params?.communityTitle ?? '';

  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);
  const setCommunityRoleMutation = useSetCommunityRoleMutation(communityId);

  const communityQuery = useQuery(
    getCommunityQueryOptions(communityId, currentAccount?.name, !!communityId),
  );
  const subscribersQuery = useInfiniteQuery({
    ...getCommunitySubscribersInfiniteQueryOptions(communityId),
    enabled: !!communityId,
  });

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

  // hivemind only lets you assign roles strictly below your own, and only to
  // accounts already below you. roleMap encodes the first half; the second is
  // why a row is editable only when the target's current role is assignable.
  const assignableRoles: string[] = useMemo(
    () => roleMap[getCommunityRole(communityQuery.data?.team, currentAccount?.name) ?? ''] ?? [],
    [communityQuery.data, currentAccount?.name],
  );

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

  const _canEdit = (member: Member) =>
    assignableRoles.length > 0 &&
    member.account !== currentAccount?.name &&
    assignableRoles.includes(member.role);

  const _applyRole = async (targetAccount: string, role: string) => {
    try {
      await setCommunityRoleMutation.mutateAsync({ account: targetAccount, role });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));

      // Patched rather than invalidated: setRole broadcasts async, so a refetch
      // now returns pre-transaction state. See the comment in _handleEditRole.
      queryClient.setQueryData(communitySubscribersQueryKey(communityId), (cached) =>
        applyRoleToSubscribersCache(cached as any, targetAccount, role),
      );
    } catch (err) {
      Alert.alert(intl.formatMessage({ id: 'alert.fail' }), (err as Error)?.message || String(err));
    }
  };

  const _handleAssignRole = async () => {
    const result = await SheetManager.show(SheetNames.COMMUNITY_ROLE_EDIT, {
      payload: { assignableRoles, editableAccount: true },
    });

    const account = typeof result?.account === 'string' ? result.account : '';
    const role = typeof result?.role === 'string' ? result.role : '';
    if (!account || !role) {
      return;
    }

    // An account being given a role for the first time is usually not in the
    // cached subscriber pages, so the patch is a no-op for it and the row
    // appears on the next refresh. Assigning to an existing member updates in
    // place, which is the common case.
    await _applyRole(account, role);
  };

  const _handleEditRole = async (member: Member) => {
    const result = await SheetManager.show(SheetNames.COMMUNITY_ROLE_EDIT, {
      payload: {
        account: member.account,
        currentRole: member.role,
        assignableRoles,
      },
    });

    // Only a selection carries a string role. Cancel resolves { cancelled },
    // and a backdrop, swipe or back dismissal resolves the payload object,
    // because the library publishes `data || payloadRef.current` on close.
    const role = typeof result?.role === 'string' ? result.role : '';
    if (!role || role === member.role) {
      return;
    }

    // Deliberately no invalidation. The SDK's useSetCommunityRole already
    // patches the cached `team` optimistically and invalidates the community
    // query itself, and setRole broadcasts async: mutateAsync resolves on
    // mempool acceptance, so anything refetched now returns pre-transaction
    // state from hivemind and undoes the optimistic value.
    //
    // The subscriber roster is the gap. The SDK never touches it, and it is
    // what the list falls back to when a demotion drops an account off the
    // team, so it would keep serving the old role and keep the row editable
    // against stale data.
    await _applyRole(member.account, role);
  };

  const _renderRoleChip = (member: Member) => {
    const chip = (
      <View style={[styles.roleChip, _canEdit(member) && styles.roleChipEditable]}>
        <Text style={styles.roleChipText}>
          {intl.formatMessage({ id: `community.role_${member.role}` })}
        </Text>
      </View>
    );

    if (!_canEdit(member)) {
      return chip;
    }

    return <TouchableOpacity onPress={() => _handleEditRole(member)}>{chip}</TouchableOpacity>;
  };

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
        rightIconName={assignableRoles.length > 0 ? 'account-plus-outline' : undefined}
        iconType="MaterialCommunityIcons"
        handleRightIconPress={_handleAssignRole}
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
