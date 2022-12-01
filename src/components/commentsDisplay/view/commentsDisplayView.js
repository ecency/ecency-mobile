import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

// Components
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';
import { Comments } from '../../comments';
import { FilterBar } from '../../filterBar';

const CommentsDisplayView = forwardRef(
  (
    {
      author,
      commentCount,
      fetchPost,
      permlink,
      mainAuthor,
      handleOnVotersPress,
      handleOnReplyPress,
      fetchedAt,
      postContentView,
      postBodyLoading
    },
    ref,
  ) => {
    const intl = useIntl();

    const writeCommentRef = useRef(null);

    const [selectedFilter, setSelectedFilter] = useState('trending');
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

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
        {postBodyLoading && (
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
    )

    return (
      <Comments
        postContentView={_postContentView}
        selectedFilter={selectedFilter}
        fetchPost={fetchPost}
        commentCount={commentCount}
        author={author}
        permlink={permlink}
        mainAuthor={mainAuthor}
        handleOnVotersPress={handleOnVotersPress}
        handleOnReplyPress={handleOnReplyPress}
        fetchedAt={fetchedAt}
      />
    );
  },
);

export default CommentsDisplayView;
