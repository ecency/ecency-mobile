import React from 'react';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Components
import { CommunitiesList, EmptyScreen } from '../../../../../../components';

import CommunitiesResultsContainer from '../container/communitiesResultsContainer';

const CommunitiesResultsScreen = ({ navigation, searchValue, listRef }) => {
  const intl = useIntl();
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
        isError,
        isDiscoversLoading,
      }) =>
        noResult || isError ? (
          <EmptyScreen
            text={isError ? intl.formatMessage({ id: 'search_result.error' }) : undefined}
          />
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
            listRef={listRef}
          />
        )
      }
    </CommunitiesResultsContainer>
  );
};

export default CommunitiesResultsScreen;
