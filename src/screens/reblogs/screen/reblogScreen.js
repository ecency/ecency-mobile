import React from 'react';
import { View, FlatList } from 'react-native';
import { useIntl } from 'react-intl';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { UserListItem } from '../../../components/basicUIElements';

import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import globalStyles from '../../../globalStyles';
import { getTimeFromNow } from '../../../utils/time';

const renderUserListItem = (item, index, handleOnUserPress) => {
  return (
    <UserListItem
      index={index}
      username={item.account}
      description={getTimeFromNow(item.timestamp)}
      handleOnPress={() => handleOnUserPress(item.account)}
      isClickable
    />
  );
};

const ReblogScreen = ({ navigation }) => {
  const intl = useIntl();
  const headerTitle = intl.formatMessage({
    id: 'reblog.title',
  });

  const activeVotes =
    navigation.state && navigation.state.params && navigation.state.params.reblogs;

  return (
    <AccountListContainer data={activeVotes} navigation={navigation}>
      {({ data, filterResult, handleSearch, handleOnUserPress }) => (
        <View style={globalStyles.container}>
          <BasicHeader
            title={`${headerTitle} (${data && data.length})`}
            isHasSearch
            handleOnSearch={text => handleSearch(text, 'account')}
          />
          <FlatList
            data={filterResult || data}
            keyExtractor={item => item.account}
            removeClippedSubviews={false}
            renderItem={({ item, index }) => renderUserListItem(item, index, handleOnUserPress)}
          />
        </View>
      )}
    </AccountListContainer>
  );
};

export default ReblogScreen;
