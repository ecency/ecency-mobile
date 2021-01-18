import React from 'react';
import { SafeAreaView, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import { ListPlaceHolder, EmptyScreen } from '../../../../../../components/basicUIElements';
import TopicsResultsContainer from '../container/topicsResultsContainer';

import styles from './topicsResultsStyles';

const filterOptions = ['user', 'tag'];

const TopicsResults = ({ navigation, searchValue }) => {
  const intl = useIntl();

  const _renderTagItem = (item, index) => (
    <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
      <Text style={styles.username}>{`#${item.name}`}</Text>
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
        <SafeAreaView style={styles.container}>
          {noResult ? (
            <EmptyScreen />
          ) : (
            <FlatList
              data={tags}
              keyExtractor={(item, index) => index}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => handleOnPress(item)}>
                  {_renderTagItem(item, index)}
                </TouchableOpacity>
              )}
              ListEmptyComponent={_renderEmptyContent}
            />
          )}
        </SafeAreaView>
      )}
    </TopicsResultsContainer>
  );
};

export default TopicsResults;
