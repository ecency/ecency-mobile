import React, { useState } from 'react';
import { FlatList, SafeAreaView, RefreshControl, ScrollView } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import reactotron from 'reactotron-react-native';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import showLoginAlert from '../../../utils/showLoginAlert';
import { reblog } from '../../../providers/hive/dhive';
import { useUserActivityMutation } from '../../../providers/queries/pointQueries';
import { getPostReblogs } from '../../../providers/ecency/ecency';
// Components
import { BasicHeader, MainButton, UserListItem } from '../../../components';

// Container
import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import globalStyles from '../../../globalStyles';
import { getTimeFromNow } from '../../../utils/time';
import { setRcOffer, toastNotification } from '../../../redux/actions/uiAction';
import { PointActivityIds } from '../../../providers/ecency/ecency.types';

const renderUserListItem = (item, index, handleOnUserPress) => {
  return (
    <UserListItem
      index={index}
      username={item.account}
      description={getTimeFromNow(item.timestamp)}
      handleOnPress={() => handleOnUserPress(item.account)}
      // eslint-disable-next-line max-len
      isClickable rightText={undefined} descriptionStyle={undefined} subRightText={undefined} isRightColor={undefined} isHasRightItem={undefined} isBlackRightColor={undefined} itemIndex={undefined} handleOnLongPress={undefined} text={undefined} middleText={undefined} rightTextStyle={undefined} onPressRightText={undefined} isLoggedIn={undefined} searchValue={undefined} rightTooltipText={undefined} leftItemRenderer={undefined} rightItemRenderer={undefined} />
  );
};

const ReblogScreen = ({ route }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  // const content = route.params?.content;
  const author = route.params?.author;
  const permlink = route.params?.permlink;
  const pReblogs = route.params?.reblogs;

  const [reblogs, setReblogs] = useState(pReblogs);
  const intl = useIntl();
  const headerTitle = intl.formatMessage({
    id: 'reblog.title',
  });
  const dispatch = useAppDispatch();
  const userActivityMutation = useUserActivityMutation();
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);
  const dummy = {
    account: 'Ali',
    timestamp: '2023-07-16T23:30:39+00:00',
  }


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getPostReblogs(content).then((result) => {
      result = [...reblogs, dummy];
      setReblogs(result);
      reactotron.log("Result", result);
    });


  }, []);

  const _reblog = () => {
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
  };

  return (
    <AccountListContainer data={reblogs}>
      {({ data, filterResult, handleSearch, handleOnUserPress }) => (

        <SafeAreaView style={[globalStyles.container, { paddingBottom: 40 }]}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
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
          <MainButton
            style={globalStyles.mainbutton}
            onPress={_reblog}
            iconName="square-edit-outline"
            iconType="MaterialCommunityIcons"
            iconColor="white"
            text="Reblog Post"
          />
        </SafeAreaView>

      )}
    </AccountListContainer>
  );
};

export default gestureHandlerRootHOC(ReblogScreen);
