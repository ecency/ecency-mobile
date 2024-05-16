import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, ScrollView, Text } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import showLoginAlert from '../../../utils/showLoginAlert';
import { getPostReblogs, reblog } from '../../../providers/hive/dhive';
import { useUserActivityMutation } from '../../../providers/queries/pointQueries';

// Components
import { BasicHeader, MainButton, UserListItem } from '../../../components';

// Container
import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import globalStyles from '../../../globalStyles';
import styles from '../styles/reblogScreen.styles';
import { getTimeFromNow } from '../../../utils/time';
import { setRcOffer, toastNotification } from '../../../redux/actions/uiAction';
import { PointActivityIds } from '../../../providers/ecency/ecency.types';
import { useQuery } from '@tanstack/react-query';
import QUERIES from '../../../providers/queries/queryKeys';
import Animated, { BounceInRight } from 'react-native-reanimated';
import { pollQueries, reblogQueries } from '../../../providers/queries';
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

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);


  const [isReblogging, setIsReblogging] = useState(false);


  const reblogsQuery = reblogQueries.useGetReblogsQuery(author, permlink);
  const reblogMutation = reblogQueries.useReblogMutation(author, permlink);


  //map reblogs data for account list
  const reblogs = useMemo(() =>
    reblogsQuery.data ? reblogsQuery.data.map((username) => ({ account: username })) : [],
    [reblogsQuery.data?.length])

  const headerTitle = intl.formatMessage({
    id: 'reblog.title',
  });

  const _handleReblogPost = async () => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }

    if (isLoggedIn) {
      setIsReblogging(true);
      await reblogMutation.mutateAsync();
      setIsReblogging(false);
    }

  }


  const _renderFloatingButton = () => {

    return (
      <Animated.View style={styles.floatingContainer} entering={BounceInRight.delay(300)}>
        <MainButton
          onPress={_handleReblogPost}
          iconName="repeat"
          iconType="MaterialCommunityIcons"
          iconColor="white"
          text={intl.formatMessage({ id: 'reblog.reblog_post' })}
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
