import React from 'react';
import { SafeAreaView, FlatList } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import { CommunitiesPlaceHolder, UserListItem } from '../../../../../components/basicUIElements';
import PeopleResultsContainer from '../../../container/peopleResultsContainer';

import styles from './peopleResultsStyles';

const PeopleResults = ({ navigation, searchValue }) => {
  const intl = useIntl();

  const _renderEmptyContent = () => {
    return (
      <>
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
      </>
    );
  };

  return (
    <PeopleResultsContainer searchValue={searchValue}>
      {({ users, handleOnPress }) => (
        <SafeAreaView style={styles.container}>
          {users && (
            <FlatList
              data={users}
              keyExtractor={(item, ind) => `${item}-${ind}`}
              renderItem={({ item, index }) => (
                <UserListItem
                  handleOnPress={() => handleOnPress(item)}
                  index={index}
                  username={item}
                />
              )}
              ListEmptyComponent={_renderEmptyContent}
            />
          )}
        </SafeAreaView>
      )}
    </PeopleResultsContainer>
  );
};

export default PeopleResults;
