import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { BasicHeader, FilterBar, VotersDisplay } from '../../../components';

import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import globalStyles from '../../../globalStyles';
import { getPost, getActiveVotes } from '../../../providers/steem/dsteem';
import { parseActiveVotes } from '../../../utils/postParser';

const filterOptions = ['rewards', 'percent', 'time'];

const VotersScreen = ({ navigation }) => {
  const intl = useIntl();
  const [activeVotes, setActiveVotes] = useState([]);
  const [content, setContent] = useState(get(navigation, 'state.params.content'));
  const [isLoading, setIsLoading] = useState(false);

  const headerTitle = intl.formatMessage({
    id: 'voters.voters_info',
  });
  const currentAccount = get(navigation, 'state.params.user');

  useEffect(() => {
    console.log('content', content);
    if (content) {
      getActiveVotes(get(content, 'author'), get(content, 'permlink'))
        .then((result) => {
          result.sort((a, b) => b.rshares - a.rshares);

          const _votes = parseActiveVotes(
            { ...content, active_votes: result },
            get(currentAccount, 'name'),
          );

          setActiveVotes(_votes);
        })
        .catch(() => {});
    }
  }, []);

  //const activeVotes = get(navigation, 'state.params.activeVotes');
  //const content = get(navigation, 'state.params.content');

  return (
    <AccountListContainer data={activeVotes}>
      {({ data, filterResult, filterIndex, handleOnVotersDropdownSelect, handleSearch }) => (
        <>
          <BasicHeader
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
          <VotersDisplay votes={filterResult || data} />
        </>
      )}
    </AccountListContainer>
  );
};

export default VotersScreen;
