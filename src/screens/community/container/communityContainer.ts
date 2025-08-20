import { useState, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import { useNavigation } from '@react-navigation/native';
import { getCommunity } from '../../../providers/hive/dhive';

import { subscribeCommunity, leaveCommunity } from '../../../redux/actions/communitiesAction';

import ROUTES from '../../../constants/routeNames';
import { updateSubscribedCommunitiesCache } from '../../../redux/actions/cacheActions';
import { statusMessage } from '../../../redux/constants/communitiesConstants';

const CommunityContainer = ({ tag, children, currentAccount, pinCode, isLoggedIn }) => {
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedCommunityItem, setSelectedCommunityItem] = useState(null);

  const dispatch = useDispatch();
  const intl = useIntl();

  const subscribingCommunitiesInDiscoverTab = useSelector(
    (state) => state.communities.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
  );
  const subscribedCommunitiesCache = useSelector((state) => state.cache.subscribedCommunities);
  const subscribedCommunities = useSelector((state) => state.communities.subscribedCommunities);

  useEffect(() => {
    if (subscribingCommunitiesInDiscoverTab && selectedCommunityItem) {
      const { status } = subscribingCommunitiesInDiscoverTab[selectedCommunityItem.communityId];
      if (status === statusMessage.SUCCESS) {
        dispatch(updateSubscribedCommunitiesCache(selectedCommunityItem));
      }
    }
  }, [subscribingCommunitiesInDiscoverTab]);

  useEffect(() => {
    getCommunity(tag)
      .then((res) => {
        setData(res);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [tag]);

  useEffect(() => {
    if (data) {
      if (
        subscribedCommunitiesCache &&
        subscribedCommunitiesCache.size &&
        subscribedCommunitiesCache.get(data.name)
      ) {
        const itemExistInCache = subscribedCommunitiesCache.get(data.name);
        setIsSubscribed(itemExistInCache.data[4]); // if item exist in cache, get isSubscribed value from cache
      } else {
        // check in subscribed communities list if selected community exists
        const itemExist = subscribedCommunities.data.find((item) => item[0] === data.name);
        setIsSubscribed(!!itemExist);
      }
    }
  }, [data]);

  const _handleSubscribeButtonPress = () => {
    const _data = {
      isSubscribed,
      communityId: data.name,
    };
    setSelectedCommunityItem(_data); // set selected item to handle its cache
    const screen = 'communitiesScreenDiscoverTab';
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
    setIsSubscribed(!isSubscribed);
  };

  const _handleNewPostButtonPress = () => {
    navigation.navigate({
      name: ROUTES.SCREENS.EDITOR,
      key: 'editor_community_post',
      params: {
        community: [tag],
      },
    });
  };

  return (
    children &&
    children({
      data,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      handleNewPostButtonPress: _handleNewPostButtonPress,
      isSubscribed,
      isLoggedIn,
    })
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isLoggedIn: state.application.isLoggedIn,
});

export default connect(mapStateToProps)(CommunityContainer);
