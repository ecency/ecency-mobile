import React from 'react';
import { SafeAreaView, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import { FilterBar, UserAvatar } from '../../../components';
import { CommunitiesPlaceHolder } from '../../../components/basicUIElements';
import OtherResultContainer from '../container/otherResultContainer';

import styles from './otherResultsStyles';

import DEFAULT_IMAGE from '../../../assets/no_image.png';

const filterOptions = ['user', 'tag'];

const OtherResult = ({ navigation, searchValue }) => {
  const intl = useIntl();

  const _renderUserItem = (item, index) => (
    <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
      <UserAvatar username={item} defaultSource={DEFAULT_IMAGE} noAction />
      <Text style={styles.username}>{item}</Text>
    </View>
  );

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

  const _renderList = (users, tags, filterIndex, handleOnPress) => {
    switch (filterIndex) {
      case 0:
        if (users && users.length > 0) {
          return (
            <FlatList
              data={users}
              keyExtractor={(item, ind) => `${item}-${ind}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => handleOnPress(item)}>
                  {_renderUserItem(item, index)}
                </TouchableOpacity>
              )}
              ListEmptyComponent={_renderEmptyContent}
            />
          );
        }
      case 1:
        if (tags && tags.length > 0) {
          return (
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
          );
        }
      default:
        break;
    }
  };

  return (
    <OtherResultContainer searchValue={searchValue}>
      {({ users, tags, filterIndex, handleFilterChanged, handleOnPress, loadMore }) => (
        <SafeAreaView style={styles.container}>
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={filterOptions.map((item) =>
              intl.formatMessage({
                id: `search_result.other_result_filter.${item}`,
              }),
            )}
            defaultText={intl.formatMessage({
              id: `search_result.other_result_filter.${filterOptions[filterIndex]}`,
            })}
            selectedOptionIndex={filterIndex}
            onDropdownSelect={(index) => handleFilterChanged(index, filterOptions[index])}
          />
          {_renderList(users, tags, filterIndex, handleOnPress)}
        </SafeAreaView>
      )}
    </OtherResultContainer>
  );
};

export default OtherResult;
