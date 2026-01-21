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

  const author = get(post, 'author');
  const permlink = get(post, 'permlink');

  const { data: activeVotes } = useQuery({
    ...(author && permlink ? getEntryActiveVotesQueryOptions(author, permlink) : {}),
    enabled: !!route.params?.content && !!author && !!permlink,
  });

  useEffect(() => {
    if (activeVotes && route.params?.content) {
      setPost((prev) => {
        if (!prev) return prev;

        const sortedVotes = [...activeVotes].sort((a, b) => b.rshares - a.rshares);
        const parsedVotes = parseActiveVotes({ ...prev, active_votes: sortedVotes });

        return {
          ...prev,
          active_votes: parsedVotes,
        };
      });
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
