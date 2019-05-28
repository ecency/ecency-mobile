import React, { PureComponent, Fragment } from 'react';
import { View } from 'react-native';
import { injectIntl } from 'react-intl';

// Components
import { FilterBar } from '../../filterBar';
import { Comments } from '../../comments';
import COMMENT_FILTER from '../../../constants/options/comment';

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
      selectedFilter: null,
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnDropdownSelect = (index, option) => {
    this.setState({ selectedFilter: option });
  };

  render() {
    const { author, commentCount, fetchPost, intl, permlink, mainAuthor } = this.props;
    const { selectedFilter } = this.state;

    return (
      <Fragment>
        {commentCount > 0 && (
          <Fragment>
            <FilterBar
              dropdownIconName="arrow-drop-down"
              options={COMMENT_FILTER.map(item =>
                intl.formatMessage({ id: `comment_filter.${item}` }).toUpperCase(),
              )}
              defaultText={intl
                .formatMessage({ id: `comment_filter.${COMMENT_FILTER[0]}` })
                .toUpperCase()}
              onDropdownSelect={this._handleOnDropdownSelect}
            />
            <View style={styles.commentWrapper}>
              <Comments
                selectedFilter={selectedFilter}
                fetchPost={fetchPost}
                commentCount={commentCount}
                author={author}
                permlink={permlink}
                mainAuthor={mainAuthor}
              />
            </View>
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export default injectIntl(CommentsDisplayView);
