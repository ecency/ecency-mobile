import React from 'react';
import { SafeAreaView, FlatList, View, Text, TouchableOpacity } from 'react-native';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import FastImage from 'react-native-fast-image';
import { useIntl } from 'react-intl';

// Components
import { PostHeaderDescription, FilterBar } from '../../../../../../components';
import {
  TextWithIcon,
  CommunitiesPlaceHolder,
  EmptyScreen,
} from '../../../../../../components/basicUIElements';
import PostsResultsContainer from '../container/postsResultsContainer';

import { getTimeFromNow } from '../../../../../../utils/time';

import styles from './postsResultsStyles';

import DEFAULT_IMAGE from '../../../../../../assets/no_image.png';

const filterOptions = ['relevance', 'popularity', 'newest'];

const PostsResults = ({ navigation, searchValue }) => {
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
    <PostsResultsContainer searchValue={searchValue}>
      {({ data, handleOnPress, loadMore, noResult }) => (
        <SafeAreaView style={styles.container}>
          {noResult ? (
            <EmptyScreen />
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item, index) => index}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => handleOnPress(item)}>
                  {_renderItem(item, index)}
                </TouchableOpacity>
              )}
              onEndReached={loadMore}
              ListEmptyComponent={_renderEmptyContent}
              ListFooterComponent={<CommunitiesPlaceHolder />}
            />
          )}
        </SafeAreaView>
      )}
    </PostsResultsContainer>
  );
};

export default PostsResults;
