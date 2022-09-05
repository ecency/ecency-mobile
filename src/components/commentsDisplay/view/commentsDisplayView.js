import React, { useState, Fragment, useImperativeHandle, forwardRef, useRef } from 'react';
import { View } from 'react-native';
import { injectIntl, useIntl } from 'react-intl';

// Components
import { FilterBar } from '../../filterBar';
import { Comments } from '../../comments';
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';
import { WriteCommentButton } from './writeCommentButton';

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

    return (
      <Fragment>
        <Fragment>
          <WriteCommentButton ref={writeCommentRef} onPress={handleOnReplyPress} />
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={VALUE.map((val) => intl.formatMessage({ id: `comment_filter.${val}` }))}
            defaultText={intl.formatMessage({ id: `comment_filter.${VALUE[0]}` })}
            onDropdownSelect={(selectedIndex) =>
              _handleOnDropdownSelect(COMMENT_FILTER[selectedIndex], selectedIndex)
            }
            selectedOptionIndex={selectedOptionIndex}
          />
          <View>
            <Comments
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
          </View>
        </Fragment>
      </Fragment>
    );
  },
);

export default CommentsDisplayView;
