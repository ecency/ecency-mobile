import React from 'react';
import { SafeAreaView, FlatList } from 'react-native';

// Components
import {
  ListPlaceHolder,
  EmptyScreen,
  UserListItem,
} from '../../../../../../components/basicUIElements';
import PeopleResultsContainer from '../container/peopleResultsContainer';

import styles from './peopleResultsStyles';

const PeopleResults = ({ searchValue }) => {
  const _renderEmptyContent = () => {
    return (
      <>
        <ListPlaceHolder />
      </>
    );
  };

  return (
    <PeopleResultsContainer searchValue={searchValue}>
      {({ users, handleOnPress, noResult }) => (
        <SafeAreaView style={styles.container}>
          {noResult ? (
            <EmptyScreen />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <UserListItem
                  handleOnPress={() => handleOnPress(item)}
                  index={index}
                  username={item.name}
                  text={`@${item.name} ${item.full_name}`}
                  description={item.about}
                  descriptionStyle={styles.descriptionStyle}
                  isHasRightItem
                  isLoggedIn
                  searchValue={searchValue}
                  isLoadingRightAction={false}
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
