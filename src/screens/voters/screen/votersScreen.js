import React from 'react';
import { SafeAreaView } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { BasicHeader, FilterBar, VotersDisplay } from '../../../components';

import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import globalStyles from '../../../globalStyles';

const filterOptions = ['rewards', 'percent', 'time'];

const VotersScreen = ({ navigation }) => {
  const intl = useIntl();
  const headerTitle = intl.formatMessage({
    id: 'voters.voters_info',
  });

  const activeVotes = get(navigation, 'state.params.activeVotes');

  return (
    <AccountListContainer data={activeVotes}>
      {({ data, filterResult, filterIndex, handleOnVotersDropdownSelect, handleSearch }) => (
        <SafeAreaView style={globalStyles.container}>
          <BasicHeader
            title={`${headerTitle} (${data && data.length})`}
            isHasSearch
            handleOnSearch={text => handleSearch(text, 'voter')}
          />
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={filterOptions.map(item =>
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
        </SafeAreaView>
      )}
    </AccountListContainer>
  );
};

export default VotersScreen;
