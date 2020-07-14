import React from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { FilterBar } from '../../../components';
import CommunitiesList from './communitiesList';

import CommunitiesContainer from '../container/communitiesContainer';

const filterOptions = ['rank', 'subs', 'new'];

const CommunitiesScreen = ({ navigation, searchValue }) => {
  const intl = useIntl();

  const activeVotes = get(navigation, 'state.params.activeVotes');

  return (
    <CommunitiesContainer data={activeVotes} searchValue={searchValue}>
      {({ data, filterIndex, handleOnVotersDropdownSelect }) => (
        <>
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={filterOptions.map((item) =>
              intl.formatMessage({
                id: `search_result.communities_filter.${item}`,
              }),
            )}
            defaultText={intl.formatMessage({
              id: `search_result.communities_filter.${filterOptions[filterIndex]}`,
            })}
            selectedOptionIndex={filterIndex}
            onDropdownSelect={(index) => handleOnVotersDropdownSelect(index, filterOptions[index])}
          />
          <CommunitiesList votes={data} />
        </>
      )}
    </CommunitiesContainer>
  );
};

export default CommunitiesScreen;
