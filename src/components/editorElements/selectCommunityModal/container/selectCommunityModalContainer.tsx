import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { debounce } from 'lodash';

// HIVE
import { getCommunities, getSubscriptions } from '../../../../providers/hive/dhive';

import SelectCommunityModalView from '../view/selectCommunityModalView';

// Actions
import {
  fetchSubscribedCommunities,
} from '../../../../redux/actions/communitiesAction';
import { RootState } from '../../../../redux/store/store';
import { CommunityCacheObject } from '../../../../redux/reducers/cacheReducer';

const SelectCommunityModalContainer = ({ onPressCommunity, currentAccount, onCloseModal }) => {
  const dispatch = useDispatch();

  const [searchedCommunities, setSearchedCommunities] = useState([]);
  const [showSearchedCommunities, setShowSearchedCommunities] = useState(false);

  const communitiesCache: CommunityCacheObject = useSelector(
    (state: RootState) => state.cache.communities,
  );
  
  useEffect(() => {
    if(!communitiesCache || communitiesCache.subscribedCommunities.length === 0){
      dispatch(fetchSubscribedCommunities(currentAccount.name));
    }
  }, []);

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
        topCommunities={communitiesCache.discoverCommunities}
        subscribedCommunities={communitiesCache.subscribedCommunities}
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
