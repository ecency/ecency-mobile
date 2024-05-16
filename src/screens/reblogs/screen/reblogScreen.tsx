import React, { useState } from 'react';
import { FlatList, SafeAreaView, RefreshControl, ScrollView, Text } from 'react-native';
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
  const dispatch = useAppDispatch();

  const author = route.params?.author;
  const permlink = route.params?.permlink;

  const headerTitle = intl.formatMessage({
    id: 'reblog.title',
  });

  const userActivityMutation = useUserActivityMutation();
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);


  const reblogsQuery = useQuery(
    [QUERIES.POST.GET_REBLOGS, author, permlink],
    () => getPostReblogs(author, permlink),
    { initialData: [] }
  );



  const _handleReblogPost = () => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }

    if (isLoggedIn) {
      reblog(currentAccount, pinCode, author, permlink)
        .then((response) => {
          // track user activity points ty=130
          userActivityMutation.mutate({
            pointsTy: PointActivityIds.REBLOG,
            transactionId: response.id,

          });

          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.success_rebloged',
              }),
            ),
          );
          reblogsQuery.refetch();
        })
        .catch((error) => {
          if (String(get(error, 'jse_shortmsg', '')).indexOf('has already reblogged') > -1) {
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.already_rebloged',
                }),
              ),
            );
          } else {
            if (error && error.jse_shortmsg.split(': ')[1].includes('wait to transact')) {
              // when RC is not enough, offer boosting account
              dispatch(setRcOffer(true));
            } else {
              // when other errors
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
            }
          }
        });
    }

  }


  const _renderFloatingButton = () => {

    return (

      <Animated.View style={styles.floatingContainer} entering={BounceInRight.delay(300)}>

        <MainButton
          // style={{ width: isLoading ? null : 120 }}
          onPress={_handleReblogPost}
          iconName="repeat"
          iconType="MaterialCommunityIcons"
          iconColor="white"
          text={intl.formatMessage({ id: 'reblog.reblog_post' })}
          isLoading={false}
        />

      </Animated.View>

    );
  };


  return (
    <AccountListContainer data={reblogsQuery.data.map(username => ({ account: username }))}>
      {({ data, filterResult, handleSearch, handleOnUserPress }) => (

        <SafeAreaView style={[globalStyles.container, { paddingBottom: 40 }]}>
          <ScrollView>
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
            />


          </ScrollView>
          {_renderFloatingButton()}
          {/* <MainButton
            style={globalStyles.mainbutton}
            onPress={_reblog}
            iconName="square-edit-outline"
            iconType="MaterialCommunityIcons"
            iconColor="white"
            text="Reblog Post"
            
          /> */}
        </SafeAreaView>

      )
      }
    </AccountListContainer >
  );
};

export default gestureHandlerRootHOC(ReblogScreen);
