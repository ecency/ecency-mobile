import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// HIVE
import { getCommunities, getSubscriptions } from '../../../../providers/hive/hive';

import SelectCommunityModalView from '../view/selectCommunityModalView';

// Actions
import {
  fetchCommunities,
  fetchCommunitiesSuccess,
  fetchCommunitiesFail,
  fetchSubscribedCommunities,
  fetchSubscribedCommunitiesSuccess,
  fetchSubscribedCommunitiesFail,
} from '../../../../redux/actions/communitiesAction';

const SelectCommunityModalContainer = () => {
  const dispatch = useDispatch();

  const topCommunities = useSelector((state) => state.communities.communities);
  const subscribedCommunities = useSelector((state) => state.communities.subscribedCommunities);

  useEffect(() => {
    callTopCommunities();
    callSubscribedCommunities();
  }, []);

  const callTopCommunities = () => {
    dispatch(fetchCommunities());
    getCommunities('', 50, '', 'rank', '')
      .then((communities) => {
        dispatch(fetchCommunitiesSuccess(communities));
        console.log('getCommunities', communities);
      })
      .catch((error) => console.log(error));
  };

  const callSubscribedCommunities = () => {
    dispatch(fetchSubscribedCommunities());
    getSubscriptions('furkankilic')
      .then((subscriptions) => {
        dispatch(fetchSubscribedCommunitiesSuccess(subscriptions));
        console.log('getSubscriptions', subscriptions);
      })
      .catch((error) => console.log(error));
  };

  console.log('topCommunities', topCommunities);

  return (
    <>
      <SelectCommunityModalView
        topCommunities={topCommunities}
        subscribedCommunities={subscribedCommunities}
      />
    </>
  );
};

export default SelectCommunityModalContainer;
