import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import ROUTES from '../../../constants/routeNames';

import { getCommunities, getSubscriptions } from '../../../providers/hive/dhive';
import {
  fetchDiscoverCommunities,
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
  const [isDiscoversLoading, setIsDiscoversLoading] = useState(true);

  const currentAccount = useSelector((state: RootState) => state.account.currentAccount);
  const pinCode = useSelector((state: RootState) => state.application.pin);
  const communitiesCache: CommunityCacheObject = useSelector((state: RootState) => state.cache.communities);

  useEffect(() => {
    _getSubscriptions();
  }, []);

  // Side effects for updating state when cache is updated
  useEffect(() => {
    if (communitiesCache && communitiesCache.subscribedCommunities.length > 0) {
      setSubscriptions(communitiesCache.subscribedCommunities);
      setIsSubscriptionsLoading(false);
    }
  }, [communitiesCache.subscribedCommunities]);

  useEffect(() => {
    if (communitiesCache && communitiesCache.discoverCommunities.length > 0) {
      setDiscovers(communitiesCache.discoverCommunities);
    }
  }, [communitiesCache.discoverCommunities]);

  useEffect(() => {
    setIsDiscoversLoading(communitiesCache.fetchingDiscoverCommunities);
  }, [communitiesCache.fetchingDiscoverCommunities]);

  useEffect(() => {
    setIsSubscriptionsLoading(communitiesCache.fetchingSubscribedCommunities);
  }, [communitiesCache.fetchingSubscribedCommunities]);

  const _getSubscriptions = () => {
    dispatch(fetchSubscribedCommunities(currentAccount.name));
  };

  // Component Functions
  const _handleTabChange = ({ i }) => {
    setActiveTabIndex(i);
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
      isSubscriptionsLoading,
      isDiscoversLoading,
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
