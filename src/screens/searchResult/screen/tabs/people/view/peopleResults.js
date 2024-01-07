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

const PeopleResults = ({ searchValue, isUsername }) => {
  const _renderEmptyContent = () => {
    return (
      <>
        <ListPlaceHolder />
      </>
    );
  };

  const _renderUsernames = (userNames, handleOnPress) => {
    return searchValue && isUsername && userNames && userNames.length ? (
      <FlatList
        data={userNames}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <UserListItem
            handleOnPress={() =>
              handleOnPress({
                name: item,
                text: item,
              })
            }
            index={index}
            username={item}
            text={`@${item}`}
            isHasRightItem
            isLoggedIn
            searchValue={searchValue}
            isLoadingRightAction={false}
          />
        )}
        ListEmptyComponent={_renderEmptyContent}
      />
    ) : null;
  };

  return (
    <PeopleResultsContainer searchValue={searchValue} isUsername={isUsername}>
      {({ users, userNames, handleOnPress, noResult }) => (
        <SafeAreaView style={styles.container}>
          {noResult && !userNames ? (
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
              ListHeaderComponent={_renderUsernames(userNames, handleOnPress)}
            />
          )}
        </SafeAreaView>
      )}
    </PeopleResultsContainer>
  );
};

export default PeopleResults;
