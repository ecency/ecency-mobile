import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { useIntl } from 'react-intl';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { useAppSelector } from '../../../hooks';
import showLoginAlert from '../../../utils/showLoginAlert';

// Components
import { BasicHeader, MainButton, UserListItem } from '../../../components';

// Container
import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import globalStyles from '../../../globalStyles';
import styles from '../styles/reblogScreen.styles';
import { getTimeFromNow } from '../../../utils/time';
import Animated, { BounceInRight } from 'react-native-reanimated';
import { reblogQueries } from '../../../providers/queries';
;

const renderUserListItem = (item, index, handleOnUserPress) => {
  return (
    <UserListItem
      index={index}
      username={item.account}
      description={getTimeFromNow(item.timestamp)}
      handleOnPress={() => handleOnUserPress(item.account)}
    />
  );
};

const ReblogScreen = ({ route }) => {
  const intl = useIntl();

  const author = route.params?.author;
  const permlink = route.params?.permlink;

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);


  const [isReblogging, setIsReblogging] = useState(false);


  const reblogsQuery = reblogQueries.useGetReblogsQuery(author, permlink);
  const reblogMutation = reblogQueries.useReblogMutation(author, permlink);


  //map reblogs data for account list
  const { reblogs, deleteEnabled } = useMemo(() => {
    let _reblogs: any[] = [];
    let _deleteEnabled = false;
    if (reblogsQuery.data instanceof Array) {
      _reblogs = reblogsQuery.data.map((username) => ({ account: username }));
      _deleteEnabled = currentAccount ? reblogsQuery.data.includes(currentAccount.username) : false;
    }
    return {
      reblogs: _reblogs,
      deleteEnabled: _deleteEnabled
    }
  }, [reblogsQuery.data?.length])



  const headerTitle = intl.formatMessage({
    id: 'reblog.title',
  });

  const _actionBtnTitle = intl.formatMessage({ id: deleteEnabled ? 'reblog.reblog_delete' : 'reblog.reblog_post' })
  const _actionBtnIcon = deleteEnabled ? "repeat-off" : "repeat";

  const _handleReblogPost = async () => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }

    if (isLoggedIn) {
      setIsReblogging(true);
      await reblogMutation.mutateAsync({ undo:deleteEnabled });
      setIsReblogging(false);
    }

  }


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

        <SafeAreaView style={[globalStyles.container, { paddingBottom: 40 }]}>

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
            renderItem={({ item, index }) =>
              renderUserListItem(item, index, handleOnUserPress)
            }
            refreshControl={
              <RefreshControl
                refreshing={reblogsQuery.isLoading || reblogsQuery.isFetching}
                onRefresh={() => reblogsQuery.refetch()}
                progressBackgroundColor="#357CE6"
                tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                titleColor="#fff"
                colors={['#fff']}
              />}
          />

          {_renderFloatingButton()}
        </SafeAreaView>

      )
      }
    </AccountListContainer >
  );
};

export default gestureHandlerRootHOC(ReblogScreen);
