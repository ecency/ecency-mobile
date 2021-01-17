import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { useSelector, useDispatch } from 'react-redux';
import { shuffle } from 'lodash';
import { useIntl } from 'react-intl';

import ROUTES from '../../../constants/routeNames';

import { getCommunities, getSubscriptions } from '../../../providers/hive/dhive';

import { toastNotification } from '../../../redux/actions/uiAction';
import { subscribeCommunity, leaveCommunity } from '../../../redux/actions/communitiesAction';

const CommunitiesContainer = ({ children, navigation }) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const [discovers, setDiscovers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);
  const subscribingCommunitiesInDiscoverTab = useSelector(
    (state) => state.communities.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
  );
  const subscribingCommunitiesInJoinedTab = useSelector(
    (state) => state.communities.subscribingCommunitiesInCommunitiesScreenJoinedTab,
  );

  useEffect(() => {
    getSubscriptions(currentAccount.username).then((subs) => {
      subs.forEach((item) => item.push(true));
      getCommunities('', 50, '', 'rank').then((communities) => {
        communities.forEach((community) =>
          Object.assign(community, {
            isSubscribed: subs.some(
              (subscribedCommunity) => subscribedCommunity[0] === community.name,
            ),
          }),
        );

        setSubscriptions(subs);
        setDiscovers(shuffle(communities));
      });
    });
  }, []);

  useEffect(() => {
    const discoversData = [...discovers];

    Object.keys(subscribingCommunitiesInDiscoverTab).map((communityId) => {
      if (!subscribingCommunitiesInDiscoverTab[communityId].loading) {
        if (!subscribingCommunitiesInDiscoverTab[communityId].error) {
          if (subscribingCommunitiesInDiscoverTab[communityId].isSubscribed) {
            discoversData.forEach((item) => {
              if (item.name === communityId) {
                item.isSubscribed = true;
              }
            });
          } else {
            discoversData.forEach((item) => {
              if (item.name === communityId) {
                item.isSubscribed = false;
              }
            });
          }
        }
      }
    });

    setDiscovers(discoversData);
  }, [subscribingCommunitiesInDiscoverTab]);

  useEffect(() => {
    const subscribedsData = [...subscriptions];

    Object.keys(subscribingCommunitiesInJoinedTab).map((communityId) => {
      if (!subscribingCommunitiesInJoinedTab[communityId].loading) {
        if (!subscribingCommunitiesInJoinedTab[communityId].error) {
          if (subscribingCommunitiesInJoinedTab[communityId].isSubscribed) {
            subscribedsData.forEach((item) => {
              if (item[0] === communityId) {
                item[4] = true;
              }
            });
          } else {
            subscribedsData.forEach((item) => {
              if (item[0] === communityId) {
                item[4] = false;
              }
            });
          }
        }
      }
    });

    setSubscriptions(subscribedsData);
  }, [subscribingCommunitiesInJoinedTab]);

  // Component Functions
  const _handleOnPress = (name) => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.COMMUNITY,
      params: {
        tag: name,
      },
    });
  };

  const _handleSubscribeButtonPress = (data, screen) => {
    let subscribeAction;
    let successToastText = '';
    let failToastText = '';

    if (!data.isSubscribed) {
      subscribeAction = subscribeCommunity;

      successToastText = intl.formatMessage({
        id: 'alert.success_subscribe',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_subscribe',
      });
    } else {
      subscribeAction = leaveCommunity;

      successToastText = intl.formatMessage({
        id: 'alert.success_leave',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_leave',
      });
    }

    dispatch(
      subscribeAction(currentAccount, pinCode, data, successToastText, failToastText, screen),
    );
  };

  return (
    children &&
    children({
      subscriptions,
      discovers,
      subscribingCommunitiesInDiscoverTab,
      subscribingCommunitiesInJoinedTab,
      handleOnPress: _handleOnPress,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
    })
  );
};

export default withNavigation(CommunitiesContainer);
