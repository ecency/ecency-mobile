import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { shuffle } from 'lodash';

import ROUTES from '../../../../../../constants/routeNames';

import { getCommunities, getSubscriptions } from '../../../../../../providers/hive/dhive';

import {
  subscribeCommunity,
  leaveCommunity,
  fetchSubscribedCommunities,
} from '../../../../../../redux/actions/communitiesAction';
import { Community, CommunityCacheObject } from '../../../../../../redux/reducers/cacheReducer';
import { RootState } from '../../../../../../redux/store/store';
import { updateCommunitiesSubscription } from '../../../../../../redux/actions/cacheActions';

// const DEFAULT_COMMUNITIES = [
//   'hive-125125',
//   'hive-174301',
//   'hive-140217',
//   'hive-179017',
//   'hive-160545',
//   'hive-194913',
//   'hive-166847',
//   'hive-176853',
//   'hive-183196',
//   'hive-163772',
//   'hive-106444',
// ];

const CommunitiesResultsContainer = ({ children, navigation, searchValue }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [isDiscoversLoading, setIsDiscoversLoading] = useState(false);
  const [subscribingItem, setSubscribingItem] = useState<Community | null>(null);

  const pinCode = useSelector((state) => state.application.pin);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const subscribingCommunities = useSelector(
    (state) => state.communities.subscribingCommunitiesInSearchResultsScreen,
  );

  const communitiesCache: CommunityCacheObject = useSelector(
    (state: RootState) => state.cache.communities,
  );

  useEffect(() => {
    if (
      (communitiesCache.subscribedCommunities &&
        communitiesCache.subscribedCommunities.length === 0) ||
      (communitiesCache.discoverCommunities && communitiesCache.discoverCommunities.length === 0)
    ) {
      dispatch(fetchSubscribedCommunities(currentAccount.name));
    }
  }, []);

  useEffect(() => {
    console.log('communitiesCache.subscribedCommunities changed');
    
    if (
      communitiesCache.subscribedCommunities &&
      communitiesCache.subscribedCommunities.length > 0
    ) {
      _getSearchedCommunities();
    }
  }, [communitiesCache.subscribedCommunities]);
  useEffect(() => {
    if (searchValue) {
      _getSearchedCommunities();
    } else {
      setData(communitiesCache.discoverCommunities);
    }
  }, [searchValue]);

  const _getSearchedCommunities = () => {
    setIsDiscoversLoading(true);
    getCommunities('', searchValue ? 100 : 20, searchValue || null, 'rank')
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

        setData(communities.sort((a, b) => a.title.localeCompare(b.title)));
        setNoResult(false);
        setIsDiscoversLoading(false);
      })
      .catch((err) => {
        console.log('Error while fetching comnunities : ', err);
        setNoResult(true);
        setData([]);
        setIsDiscoversLoading(false);
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

  const _handleSubscribeButtonPress = (item: Community) => {
    console.log('item : ', item);
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
      data,
      subscribingItem,
      loading: communitiesCache.subscribingCommunity,
      handleOnPress: _handleOnPress,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      isLoggedIn,
      noResult,
      isDiscoversLoading,
    })
  );
};

export default withNavigation(CommunitiesResultsContainer);
