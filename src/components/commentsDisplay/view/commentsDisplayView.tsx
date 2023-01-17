import React, { forwardRef, useImperativeHandle, useRef, useState, useMemo } from 'react';
import { SectionList, View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';


// Components
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';
import { Comment } from '../..';
import { FilterBar } from '../../filterBar';
import { postQueries } from '../../../providers/queries';

const CommentsDisplayView = forwardRef(
  (
    {
      author,
      commentCount,
      fetchPost,
      permlink,
      mainAuthor,
      flatListProps,
      fetchedAt,
      postContentView,
      isLoading,
      handleOnVotersPress,
      handleOnReplyPress,
      handleOnCommentsLoaded,
    },
    ref,
  ) => {
    const intl = useIntl();

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

    const _handleOnDropdownSelect = (option, index) => {
      setSelectedFilter(option);
      setSelectedOptionIndex(index);
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
            hideManyCommentsButton={true}
            comment={item}
            commentCount={item.children}
            commentNumber={item.level + 1}
            handleDeleteComment={() => { }}
            currentAccountUsername={'demo.com'}
            fetchPost={fetchPost}
            handleOnEditPress={() => { }}
            handleOnReplyPress={() => { }}
            handleOnUserPress={() => { }}
            handleOnVotersPress={() => { }}
            isHideImage={false}
            isLoggedIn={true}
            showAllComments={false}
            isShowSubComments={false}
            key={item.permlink}
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