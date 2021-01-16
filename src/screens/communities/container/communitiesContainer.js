import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { useSelector, useDispatch } from 'react-redux';
import { shuffle } from 'lodash';
import { useIntl } from 'react-intl';

import ROUTES from '../../../constants/routeNames';

import {
  getCommunities,
  getSubscriptions,
  subscribeCommunity,
} from '../../../providers/hive/dhive';

import { toastNotification } from '../../../redux/actions/uiAction';

const CommunitiesContainer = ({ children, navigation }) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const [discovers, setDiscovers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);

  useEffect(() => {
    getSubscriptions(currentAccount.username).then((subs) => {
      getCommunities('', 50, '', 'rank').then((communities) => {
        communities.forEach((community) =>
          Object.assign(community, {
            isSubscribed: subs.some(
              (subscribedCommunity) => subscribedCommunity[0] === community.name,
            ),
            loading: false,
          }),
        );

        setSubscriptions(subs);
        setDiscovers(shuffle(communities));
      });
    });
  }, []);

  // Component Functions
  const _handleOnPress = (name) => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.COMMUNITY,
      params: {
        tag: name,
      },
    });
  };

  const _handleSubscribeButtonPress = (_data) => {
    const subscribedCommunityIndex = discovers.findIndex(
      (community) => community.name === _data.communityId,
    );

    const newDiscovers = [
      ...discovers.slice(0, subscribedCommunityIndex),
      Object.assign({}, discovers[subscribedCommunityIndex], { loading: true }),
      ...discovers.slice(subscribedCommunityIndex + 1),
    ];

    setDiscovers(newDiscovers);

    subscribeCommunity(currentAccount, pinCode, _data)
      .then(() => {
        const updatedDiscovers = [
          ...discovers.slice(0, subscribedCommunityIndex),
          Object.assign({}, discovers[subscribedCommunityIndex], {
            loading: false,
            isSubscribed: _data.isSubscribed,
          }),
          ...discovers.slice(subscribedCommunityIndex + 1),
        ];

        setDiscovers(updatedDiscovers);

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success_subscribe',
            }),
          ),
        );
      })
      .catch((error) => {
        const updatedDiscovers = [
          ...discovers.slice(0, subscribedCommunityIndex),
          Object.assign({}, discovers[subscribedCommunityIndex], {
            loading: false,
            isSubscribed: !_data.isSubscribed,
          }),
          ...discovers.slice(subscribedCommunityIndex + 1),
        ];

        setDiscovers(updatedDiscovers);

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.fail_subscribe',
            }),
          ),
        );
      });
  };

  return (
    children &&
    children({
      subscriptions,
      discovers,
      handleOnPress: _handleOnPress,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
    })
  );
};

export default withNavigation(CommunitiesContainer);
