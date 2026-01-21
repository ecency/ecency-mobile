import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getEntryActiveVotesQueryOptions } from '@ecency/sdk';
import { BasicHeader, FilterBar, VotersDisplay } from '../../../components';

import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import { parseActiveVotes } from '../../../utils/postParser';
import { useInjectVotesCache } from '../../../providers/queries/postQueries/postQueries';
import globalStyles from '../../../globalStyles';

const filterOptions = ['rewards', 'percent', 'time'];

const VotersScreen = ({ route }) => {
  const intl = useIntl();

  const [post, setPost] = useState(route.params?.content ?? null);
  const _cPost = useInjectVotesCache(post);

  const headerTitle = intl.formatMessage({
    id: 'voters.voters_info',
  });

  const { data: activeVotes } = useQuery({
    ...getEntryActiveVotesQueryOptions(get(post, 'author'), get(post, 'permlink')),
    enabled: !!route.params?.content && !!get(post, 'author') && !!get(post, 'permlink'),
  });

  useEffect(() => {
    if (activeVotes && route.params?.content) {
      const result = [...activeVotes];
      result.sort((a, b) => b.rshares - a.rshares);
      post.active_votes = parseActiveVotes({ ...post, active_votes: result });
      setPost({ ...post });
    }
  }, [activeVotes, route.params?.content]);

  const _activeVotes = _cPost.active_votes.slice();

  return (
    <AccountListContainer data={_activeVotes}>
      {({ data, filterResult, filterIndex, handleOnVotersDropdownSelect, handleSearch }) => (
        <SafeAreaView style={globalStyles.container}>
          <BasicHeader
            backIconName="close"
            title={`${headerTitle} (${data && data.length})`}
            isHasSearch
            handleOnSearch={(text) => handleSearch(text, 'voter')}
          />
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={filterOptions.map((item) =>
              intl.formatMessage({
                id: `voters_dropdown.${item}`,
              }),
            )}
            defaultText={intl.formatMessage({
              id: `voters_dropdown.${filterOptions[filterIndex]}`,
            })}
            selectedOptionIndex={filterIndex}
            onDropdownSelect={handleOnVotersDropdownSelect}
          />
          <VotersDisplay votes={filterResult || data} createdAt={post.created} />
        </SafeAreaView>
      )}
    </AccountListContainer>
  );
};

export default gestureHandlerRootHOC(VotersScreen);
