import React, { useState, Fragment } from 'react';
import { View } from 'react-native';
import { injectIntl } from 'react-intl';

// Components
import { FilterBar } from '../../filterBar';
import { Comments } from '../../comments';
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';

// Styles
import styles from './commentDisplayStyles';

const CommentsDisplayView = ({
  author,
  commentCount,
  fetchPost,
  intl,
  permlink,
  mainAuthor,
  handleOnVotersPress,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('trending');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  const _handleOnDropdownSelect = (option, index) => {
    setSelectedFilter(option);
    setSelectedOptionIndex(index);
  };

  return (
    <Fragment>
      {commentCount > 0 && (
        <Fragment>
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={VALUE.map(val => intl.formatMessage({ id: `comment_filter.${val}` }))}
            defaultText={intl.formatMessage({ id: `comment_filter.${VALUE[0]}` })}
            onDropdownSelect={selectedIndex =>
              _handleOnDropdownSelect(COMMENT_FILTER[selectedIndex], selectedIndex)
            }
            selectedOptionIndex={selectedOptionIndex}
          />
          <View style={styles.commentWrapper}>
            <Comments
              selectedFilter={selectedFilter}
              fetchPost={fetchPost}
              commentCount={commentCount}
              author={author}
              permlink={permlink}
              mainAuthor={mainAuthor}
              handleOnVotersPress={handleOnVotersPress}
            />
          </View>
        </Fragment>
      )}
    </Fragment>
  );
};

export default injectIntl(CommentsDisplayView);
