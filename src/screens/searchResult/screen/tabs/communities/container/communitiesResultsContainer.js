import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { shuffle } from 'lodash';

import ROUTES from '../../../../../../constants/routeNames';

import { getCommunities } from '../../../../../../providers/hive/dhive';

import {
  subscribeCommunity,
  leaveCommunity,
} from '../../../../../../redux/actions/communitiesAction';

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
  const pinCode = useSelector((state) => state.application.pin);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const subscribingCommunities = useSelector(
    (state) => state.communities.subscribingCommunitiesInSearchResultsScreen,
  );
  const subscribedCommunities = useSelector((state) => state.communities.subscribedCommunities);

  useEffect(() => {
    setData([]);
    setNoResult(false);
    setIsDiscoversLoading(true);
    getCommunities('', searchValue ? 100 : 20, searchValue || null, 'rank')
      .then((communities) => {
        if (currentAccount && currentAccount.username) {
          if (subscribedCommunities.data && subscribedCommunities.data.length) {
            communities.forEach((community) => {
              const _isSubscribed =
                subscribedCommunities.data.findIndex((item) => item[0] === community.name) === -1
                  ? false
                  : true;
              console.log('_isSubscribed : ', _isSubscribed);
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
      })
      .catch((err) => {
        setNoResult(true);
        setData([]);
        setIsDiscoversLoading(false);
      });
  }, [searchValue]);

  useEffect(() => {
    const communitiesData = [...data];

    Object.keys(subscribingCommunities).map((communityId) => {
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
      routeName: ROUTES.SCREENS.COMMUNITY,
      params: {
        tag: name,
      },
    });
  };

  const _handleSubscribeButtonPress = (_data, screen) => {
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

export default withNavigation(CommunitiesResultsContainer);
