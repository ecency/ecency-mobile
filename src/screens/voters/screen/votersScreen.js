import React from 'react';
import { View } from 'react-native';
import { useIntl } from 'react-intl';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { FilterBar } from '../../../components/filterBar';
import { VotersDisplay } from '../../../components/votersDisplay';

import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import globalStyles from '../../../globalStyles';

const filterOptions = ['rewards', 'percent', 'time'];

const VotersScreen = ({ navigation }) => {
  const intl = useIntl();
  const headerTitle = intl.formatMessage({
    id: 'voters.voters_info',
  });

  const activeVotes =
    navigation.state && navigation.state.params && navigation.state.params.activeVotes;

  return (
    <AccountListContainer data={activeVotes}>
      {({ data, filterResult, handleOnVotersDropdownSelect, handleSearch }) => (
        <View style={globalStyles.container}>
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
            defaultText={intl.formatMessage({ id: `voters_dropdown.${filterOptions[0]}` })}
            onDropdownSelect={handleOnVotersDropdownSelect}
          />
          <VotersDisplay key={Math.random()} votes={filterResult || data} />
        </View>
      )}
    </AccountListContainer>
  );
};

export default VotersScreen;
