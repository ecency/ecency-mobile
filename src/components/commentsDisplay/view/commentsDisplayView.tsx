import React, { forwardRef, useImperativeHandle, useRef, useState, useMemo, useEffect } from 'react';
import { SectionList, View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useNavigation } from '@react-navigation/native';


// Components
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';
import { Comment } from '../..';
import { FilterBar } from '../../filterBar';
import { postQueries } from '../../../providers/queries';
import { useAppDispatch } from '../../../hooks';

const CommentsDisplayView = forwardRef(
  (
    {
      author,
      commentCount,
      permlink,
      mainAuthor,
      flatListProps,
      postContentView,
      isLoading,
      handleOnVotersPress,
      handleOnCommentsLoaded,
    },
    ref,
  ) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    const discussionQuery = postQueries.useDiscussionQuery(author, permlink);

    const writeCommentRef = useRef(null);

    const [selectedFilter, setSelectedFilter] = useState('trending');
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

    const sortedSections = useMemo(() => _sortComments(selectedFilter, discussionQuery.sectionedData), [discussionQuery.sectionedData, selectedFilter])

    useImperativeHandle(ref, () => ({
      bounceCommentButton: () => {
        console.log('bouncing comment button');
        if (writeCommentRef.current) {
          writeCommentRef.current.bounce();
        }
      },
    }));

    useEffect(()=>{
      if(!discussionQuery.isLoading){
        handleOnCommentsLoaded()
      }
    },[discussionQuery.isLoading])

    const _handleOnDropdownSelect = (option, index) => {
      setSelectedFilter(option);
      setSelectedOptionIndex(index);
    };


    const _handleOnVotersPress = (activeVotes, content) => {
      navigation.navigate({
        name: ROUTES.SCREENS.VOTERS,
        params: {
          activeVotes,
          content,
        },
        key: get(content, 'permlink'),
      });
    };
  
    const _handleOnEditPress = (item) => {
      navigation.navigate({
        name: ROUTES.SCREENS.EDITOR,
        key: `editor_edit_reply_${item.permlink}`,
        params: {
          isEdit: true,
          isReply: true,
          post: item,
          fetchPost: _getComments,
        },
      });
    };
  
    const _handleDeleteComment = (_permlink) => {
      let filteredComments;
  
      deleteComment(currentAccount, pinCode, _permlink).then(() => {
        let deletedItem = null;
  
        const _applyFilter = (item) => {
          if (item.permlink === _permlink) {
            deletedItem = item;
            return false;
          }
          return true;
        };
  
        if (lcomments.length > 0) {
          filteredComments = lcomments.filter(_applyFilter);
          setLComments(filteredComments);
        } else {
          filteredComments = propComments.filter(_applyFilter);
          setPropComments(filteredComments);
        }
  
        // remove cached entry based on parent
        if (deletedItem) {
          const cachePath = `${deletedItem.parent_author}/${deletedItem.parent_permlink}`;
          deletedItem.status = CommentCacheStatus.DELETED;
          delete deletedItem.updated;
          dispatch(updateCommentCache(cachePath, deletedItem, { isUpdate: true }));
        }
      });
    };
  
    const _openReplyThread = (comment) => {
      postsCachePrimer.cachePost(comment);
      navigation.navigate({
        name: ROUTES.SCREENS.POST,
        key: comment.permlink,
        params: {
          author: comment.author,
          permlink: comment.permlink,
        },
      });
    };


    const _postContentView = (
      <>
        {postContentView && postContentView}
        {!isLoading && (
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={VALUE.map((val) => intl.formatMessage({ id: `comment_filter.${val}` }))}
            defaultText={intl.formatMessage({ id: `comment_filter.${VALUE[0]}` })}
            onDropdownSelect={(selectedIndex) =>
              _handleOnDropdownSelect(COMMENT_FILTER[selectedIndex], selectedIndex)
            }
            selectedOptionIndex={selectedOptionIndex}
          />
        )}
      </>
    );



    const _renderComment = (item, backgroundColor:string = EStyleSheet.value('$primaryBackgroundColor')) => {
      return (
        <View style={{backgroundColor}}>
          <Comment
            mainAuthor={mainAuthor}
            comment={item}
            commentNumber={item.depth}

            showAllComments={false}
            isShowSubComments={false}
            hideManyCommentsButton={true}
            handleDeleteComment={_handleDeleteComment}
            handleOnEditPress={_handleOnEditPress}
            handleOnUserPress={()=>{}}
            handleOnVotersPress={handleOnVotersPress}
            handleOnLongPress={() => { }}
            openReplyThread={() => { }}
          />
        </View>

      );
    };


    const _renderMainComment = ({ section }) => {
      return _renderComment(section)
    }

    const _renderReply = ({ item }) => {
      return _renderComment(item, EStyleSheet.value('$primaryLightBackground'))
    }

    return (
      <SectionList
        style={{ flex: 1 }}
        ListHeaderComponent={_postContentView}
        sections={sortedSections}
        renderSectionHeader={_renderMainComment}
        renderItem={_renderReply}
        extraData={selectedFilter}
        keyExtractor={(item, index) => item + index}
        stickySectionHeadersEnabled={false}
        {...flatListProps}
      />
    );
  },
);

export default CommentsDisplayView;



const _sortComments = (sortOrder = 'trending', _comments) => {
  const sortedComments = _comments;

  const absNegative = (a) => a.net_rshares < 0;

  const sortOrders = {
    trending: (a, b) => {
      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const apayout = a.total_payout;
      const bpayout = b.total_payout;

      if (apayout !== bpayout) {
        return bpayout - apayout;
      }

      return 0;
    },
    reputation: (a, b) => {
      const keyA = a.author_reputation;
      const keyB = b.author_reputation;

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
    votes: (a, b) => {
      const keyA = a.active_votes.length;
      const keyB = b.active_votes.length;

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
    age: (a, b) => {
      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const keyA = Date.parse(a.created);
      const keyB = Date.parse(b.created);

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
  };

  sortedComments.sort(sortOrders[sortOrder]);

  return sortedComments;
};