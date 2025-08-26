import React from 'react';
import { FlatList, Platform } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Edges, SafeAreaView } from 'react-native-safe-area-context';
import { SearchInput, UserListItem } from '../../../components';

// Container
import AccountListContainer from '../../../containers/accountListContainer';

// Utils
import globalStyles from '../../../globalStyles';
import { getTimeFromNow } from '../../../utils/time';

const AccountList = ({ route, navigation }) => {
  const intl = useIntl();

  const users = route.params?.users || [];

  const _navigationGoBack = () => {
    navigation.goBack();
  };

  const headerTitle =
    route.params?.title ||
    intl.formatMessage({
      id: 'account_list.title',
    });

  // for modals, iOS has its own safe area handling
  const _safeAreaEdges: Edges = Platform.select({ ios: ['bottom'], default: ['top', 'bottom'] });

  return (
    <AccountListContainer data={users}>
      {({ data, filterResult, handleSearch, handleOnUserPress }) => (
        <SafeAreaView style={[globalStyles.container]} edges={_safeAreaEdges}>
          <SearchInput
            showClearButton={true}
            placeholder={`${headerTitle} (${data && data.length})`}
            onChangeText={(text) => {
              handleSearch(text, 'account');
            }}
            backEnabled={true}
            autoFocus={false}
            onBackPress={_navigationGoBack}
            backIconName="close"
          />
          <FlatList
            style={{ flex: 1, marginTop: 16 }}
            data={filterResult || data}
            keyExtractor={(item) => item.account}
            removeClippedSubviews={false}
            renderItem={({ item, index }) => renderUserListItem(item, index, handleOnUserPress)}
          />
        </SafeAreaView>
      )}
    </AccountListContainer>
  );
};

export default gestureHandlerRootHOC(AccountList);

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
