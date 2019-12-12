import React, { PureComponent, Fragment } from 'react';
import { View } from 'react-native';
import { injectIntl } from 'react-intl';

// Components
import { FilterBar } from '../../filterBar';
import { Comments } from '../../comments';
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';

// Styles
import styles from './commentDisplayStyles';

class CommentsDisplayView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      selectedFilter: 'trending',
      selectedOptionIndex: 0,
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnDropdownSelect = (option, index) => {
    this.setState({ selectedFilter: option, selectedOptionIndex: index });
  };

  render() {
    const {
      author,
      commentCount,
      fetchPost,
      intl,
      permlink,
      mainAuthor,
      handleOnVotersPress,
    } = this.props;
    const { selectedFilter, selectedOptionIndex } = this.state;
    return (
      <Fragment>
        {commentCount > 0 && (
          <Fragment>
            <FilterBar
              dropdownIconName="arrow-drop-down"
              options={VALUE.map(val => intl.formatMessage({ id: `comment_filter.${val}` }))}
              defaultText={intl.formatMessage({ id: `comment_filter.${VALUE[0]}` })}
              onDropdownSelect={selectedIndex =>
                this._handleOnDropdownSelect(COMMENT_FILTER[selectedIndex], selectedIndex)
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
  }
}

export default injectIntl(CommentsDisplayView);
