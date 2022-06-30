import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { useSelector, useDispatch } from 'react-redux';
import { shuffle } from 'lodash';
import { useIntl } from 'react-intl';

import ROUTES from '../../../constants/routeNames';

import { getCommunities, getSubscriptions } from '../../../providers/hive/dhive';

import { subscribeCommunity, leaveCommunity } from '../../../redux/actions/communitiesAction';
import { statusMessage } from '../../../redux/constants/communitiesConstants';
import { updateSubscribedCommunitiesCache } from '../../../redux/actions/cacheActions';

const CommunitiesContainer = ({ children, navigation }) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const [discovers, setDiscovers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isSubscriptionsLoading, setIsSubscriptionsLoading] = useState(true);
  const [selectedCommunityItem, setSelectedCommunityItem] = useState(null);

  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);
  const subscribingCommunitiesInDiscoverTab = useSelector(
    (state) => state.communities.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
  );
  const subscribingCommunitiesInJoinedTab = useSelector(
    (state) => state.communities.subscribingCommunitiesInCommunitiesScreenJoinedTab,
  );
  const subscribedCommunitiesCache = useSelector((state) => state.cache.subscribedCommunities);

  useEffect(() => {
    _getSubscriptions();
  }, []);

  // handle cache in joined/membership tab
  useEffect(() => {
    if (subscribingCommunitiesInJoinedTab && selectedCommunityItem) {
      const { status } = subscribingCommunitiesInJoinedTab[selectedCommunityItem.communityId];
      if (status === statusMessage.SUCCESS) {
        dispatch(updateSubscribedCommunitiesCache(selectedCommunityItem));
      }
    }
  }, [subscribingCommunitiesInJoinedTab]);

  // handle cache in discover tab
  useEffect(() => {
    if (subscribingCommunitiesInDiscoverTab && selectedCommunityItem) {
      const { status } = subscribingCommunitiesInDiscoverTab[selectedCommunityItem.communityId];
      if (status === statusMessage.SUCCESS) {
        dispatch(updateSubscribedCommunitiesCache(selectedCommunityItem));
      }
    }
  }, [subscribingCommunitiesInDiscoverTab]);

  // side effect for subscribed communities cache update
  useEffect(() => {
    console.log('subscribedCommunitiesCache updated : ', subscribedCommunitiesCache);
  }, [subscribedCommunitiesCache]);

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

  const _getSubscriptions = () => {
    setIsSubscriptionsLoading(true);
    getSubscriptions(currentAccount.username)
      .then((subs) => {
        subs.forEach((item) => item.push(true));
        getCommunities('', 50, null, 'rank').then((communities) => {
          communities.forEach((community) =>
            Object.assign(community, {
              isSubscribed: subs.some(
                (subscribedCommunity) => subscribedCommunity[0] === community.name,
              ),
            }),
          );

          setSubscriptions(subs);
          setDiscovers(shuffle(communities));
          setIsSubscriptionsLoading(false);
        });
      })
      .catch((err) => {
        console.warn('Failed to get subscriptions', err);
        setIsSubscriptionsLoading(false);
      });
  };

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
    setSelectedCommunityItem(data); //set selected item to handle its cache
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

  console.log('subscriptions : ', subscriptions);
  return (
    children &&
    children({
      subscriptions,
      discovers,
      subscribingCommunitiesInDiscoverTab,
      subscribingCommunitiesInJoinedTab,
      isSubscriptionsLoading,
      handleOnPress: _handleOnPress,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      handleGetSubscriptions: _getSubscriptions,
    })
  );
};

export default withNavigation(CommunitiesContainer);
