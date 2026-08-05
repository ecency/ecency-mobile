import React from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import { ListPlaceHolder, EmptyScreen } from '../../../../../../components/basicUIElements';
import TopicsResultsContainer from '../container/topicsResultsContainer';

import styles from './topicsResultsStyles';

const TopicsResults = ({ searchValue }: any) => {
  const intl = useIntl();
  const _renderTagItem = (item: any, index: any) => (
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
      {({ tags, handleOnPress, noResult, isError }: any) => (
        <>
          {noResult || isError ? (
            <EmptyScreen
              text={isError ? intl.formatMessage({ id: 'search_result.error' }) : undefined}
            />
          ) : (
            <FlatList
              data={tags}
              keyExtractor={(item) => item.tag}
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
