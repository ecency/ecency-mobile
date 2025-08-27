import React from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';

// Components
import { ListPlaceHolder, EmptyScreen } from '../../../../../../components/basicUIElements';
import TopicsResultsContainer from '../container/topicsResultsContainer';

import styles from './topicsResultsStyles';

const TopicsResults = ({ searchValue }) => {
  const _renderTagItem = (item, index) => (
    <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
      <Text style={styles.username}>{`#${item.tag}`}</Text>
    </View>
  );

  const _renderEmptyContent = () => {
    return (
      <>
        <ListPlaceHolder />
      </>
    );
  };

  return (
    <TopicsResultsContainer searchValue={searchValue}>
      {({ tags, handleOnPress, noResult }) => (
        <>
          {noResult ? (
            <EmptyScreen />
          ) : (
            <FlatList
              data={tags}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => handleOnPress(item)}>
                  {_renderTagItem(item, index)}
                </TouchableOpacity>
              )}
              ListEmptyComponent={_renderEmptyContent}
            />
          )}
        </>
      )}
    </TopicsResultsContainer>
  );
};

export default TopicsResults;
