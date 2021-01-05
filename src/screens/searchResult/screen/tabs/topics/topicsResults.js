import React from 'react';
import { SafeAreaView, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import { FilterBar, UserAvatar } from '../../../../../components';
import { CommunitiesPlaceHolder, UserListItem } from '../../../../../components/basicUIElements';
import TopicsResultsContainer from '../../../container/topicsResultsContainer';

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
    <TopicsResultsContainer searchValue={searchValue}>
      {({ tags, handleOnPress }) => (
        <SafeAreaView style={styles.container}>
          {tags && (
            <FlatList
              data={tags}
              keyExtractor={(item) => item.id}
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
