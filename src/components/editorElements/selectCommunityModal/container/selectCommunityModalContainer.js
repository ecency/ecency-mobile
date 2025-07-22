import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { debounce } from 'lodash';

// HIVE
import { getCommunities, getCommunity } from '../../../../providers/hive/dhive';

import SelectCommunityModalView from '../view/selectCommunityModalView';

// Actions
import {
  fetchCommunities,
  fetchSubscribedCommunities,
} from '../../../../redux/actions/communitiesAction';
import { mergeSubCommunitiesCacheInSubList } from '../../../../utils/communitiesUtils';

const SelectCommunityModalContainer = ({
  onPressCommunity,
  currentAccount,
  onCloseModal,
  showSubscribedOnly,
}) => {
  const dispatch = useDispatch();

  const [searchedCommunities, setSearchedCommunities] = useState([]);
  const [showSearchedCommunities, setShowSearchedCommunities] = useState(false);
  const [subscriptions, setSubscriptions] = useState(null);

  const topCommunities = useSelector((state) => state.communities.communities);
  const subscribedCommunities = useSelector((state) => state.communities.subscribedCommunities);
  const subscribedCommunitiesCache = useSelector((state) => state.cache.subscribedCommunities);

  useEffect(() => {
    callTopCommunities();
    callSubscribedCommunities();
  }, []);

  const callTopCommunities = () => dispatch(fetchCommunities('', 15, null, 'rank'));

  const callSubscribedCommunities = () => {
    if (
      subscribedCommunities &&
      subscribedCommunities.data &&
      subscribedCommunities.data.length > 0
    ) {
      const updatedSubsList = mergeSubCommunitiesCacheInSubList(
        subscribedCommunities.data,
        subscribedCommunitiesCache,
      );
      if (updatedSubsList && updatedSubsList.length > 0) {
        setSubscriptions(
          updatedSubsList
            .filter((item) => item[4] === true)
            .map((item) => ({ name: item[0], title: item[1] })),
        );
      }
    }
    dispatch(fetchSubscribedCommunities(currentAccount.name));
  };

  const handleChangeSearch = (text) => {
    if (showSubscribedOnly) {
      const filteredSubscriptions = subscriptions?.filter((item) =>
        item.title.toLowerCase().includes(text.toLowerCase()),
      );
      setSearchedCommunities(filteredSubscriptions);
      setShowSearchedCommunities(true);
    } else if (text.length >= 3) {
      setShowSearchedCommunities(true);
      getCommunities('', 15, text, 'rank', currentAccount.name)
        .then((searcheds) => {
          setSearchedCommunities(searcheds);
        })
        .catch((error) => {
          console.log(error, 'searcheds error');
        });
    } else {
      setShowSearchedCommunities(false);
    }
  };

  const _onPressCommunity = async (community) => {
    // intercept press community and fetch complete communit object
    if (community && community.name && !community.type_id) {
      community = await getCommunity(community.name, currentAccount.name);
    }

    onPressCommunity(community);
  };

  return (
    <SelectCommunityModalView
      onPressCommunity={_onPressCommunity}
      topCommunities={topCommunities}
      subscribedCommunities={subscriptions}
      showSubscribedOnly={showSubscribedOnly}
      onChangeSearch={debounce(handleChangeSearch, 500)}
      searchedCommunities={searchedCommunities}
      showSearchedCommunities={showSearchedCommunities}
      currentAccount={currentAccount}
      onCloseModal={onCloseModal}
    />
  );
};

export default SelectCommunityModalContainer;
