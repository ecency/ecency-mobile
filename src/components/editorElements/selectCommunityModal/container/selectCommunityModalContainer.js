import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { debounce } from 'lodash';

// HIVE
import { getCommunities } from '../../../../providers/hive/dhive';

import SelectCommunityModalView from '../view/selectCommunityModalView';

// Actions
import {
  fetchCommunities,
  fetchSubscribedCommunities,
} from '../../../../redux/actions/communitiesAction';
import { mergeSubCommunitiesCacheInSubList } from '../../../../utils/communitiesUtils';

const SelectCommunityModalContainer = ({ onPressCommunity, currentAccount, onCloseModal }) => {
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
        setSubscriptions(updatedSubsList.filter((item) => item[4] === true));
      }
    }
    dispatch(fetchSubscribedCommunities(currentAccount.name));
  };

  const handleChangeSearch = (text) => {
    if (text.length >= 3) {
      setShowSearchedCommunities(true);
      getCommunities('', 15, text, 'rank')
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

  return (
    <>
      <SelectCommunityModalView
        onPressCommunity={onPressCommunity}
        topCommunities={topCommunities}
        subscribedCommunities={subscriptions}
        onChangeSearch={debounce(handleChangeSearch, 500)}
        searchedCommunities={searchedCommunities}
        showSearchedCommunities={showSearchedCommunities}
        currentAccount={currentAccount}
        onCloseModal={onCloseModal}
      />
    </>
  );
};

export default SelectCommunityModalContainer;
