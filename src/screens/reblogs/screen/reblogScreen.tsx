import React, { useState } from 'react';
import { FlatList, SafeAreaView, RefreshControl } from 'react-native';
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
  const pReblogs = route.params?.reblogs;
  const [reblogs, setReblogs] = useState(pReblogs);

  getPostReblogs(reblogs).then((result) => {
    reactotron.log(result);
  });
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);


  const content = route.params?.content;
  const intl = useIntl();
  const headerTitle = intl.formatMessage({
    id: 'reblog.title',
  });
  const dispatch = useAppDispatch();
  const userActivityMutation = useUserActivityMutation();
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);

  const _reblog = () => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }

    if (isLoggedIn) {
      reblog(currentAccount, pinCode, content.author, content.permlink)
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
        <SafeAreaView style={[globalStyles.container, { paddingBottom: 40 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
            // eslint-disable-next-line max-len, no-undef
            renderItem={({ item, index }) =>
              renderUserListItem(item, index, handleOnUserPress)}
          />
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
