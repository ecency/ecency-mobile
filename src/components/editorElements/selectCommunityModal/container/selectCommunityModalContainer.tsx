import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { debounce } from 'lodash';

// SDK
import { getCommunityQueryOptions, getCommunitiesQueryOptions } from '@ecency/sdk';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import SelectCommunityModalView from '../view/selectCommunityModalView';

// Actions
import {
  fetchCommunities,
  fetchSubscribedCommunities,
} from '../../../../redux/actions/communitiesAction';
import { mergeSubCommunitiesCacheInSubList } from '../../../../utils/communitiesUtils';
import { useAppSelector } from '../../../../hooks';
import {
  selectTopCommunities,
  selectSubscribedCommunities,
  selectSubscribedCommunitiesCache,
} from '../../../../redux/selectors';

const SelectCommunityModalContainer = ({
  onPressCommunity,
  currentAccount,
  onCloseModal,
  showSubscribedOnly,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [searchedCommunities, setSearchedCommunities] = useState([]);
  const [showSearchedCommunities, setShowSearchedCommunities] = useState(false);
  const [subscriptions, setSubscriptions] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const topCommunities = useAppSelector(selectTopCommunities);
  const subscribedCommunities = useAppSelector(selectSubscribedCommunities);
  const subscribedCommunitiesCache = useAppSelector(selectSubscribedCommunitiesCache);

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

  // Use SDK query for community search
  const { data: searchResults } = useQuery({
    ...getCommunitiesQueryOptions('rank', searchQuery, 15, currentAccount.name),
    enabled: !showSubscribedOnly && searchQuery.length >= 3,
  });

  const handleChangeSearch = (text) => {
    if (showSubscribedOnly) {
      const filteredSubscriptions = subscriptions?.filter((item) =>
        item.title.toLowerCase().includes(text.toLowerCase()),
      );
      setSearchedCommunities(filteredSubscriptions);
      setShowSearchedCommunities(true);
    } else if (text.length >= 3) {
      setShowSearchedCommunities(true);
      setSearchQuery(text);
    } else {
      setShowSearchedCommunities(false);
      setSearchQuery('');
    }
  };

  // Update search results when SDK query completes
  useEffect(() => {
    if (searchResults && searchQuery.length >= 3 && !showSubscribedOnly) {
      setSearchedCommunities(searchResults);
    }
  }, [searchResults, searchQuery, showSubscribedOnly]);

  const _onPressCommunity = async (community) => {
    // intercept press community and fetch complete community object
    if (community && community.name && !community.type_id) {
      const fullCommunity = await queryClient.fetchQuery(
        getCommunityQueryOptions(community.name, currentAccount.name),
      );
      community = fullCommunity;
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
