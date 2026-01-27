import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { shuffle } from 'lodash';

import { useNavigation } from '@react-navigation/native';
import { getCommunitiesQueryOptions } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../../../../../../hooks';
import ROUTES from '../../../../../../constants/routeNames';

import {
  subscribeCommunity,
  leaveCommunity,
} from '../../../../../../redux/actions/communitiesAction';
import { updateSubscribedCommunitiesCache } from '../../../../../../redux/actions/cacheActions';
import { statusMessage } from '../../../../../../redux/constants/communitiesConstants';
import {
  selectIsLoggedIn,
  selectCurrentAccount,
  selectPin,
} from '../../../../../../redux/selectors';

const CommunitiesResultsContainer = ({ children, searchValue }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [data, setData] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [isDiscoversLoading, setIsDiscoversLoading] = useState(false);
  const pinCode = useAppSelector(selectPin);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [selectedCommunityItem, setSelectedCommunityItem] = useState(null);
  const subscribingCommunities = useAppSelector(
    (state) => state.communities.subscribingCommunitiesInSearchResultsScreen,
  );
  const subscribingCommunitiesInSearchResultsScreen = useAppSelector(
    (state) => state.communities.subscribingCommunitiesInSearchResultsScreen,
  );
  const subscribedCommunities = useAppSelector((state) => state.communities.subscribedCommunities);
  const subscribedCommunitiesCache = useAppSelector((state) => state.cache.subscribedCommunities);

  // handle cache when searchResultsScreen data updates in communities reducer
  useEffect(() => {
    if (subscribingCommunitiesInSearchResultsScreen && selectedCommunityItem) {
      const { status } =
        subscribingCommunitiesInSearchResultsScreen[selectedCommunityItem.communityId];
      if (status === statusMessage.SUCCESS) {
        dispatch(updateSubscribedCommunitiesCache(selectedCommunityItem));
      }
    }
  }, [subscribingCommunitiesInSearchResultsScreen]);

  useEffect(() => {
    const fetchCommunities = async () => {
      setData([]);
      setNoResult(false);
      setIsDiscoversLoading(true);
      try {
        const communities = await queryClient.fetchQuery(
          getCommunitiesQueryOptions(
            'rank',
            searchValue || undefined,
            searchValue ? 100 : 20,
            currentAccount?.name || undefined,
          ),
        );

        if (currentAccount && currentAccount.name) {
          if (subscribedCommunities.data && subscribedCommunities.data.length) {
            communities.forEach((community) => {
              // first check in cache and then in subscription list
              const itemExistInCache = subscribedCommunitiesCache.get(community.name);
              const _isSubscribed = itemExistInCache
                ? itemExistInCache.data[4]
                : subscribedCommunities.data.findIndex((item) => item[0] === community.name) !== -1;
              return Object.assign(community, {
                isSubscribed: _isSubscribed,
              });
            });
          }
          if (searchValue) {
            setData(communities);
          } else {
            setData(shuffle(communities));
          }
          if (communities.length === 0) {
            setNoResult(true);
          }
        } else {
          if (searchValue) {
            setData(communities);
          } else {
            setData(shuffle(communities));
          }

          if (communities.length === 0) {
            setNoResult(true);
          }
        }
        setIsDiscoversLoading(false);
      } catch (error) {
        setNoResult(true);
        setData([]);
        setIsDiscoversLoading(false);
      }
    };

    fetchCommunities();
  }, [searchValue, queryClient, currentAccount, subscribedCommunities, subscribedCommunitiesCache]);

  useEffect(() => {
    const communitiesData = [...data];

    Object.keys(subscribingCommunities).forEach((communityId) => {
      if (!subscribingCommunities[communityId].loading) {
        if (!subscribingCommunities[communityId].error) {
          if (subscribingCommunities[communityId].isSubscribed) {
            communitiesData.forEach((item) => {
              if (item.name === communityId) {
                item.isSubscribed = true;
              }
            });
          } else {
            communitiesData.forEach((item) => {
              if (item.name === communityId) {
                item.isSubscribed = false;
              }
            });
          }
        }
      }
    });

    setData(communitiesData);
  }, [subscribingCommunities]);

  // Component Functions
  const _handleOnPress = (name) => {
    navigation.navigate({
      name: ROUTES.SCREENS.COMMUNITY,
      params: {
        tag: name,
      },
    });
  };

  const _handleSubscribeButtonPress = (_data, screen) => {
    setSelectedCommunityItem(_data); // set selected item to handle its cache
    let subscribeAction;
    let successToastText = '';
    let failToastText = '';

    if (!_data.isSubscribed) {
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
      subscribeAction(currentAccount, pinCode, _data, successToastText, failToastText, screen),
    );
  };

  return (
    children &&
    children({
      data,
      subscribingCommunities,
      handleOnPress: _handleOnPress,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      isLoggedIn,
      noResult,
      isDiscoversLoading,
    })
  );
};

export default CommunitiesResultsContainer;
