import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import forEach from 'lodash/forEach';

// Components
import { BasicHeader, FilterBar, VotersDisplay } from '../../../components';

import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import { getActiveVotes } from '../../../providers/hive/dhive';
import { parseActiveVotes } from '../../../utils/postParser';
import { getResizedAvatar } from '../../../utils/image';

const filterOptions = ['rewards', 'percent', 'time'];

const VotersScreen = ({ navigation }) => {
  const intl = useIntl();
  const [content, setContent] = useState(get(navigation, 'state.params.content'));
  const [activeVotes, setActiveVotes] = useState(get(content, 'active_votes') || []);
  const [isLoading, setIsLoading] = useState(false);

  const headerTitle = intl.formatMessage({
    id: 'voters.voters_info',
  });

  useEffect(() => {
    const av = get(content, 'active_votes', []);
    forEach(av, (value) => {
      value.reward = 0;
      value.percent = 0;
      value.is_down_vote = Math.sign(value.rshares) < 0;
      value.avatar = getResizedAvatar(get(value, 'voter'));
    });
    setActiveVotes(av);
  }, []);

  useEffect(() => {
    if (content) {
      getActiveVotes(get(content, 'author'), get(content, 'permlink'))
        .then((result) => {
          result.sort((a, b) => b.rshares - a.rshares);
          const _votes = parseActiveVotes({ ...content, active_votes: result });
          setActiveVotes(_votes);
        })
        .catch(() => {});
    }
  }, [content]);

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
