import { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import { useNavigation } from '@react-navigation/native';
import { getCommunityQueryOptions } from '@ecency/sdk';
import { useQuery } from '@tanstack/react-query';

import ROUTES from '../../../constants/routeNames';
import { updateSubscribedCommunitiesCache } from '../../../redux/actions/cacheActions';
import { statusMessage } from '../../../redux/constants/communitiesConstants';
import { selectCurrentAccount, selectIsLoggedIn } from '../../../redux/selectors';
import { useAppSelector, useCommunitySubscriptionAction } from '../../../hooks';
import { isCommunityModerator } from '../../../utils/communityModeration';

const CommunityContainer = ({ tag, children, currentAccount, isLoggedIn }: any) => {
  const navigation = useNavigation();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedCommunityItem, setSelectedCommunityItem] = useState<any>(null);

  const dispatch = useDispatch();
  const intl = useIntl();
  const handleCommunitySubscription = useCommunitySubscriptionAction();

  // Use SDK query to fetch community data
  const { data } = useQuery(getCommunityQueryOptions(tag, currentAccount?.name));

  const subscribingCommunitiesInDiscoverTab = useAppSelector(
    (state) => state.communities.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
  );
  const subscribedCommunitiesCache = useAppSelector((state) => state.cache.subscribedCommunities);
  const subscribedCommunities = useAppSelector((state) => state.communities.subscribedCommunities);

  useEffect(() => {
    if (subscribingCommunitiesInDiscoverTab && selectedCommunityItem) {
      const { status } = subscribingCommunitiesInDiscoverTab[selectedCommunityItem.communityId];
      if (status === statusMessage.SUCCESS) {
        dispatch(updateSubscribedCommunitiesCache(selectedCommunityItem));
      }
    }
  }, [subscribingCommunitiesInDiscoverTab]);

  // No longer need useEffect to fetch community - handled by useQuery

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
        const itemExist = subscribedCommunities.data.find((item: any) => item[0] === data.name);
        setIsSubscribed(!!itemExist);
      }
    }
  }, [data]);

  const _handleSubscribeButtonPress = () => {
    const _data = {
      isSubscribed,
      communityId: data!.name,
    };
    setSelectedCommunityItem(_data); // set selected item to handle its cache
    const screen = 'communitiesScreenDiscoverTab';

    const successToastText = intl.formatMessage({
      id: isSubscribed ? 'alert.success_leave' : 'alert.success_subscribe',
    });
    const failToastText = intl.formatMessage({
      id: isSubscribed ? 'alert.fail_leave' : 'alert.fail_subscribe',
    });

    handleCommunitySubscription(_data, successToastText, failToastText, screen);
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

  // Moderator authority comes from the community team, not from the Redux
  // subscription list: it does not depend on being subscribed, and the role slot
  // in that list is overwritable.
  const isModerator = isCommunityModerator(data?.team, currentAccount?.name);

  return (
    children &&
    children({
      data,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      handleNewPostButtonPress: _handleNewPostButtonPress,
      isSubscribed,
      isLoggedIn,
      isModerator,
    })
  );
};

const mapStateToProps = (state: any) => ({
  currentAccount: selectCurrentAccount(state),
  isLoggedIn: selectIsLoggedIn(state),
});

export default connect(mapStateToProps)(CommunityContainer);
