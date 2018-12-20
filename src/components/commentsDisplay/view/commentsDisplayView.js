import React, { PureComponent, Fragment } from 'react';
import { View } from 'react-native';

// Constants

// Components
import { FilterBar } from '../../filterBar';
import { Comments } from '../../comments';

// Styles
// import styles from './commentsDisplayStyles';

class CommentsDisplayView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions
  _handleOnDropdownSelect = () => {
    // alert('This feature not read. Thanks for understanding.');
  };

  render() {
    const {
      author, permlink, commentCount, fetchPost,
    } = this.props;

    return (
      <Fragment>
        {commentCount > 0 && (
          <Fragment>
            <FilterBar
              dropdownIconName="md-arrow-dropdown"
              options={['NEW COMMENTS']}
              defaultText="NEW COMMENTS"
              onDropdownSelect={this._handleOnDropdownSelect}
            />
            <View style={{ padding: 16 }}>
              <Comments
                fetchPost={fetchPost}
                commentCount={commentCount}
                author={author}
                permlink={permlink}
              />
            </View>
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export default CommentsDisplayView;
