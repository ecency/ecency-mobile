import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import Animated, { BounceInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../hooks';
import {
  selectCurrentAccount,
  selectIsLoggedIn,
  selectIsDarkTheme,
} from '../../../redux/selectors';
import showLoginAlert from '../../../utils/showLoginAlert';

// Components
import { BasicHeader, MainButton, UserListItem } from '../../../components';

// Container
import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import globalStyles from '../../../globalStyles';
import styles from '../styles/reblogScreen.styles';
import { getTimeFromNow } from '../../../utils/time';
import { repostQueries } from '../../../providers/queries';
import { useReblogMutation } from '../../../providers/sdk/mutations';
import { setRcOffer, toastNotification } from '../../../redux/actions/uiAction';
import QUERIES from '../../../providers/queries/queryKeys';

const renderUserListItem = (item, index, handleOnUserPress) => {
  // Safely handle timestamp - getTimeFromNow can return null
  const description = (item.timestamp ? getTimeFromNow(item.timestamp) : null) ?? '';

  return (
    <UserListItem
      index={index}
      username={item.account}
      description={description}
      handleOnPress={() => handleOnUserPress(item.account)}
    />
  );
};

const ReblogScreen = ({ route }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const author = route.params?.author;
  const permlink = route.params?.permlink;

  const currentAccount = useAppSelector(selectCurrentAccount);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  const [isReblogging, setIsReblogging] = useState(false);

  const reblogsQuery = repostQueries.useGetReblogsQuery(author, permlink);
  const reblogMutation = useReblogMutation();

  // map reblogs data for account list
  const { reblogs, deleteEnabled } = useMemo(() => {
    let _reblogs: any[] = [];
    let _deleteEnabled = false;
    if (reblogsQuery.data instanceof Array) {
      // Safe extractor: ensures we always get a string username or null
      const extractUsername = (item: any): string | null => {
        if (typeof item === 'string') {
          return item;
        }
        if (item && typeof item === 'object' && typeof item.account === 'string') {
          return item.account;
        }
        // Unknown format - skip
        return null;
      };

      _reblogs = reblogsQuery.data
        .map((item) => {
          const account = extractUsername(item);
          if (!account) {
            return null; // Skip invalid entries
          }
          return {
            account,
            timestamp: typeof item === 'object' ? (item as any).timestamp || null : null,
          };
        })
        .filter(Boolean); // Remove null entries

      // Extract usernames as strings only for deleteEnabled check
      const usernames = reblogsQuery.data
        .map(extractUsername)
        .filter((username): username is string => username !== null);

      _deleteEnabled = currentAccount ? usernames.includes(currentAccount.name) : false;
    }
    return {
      reblogs: _reblogs,
      deleteEnabled: _deleteEnabled,
    };
  }, [reblogsQuery.data, currentAccount?.name]);

  const headerTitle = intl.formatMessage({
    id: 'reblog.title',
  });

  const _actionBtnTitle = intl.formatMessage({
    id: deleteEnabled ? 'reblog.reblog_delete' : 'reblog.reblog_post',
  });
  const _actionBtnIcon = deleteEnabled ? 'repeat-off' : 'repeat';

  const _handleReblogPost = async () => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }

    setIsReblogging(true);
    try {
      await reblogMutation.mutateAsync({ author, permlink, deleteReblog: deleteEnabled });

      dispatch(
        toastNotification(
          intl.formatMessage({
            id: deleteEnabled ? 'alert.success_reblog_deleted' : 'alert.success_rebloged',
          }),
        ),
      );

      // Optimistically update the on-screen list/count/button. The SDK broadcasts in
      // async mode and only invalidates its own rebloggedBy key after a 4s indexer delay,
      // which never touches this screen's overridden GET_REBLOGS cache key — so without
      // this the count/button stay stale right after a successful reblog/unreblog.
      const username = currentAccount?.name;
      if (username) {
        queryClient.setQueryData<string[]>([QUERIES.POST.GET_REBLOGS, author, permlink], (data) => {
          const list = Array.isArray(data) ? [...data] : [];
          const idx = list.indexOf(username);
          if (deleteEnabled) {
            if (idx >= 0) {
              list.splice(idx, 1);
            }
          } else if (idx < 0) {
            list.unshift(username);
          }
          return list;
        });
      }

      // SDK only invalidates the account-posts "blog" filter, so refresh the "reblog"
      // filter too, otherwise the profile Reblogs tab stays stale.
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'posts' &&
          query.queryKey[1] === 'account-posts' &&
          query.queryKey[2] === currentAccount?.name &&
          query.queryKey[3] === 'reblog',
      });
    } catch (error: any) {
      if (String(error?.jse_shortmsg ?? '').indexOf('has already reblogged') > -1) {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.already_rebloged' })));
      } else if (error?.jse_shortmsg?.split(': ')[1]?.includes('wait to transact')) {
        dispatch(setRcOffer(true));
      } else {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      }
    } finally {
      setIsReblogging(false);
    }
  };

  const _renderFloatingButton = () => {
    return (
      <Animated.View style={styles.floatingContainer} entering={BounceInRight.delay(300)}>
        <MainButton
          onPress={_handleReblogPost}
          iconName={_actionBtnIcon}
          iconType="MaterialCommunityIcons"
          iconColor="white"
          text={_actionBtnTitle}
          isLoading={isReblogging}
        />
      </Animated.View>
    );
  };

  return (
    <AccountListContainer data={reblogs}>
      {({ data, filterResult, handleSearch, handleOnUserPress }) => (
        <SafeAreaView style={globalStyles.container}>
          {/* Your content goes here */}
          <BasicHeader
            title={`${headerTitle} (${data && data.length})`}
            backIconName="close"
            isHasSearch
            handleOnSearch={(text) => handleSearch(text, 'account')}
          />
          <FlatList
            data={filterResult || data}
            keyExtractor={(item) => item.account}
            removeClippedSubviews={false}
            renderItem={({ item, index }) => renderUserListItem(item, index, handleOnUserPress)}
            refreshControl={
              <RefreshControl
                refreshing={reblogsQuery.isLoading || reblogsQuery.isFetching}
                onRefresh={() => reblogsQuery.refetch()}
                progressBackgroundColor="#357CE6"
                tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                titleColor="#fff"
                colors={['#fff']}
              />
            }
          />

          {_renderFloatingButton()}
        </SafeAreaView>
      )}
    </AccountListContainer>
  );
};

export default gestureHandlerRootHOC(ReblogScreen);
