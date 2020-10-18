import React from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { BasicHeader, FilterBar, VotersDisplay } from '../../../components';

import AccountListContainer from '../../../containers/accountListContainer';

const filterOptions = ['rewards', 'percent', 'time'];

const VotersScreen = ({ navigation }) => {
  const intl = useIntl();
  const headerTitle = intl.formatMessage({
    id: 'voters.voters_info',
  });

  const activeVotes = get(navigation, 'state.params.activeVotes');
  const totalPayout = get(navigation, 'state.params.totalPayout');

  const voteRshares = activeVotes.reduce((a, b) => a + parseFloat(b.rshares), 0);
  const ratio = totalPayout / voteRshares;

  const _activeVotes = activeVotes
    .map((a) => {
      const rew = parseFloat(a.rshares) * ratio;

      return Object.assign({}, a, {
        reward: rew,
      });
    })
    .sort((a, b) => {
      const keyA = a.reward;
      const keyB = b.reward;

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });

  return (
    <AccountListContainer data={_activeVotes}>
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
