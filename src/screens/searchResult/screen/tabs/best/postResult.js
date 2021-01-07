import React from 'react';
import { SafeAreaView, FlatList, View, Text, TouchableOpacity } from 'react-native';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import FastImage from 'react-native-fast-image';
import { useIntl } from 'react-intl';

// Components
import { PostHeaderDescription, FilterBar } from '../../../../../components';
import { TextWithIcon, CommunitiesPlaceHolder } from '../../../../../components/basicUIElements';
import PostResultContainer from '../../../container/postResultContainer';

import { getTimeFromNow } from '../../../../../utils/time';

import styles from './postResultStyles';

import DEFAULT_IMAGE from '../../../../../assets/no_image.png';

const filterOptions = ['relevance', 'popularity', 'newest'];

const PostResult = ({ navigation, searchValue }) => {
  const intl = useIntl();

  const _renderItem = (item, index) => {
    return (
      <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
        <PostHeaderDescription
          date={getTimeFromNow(get(item, 'created_at'))}
          name={get(item, 'author')}
          reputation={Math.floor(get(item, 'author_rep'))}
          size={36}
          tag={item.category}
        />
        <FastImage source={item.img_url} style={styles.thumbnail} defaultSource={DEFAULT_IMAGE} />
        <View style={[styles.postDescription]}>
          <Text style={styles.title}>{item.title}</Text>
          {!!item.body && (
            <Text style={styles.summary} numberOfLines={2}>
              {item.body}
            </Text>
          )}
        </View>
        <View style={styles.stats}>
          {!isUndefined(item.payout) && (
            <Text style={styles.postIconText}>{`$ ${item.payout}`}</Text>
          )}
          <TextWithIcon
            iconName="heart-outline"
            textStyle={styles.postIconText}
            iconStyle={styles.postIcon}
            iconType="MaterialCommunityIcons"
            text={get(item, 'up_votes', 0)}
          />
          <TextWithIcon
            iconName="comment-outline"
            iconStyle={styles.postIcon}
            iconType="MaterialCommunityIcons"
            text={get(item, 'children', 0)}
            textStyle={styles.postIconText}
          />
        </View>
      </View>
    );
  };

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
    <PostResultContainer searchValue={searchValue}>
      {({ data, filterIndex, handleFilterChanged, handleOnPress, loadMore }) => (
        <SafeAreaView style={styles.container}>
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={filterOptions.map((item) =>
              intl.formatMessage({
                id: `search_result.post_result_filter.${item}`,
              }),
            )}
            defaultText={intl.formatMessage({
              id: `search_result.post_result_filter.${filterOptions[filterIndex]}`,
            })}
            selectedOptionIndex={filterIndex}
            onDropdownSelect={(index) => handleFilterChanged(index, filterOptions[index])}
          />
          <FlatList
            data={data}
            keyExtractor={(item) => item.id && item.id.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => handleOnPress(item)}>
                {_renderItem(item, index)}
              </TouchableOpacity>
            )}
            onEndReached={loadMore}
            ListEmptyComponent={_renderEmptyContent}
            ListFooterComponent={<CommunitiesPlaceHolder />}
          />
        </SafeAreaView>
      )}
    </PostResultContainer>
  );
};

export default PostResult;
