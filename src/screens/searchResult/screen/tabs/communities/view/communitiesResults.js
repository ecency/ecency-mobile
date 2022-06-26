import React from 'react';
import get from 'lodash/get';

// Components
import { CommunitiesList, EmptyScreen } from '../../../../../../components';

import CommunitiesResultsContainer from '../container/communitiesResultsContainer';

const CommunitiesResultsScreen = ({ navigation, searchValue }) => {
  const activeVotes = get(navigation, 'state.params.activeVotes');

  return (
    <CommunitiesResultsContainer data={activeVotes} searchValue={searchValue}>
      {({
        data,
        subscribingCommunities,
        handleOnPress,
        handleSubscribeButtonPress,
        isLoggedIn,
        noResult,
        isDiscoversLoading,
        subscribingItem,
        loading,
      }) =>
        noResult ? (
          <EmptyScreen />
        ) : (
          <CommunitiesList
            data={data}
            subscribingCommunities={subscribingCommunities}
            handleOnPress={handleOnPress}
            handleSubscribeButtonPress={handleSubscribeButtonPress}
            isLoggedIn={isLoggedIn}
            noResult={noResult}
            screen="searchResultsScreen"
            isDiscoversLoading={isDiscoversLoading}
            subscribingItem={subscribingItem}
            loading={loading}
          />
        )
      }
    </CommunitiesResultsContainer>
  );
};

export default CommunitiesResultsScreen;
