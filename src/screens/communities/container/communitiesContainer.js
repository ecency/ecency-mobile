import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { shuffle, isEmpty } from 'lodash';
import { useIntl } from 'react-intl';

import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../constants/routeNames';

import { getCommunities, getSubscriptions } from '../../../providers/hive/dhive';

import {
  subscribeCommunity,
  leaveCommunity,
  fetchSubscribedCommunitiesSuccess,
} from '../../../redux/actions/communitiesAction';
import { statusMessage } from '../../../redux/constants/communitiesConstants';
import {
  deleteSubscribedCommunityCacheEntry,
  updateSubscribedCommunitiesCache,
} from '../../../redux/actions/cacheActions';
import {
  mergeSubCommunitiesCacheInDiscoverList,
  mergeSubCommunitiesCacheInSubList,
} from '../../../utils/communitiesUtils';

const CommunitiesContainer = ({ children }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const intl = useIntl();

  const [discovers, setDiscovers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isSubscriptionsLoading, setIsSubscriptionsLoading] = useState(true);
  const [isDiscoversLoading, setIsDiscoversLoading] = useState(true);
  const [selectedCommunityItem, setSelectedCommunityItem] = useState(null);

  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);
  const subscribedCommunities = useSelector((state) => state.communities.subscribedCommunities);
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
    if (
      subscribedCommunitiesCache &&
      subscribedCommunitiesCache.size &&
      subscriptions &&
      subscriptions.length > 0
    ) {
      const updatedSubsList = mergeSubCommunitiesCacheInSubList(
        subscriptions,
        subscribedCommunitiesCache,
      );
      const updatedDiscoversList = mergeSubCommunitiesCacheInDiscoverList(
        discovers,
        subscribedCommunitiesCache,
      );
      setSubscriptions(updatedSubsList.slice());
      setDiscovers(updatedDiscoversList);
    }
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
    if (!isEmpty(subscribingCommunitiesInJoinedTab)) {
      const subscribedsData = mergeSubCommunitiesCacheInSubList(
        subscribedCommunities.data,
        subscribedCommunitiesCache,
      );
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
    }
  }, [subscribingCommunitiesInJoinedTab]);

  const _getSubscriptions = () => {
    setIsSubscriptionsLoading(true);
    setIsDiscoversLoading(true);
    if (
      subscribedCommunities &&
      subscribedCommunities.data &&
      subscribedCommunities.data.length > 0
    ) {
      const updatedSubsList = mergeSubCommunitiesCacheInSubList(
        subscribedCommunities.data,
        subscribedCommunitiesCache,
      );
      setSubscriptions(updatedSubsList.slice());
      setIsSubscriptionsLoading(false);
    }
    getSubscriptions(currentAccount.username)
      .then((subs) => {
        subs.forEach((item) => item.push(true));
        _invalidateSubscribedCommunityCache(subs); // invalidate subscribed communities cache item when latest data is available
        getCommunities('', 50, null, 'rank').then((communities) => {
          communities.forEach((community) =>
            Object.assign(community, {
              isSubscribed: subs.some(
                (subscribedCommunity) => subscribedCommunity[0] === community.name,
              ),
            }),
          );

          setSubscriptions(mergeSubCommunitiesCacheInSubList(subs, subscribedCommunitiesCache)); // merge cache with fetched data
          setDiscovers(communities);
          setIsSubscriptionsLoading(false);
          setIsDiscoversLoading(false);
          dispatch(
            fetchSubscribedCommunitiesSuccess(subs.sort((a, b) => a[1].localeCompare(b[1]))),
          ); // register subscribed data in communities store
        });
      })
      .catch((err) => {
        console.warn('Failed to get subscriptions', err);
        setIsSubscriptionsLoading(false);
        setIsDiscoversLoading(false);
      });
  };

  const _invalidateSubscribedCommunityCache = (fetchedList) => {
    fetchedList.map((listItem) => {
      const itemExists = subscribedCommunitiesCache.get(listItem[0]);
      if (itemExists) {
        dispatch(deleteSubscribedCommunityCacheEntry(listItem[0]));
      }
    });
  };
  // Component Functions
  const _handleOnPress = (name) => {
    navigation.navigate({
      name: ROUTES.SCREENS.COMMUNITY,
      params: {
        tag: name,
      },
    });
  };

  const _handleSubscribeButtonPress = (data, screen) => {
    setSelectedCommunityItem(data); // set selected item to handle its cache
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
      isSubscriptionsLoading,
      isDiscoversLoading,
      handleOnPress: _handleOnPress,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      handleGetSubscriptions: _getSubscriptions,
    })
  );
};

export default CommunitiesContainer;
