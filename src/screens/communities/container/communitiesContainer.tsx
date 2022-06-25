import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import ROUTES from '../../../constants/routeNames';

import { getCommunities, getSubscriptions } from '../../../providers/hive/dhive';
import {
  fetchSubscribedCommunities,
  updateCommunitiesSubscription,
} from '../../../redux/actions/cacheActions';
import { RootState } from '../../../redux/store/store';
import { Community, CommunityCacheObject } from '../../../redux/reducers/cacheReducer';

const CommunitiesContainer = ({ children, navigation }) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const [discovers, setDiscovers] = useState([]);
  const [subscriptions, setSubscriptions] = useState<Community[]>([]);
  const [subscribingItem, setSubscribingItem] = useState<Community | null>(null);
  const [isSubscriptionsLoading, setIsSubscriptionsLoading] = useState(true);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isDiscoversLoading, setIsDiscoversLoading] = useState(false);

  const currentAccount = useSelector((state: RootState) => state.account.currentAccount);
  const pinCode = useSelector((state: RootState) => state.application.pin);
  const subscribingCommunitiesInDiscoverTab = useSelector(
    (state) => state.communities.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
  );
  const subscribingCommunitiesInJoinedTab = useSelector(
    (state) => state.communities.subscribingCommunitiesInCommunitiesScreenJoinedTab,
  );
  const communitiesCache: CommunityCacheObject = useSelector(
    (state: RootState) => state.cache.communities,
  );

  useEffect(() => {
    _getSubscriptions();
  }, []);

  useEffect(() => {
    if (communitiesCache && communitiesCache.subscribedCommunities.length > 0) {
      setSubscriptions(communitiesCache.subscribedCommunities);
      setIsSubscriptionsLoading(false);
      _updateDiscovers();
    }
  }, [communitiesCache.subscribedCommunities]);

  const _getSubscriptions = () => {
    dispatch(fetchSubscribedCommunities(currentAccount.name));
  };
  const _getDiscovers = () => {
    setIsDiscoversLoading(true);
    getCommunities('', 50, null, 'rank')
      .then((communities) => {
        communities.forEach((community) =>
          Object.assign(community, {
            isSubscribed: communitiesCache.subscribedCommunities.some(
              (subscribedCommunity) =>
                subscribedCommunity.communityId === community.name &&
                subscribedCommunity.isSubscribed,
            ),
          }),
        );
        setDiscovers(communities.sort((a, b) => a.title.localeCompare(b.title)));
        setIsDiscoversLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to get subscriptions', err);
        setIsDiscoversLoading(false);
      });
  };

  const _updateDiscovers = () => {
    const updatedDiscovers = discovers.map((community) => {
      let subItem = communitiesCache.subscribedCommunities.find(
        (subscribedCommunity) => subscribedCommunity.communityId === community.name,
      );
      if (subItem) {
        return {
          ...community,
          isSubscribed: subItem.isSubscribed,
        };
      } else {
        return community;
      }
    });
    setDiscovers(updatedDiscovers);
  };

  // Component Functions
  const _handleTabChange = ({ i }) => {
    console.log('i : ', i);
    setActiveTabIndex(i);
    // fetch discovers data when discover tab is active
    if (i === 1 && (!discovers || discovers.length === 0)) {
      _getDiscovers();
    }
  };
  const _handleOnPress = (name) => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.COMMUNITY,
      params: {
        tag: name,
      },
    });
  };

  const _handleSubscribeButtonPress = (item: Community) => {
    let successToastText = '';
    let failToastText = '';
    if (!item.isSubscribed) {
      successToastText = intl.formatMessage({
        id: 'alert.success_subscribe',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_subscribe',
      });
    } else {
      successToastText = intl.formatMessage({
        id: 'alert.success_leave',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_leave',
      });
    }

    const updatedItem = { ...item, isSubscribed: !item.isSubscribed };
    setSubscribingItem(updatedItem);
    dispatch(
      updateCommunitiesSubscription(
        currentAccount,
        pinCode,
        updatedItem,
        successToastText,
        failToastText,
      ),
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
      subscribingItem,
      loading: communitiesCache.subscribingCommunity,
      handleOnPress: _handleOnPress,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      handleGetSubscriptions: _getSubscriptions,
      handleTabChange: _handleTabChange,
    })
  );
};

export default withNavigation(CommunitiesContainer);
