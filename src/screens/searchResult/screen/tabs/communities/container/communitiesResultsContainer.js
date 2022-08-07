import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { shuffle } from 'lodash';

import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../../../../constants/routeNames';

import { getCommunities, getSubscriptions } from '../../../../../../providers/hive/dhive';

import {
  subscribeCommunity,
  leaveCommunity,
} from '../../../../../../redux/actions/communitiesAction';

const CommunitiesResultsContainer = ({ children, searchValue }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [isDiscoversLoading, setIsDiscoversLoading] = useState(false);
  const pinCode = useSelector((state) => state.application.pin);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const subscribingCommunities = useSelector(
    (state) => state.communities.subscribingCommunitiesInSearchResultsScreen,
  );

  useEffect(() => {
    setData([]);
    setNoResult(false);
    setIsDiscoversLoading(true);
    getCommunities('', searchValue ? 100 : 20, searchValue || null, 'rank')
      .then((communities) => {
        if (currentAccount && currentAccount.username) {
          getSubscriptions(currentAccount.username).then((subs) => {
            if (subs) {
              communities.forEach((community) =>
                Object.assign(community, {
                  isSubscribed: subs.some(
                    (subscribedCommunity) => subscribedCommunity[0] === community.name,
                  ),
                }),
              );
            }
            if (searchValue) {
              setData(communities);
            } else {
              setData(shuffle(communities));
            }
            if (communities.length === 0) {
              setNoResult(true);
            }
          });
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
      name: ROUTES.SCREENS.COMMUNITY,
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

export default CommunitiesResultsContainer;
