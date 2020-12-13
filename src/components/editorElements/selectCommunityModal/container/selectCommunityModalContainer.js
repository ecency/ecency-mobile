import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { debounce } from 'lodash';

// HIVE
import { getCommunities, getSubscriptions } from '../../../../providers/hive/hive';

import SelectCommunityModalView from '../view/selectCommunityModalView';

// Actions
import {
  fetchCommunities,
  fetchCommunitiesSuccess,
  fetchSubscribedCommunities,
  fetchSubscribedCommunitiesSuccess,
} from '../../../../redux/actions/communitiesAction';

const SelectCommunityModalContainer = ({ onPressCommunity, currentAccount }) => {
  const dispatch = useDispatch();

  const [searchedCommunities, setSearchedCommunities] = useState([]);
  const [showSearchedCommunities, setShowSearchedCommunities] = useState(false);

  const topCommunities = useSelector((state) => state.communities.communities);
  const subscribedCommunities = useSelector((state) => state.communities.subscribedCommunities);

  useEffect(() => {
    callTopCommunities();
    callSubscribedCommunities();
  }, []);

  const callTopCommunities = () => {
    dispatch(fetchCommunities());

    getCommunities('', 15, '', 'rank')
      .then((communities) => {
        dispatch(fetchCommunitiesSuccess(communities));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const callSubscribedCommunities = () => {
    dispatch(fetchSubscribedCommunities());
    getSubscriptions(currentAccount.name)
      .then((subscriptions) => {
        dispatch(fetchSubscribedCommunitiesSuccess(subscriptions));
      })
      .catch((error) => console.log(error));
  };

  const handleChangeSearch = (text) => {
    if (text.length >= 3) {
      setShowSearchedCommunities(true);
      getCommunities('', 15, text, 'rank')
        .then((searcheds) => {
          setSearchedCommunities(searcheds);
          console.log(searcheds, text, 'searcheds');
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
        subscribedCommunities={subscribedCommunities}
        onChangeSearch={debounce(handleChangeSearch, 500)}
        searchedCommunities={searchedCommunities}
        showSearchedCommunities={showSearchedCommunities}
        currentAccount={currentAccount}
      />
    </>
  );
};

export default SelectCommunityModalContainer;
