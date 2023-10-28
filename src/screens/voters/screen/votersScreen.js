import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { BasicHeader, FilterBar, VotersDisplay } from '../../../components';

import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import { getActiveVotes } from '../../../providers/hive/dhive';
import { parseActiveVotes } from '../../../utils/postParser';
import { useInjectVotesCache } from '../../../providers/queries/postQueries/postQueries';

const filterOptions = ['rewards', 'percent', 'time'];

const VotersScreen = ({ route }) => {
  const intl = useIntl();

  const [post, setPost] = useState(route.params?.content ?? null);
  const _cPost = useInjectVotesCache(post);

  const headerTitle = intl.formatMessage({
    id: 'voters.voters_info',
  });


  useEffect(() => {
    if (route.params?.content) {
      getActiveVotes(get(post, 'author'), get(post, 'permlink'))
        .then((result) => {
          result.sort((a, b) => b.rshares - a.rshares);
          post.active_votes = parseActiveVotes({ ...post, active_votes: result });;
          setPost({...post});
        })
        .catch(() => {});
    }
  }, [route.params?.content]);


  const _activeVotes = _cPost.active_votes.slice();

  return (
    <AccountListContainer data={_activeVotes}>
      {({ data, filterResult, filterIndex, handleOnVotersDropdownSelect, handleSearch }) => (
        <>
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
        </>
      )}
    </AccountListContainer>
  );
};

export default gestureHandlerRootHOC(VotersScreen);
