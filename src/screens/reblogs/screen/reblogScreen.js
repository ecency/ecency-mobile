import React from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { BasicHeader, UserListItem } from '../../../components';

// Container
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

  const activeVotes = get(navigation, 'state.params.reblogs');

  return (
    <AccountListContainer data={activeVotes} navigation={navigation}>
      {({ data, filterResult, handleSearch, handleOnUserPress }) => (
        <SafeAreaView style={[globalStyles.container, { paddingBottom: 40 }]}>
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
        </SafeAreaView>
      )}
    </AccountListContainer>
  );
};

export default ReblogScreen;
