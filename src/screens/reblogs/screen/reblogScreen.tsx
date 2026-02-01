import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useIntl } from 'react-intl';
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

  const author = route.params?.author;
  const permlink = route.params?.permlink;

  const currentAccount = useAppSelector(selectCurrentAccount);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  const [isReblogging, setIsReblogging] = useState(false);

  const reblogsQuery = repostQueries.useGetReblogsQuery(author, permlink);
  const reblogMutation = repostQueries.useReblogMutation(author, permlink);

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
            timestamp: typeof item === 'object' ? item.timestamp || null : null,
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

    if (isLoggedIn) {
      setIsReblogging(true);
      await reblogMutation.mutateAsync({ undo: deleteEnabled });
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
