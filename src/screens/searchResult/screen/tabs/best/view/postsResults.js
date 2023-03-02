import React, { useState } from 'react';
import { SafeAreaView, FlatList, View, Text, TouchableOpacity } from 'react-native';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import Highlighter from 'react-native-highlight-words';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { PostHeaderDescription, FilterBar } from '../../../../../../components';
import {
  TextWithIcon,
  CommunitiesPlaceHolder,
  EmptyScreen,
} from '../../../../../../components/basicUIElements';
import PostsResultsContainer from '../container/postsResultsContainer';

import { getTimeFromNow } from '../../../../../../utils/time';
import styles from './postsResultsStyles';
import { useAppDispatch } from '../../../../../../hooks';
import { showProfileModal } from '../../../../../../redux/actions/uiAction';

const filterOptions = ['relevance', 'popularity', 'newest'];

const PostsResults = ({ navigation, searchValue }) => {

  const dispatch = useAppDispatch();

  const _showProfileModal = (username) => {
    if(username){
      dispatch(showProfileModal(username))
    }
  }


  const _renderItem = (item, index) => {
    const reputation =
      get(item, 'author_rep', undefined) || get(item, 'author_reputation', undefined);
    // console.log(item);
    const votes = get(item, 'up_votes', 0) || get(item, 'stats.total_votes', 0);
    const body = get(item, 'summary', '') || get(item, 'body_marked', '');

    return (
      <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
        <PostHeaderDescription
          date={getTimeFromNow(get(item, 'created_at'))}
          name={get(item, 'author')}
          reputation={Math.floor(reputation)}
          size={36}
          content={item}
          profileOnPress={_showProfileModal}
        />
        <View style={[styles.postDescription]}>
          <Text style={styles.title}>{item.title}</Text>
          {!!body && (
            <Highlighter
              highlightStyle={{
                backgroundColor: EStyleSheet.value('$darkGrayBackground'),
                color: EStyleSheet.value('$white'),
              }}
              searchWords={[searchValue]}
              textToHighlight={body.replace(/<mark>/g, '').replace(/<\/mark>/g, '')}
              style={styles.summary}
              numberOfLines={3}
            />
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
            text={votes}
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
              keyExtractor={(item, index) => index.toString()}
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
