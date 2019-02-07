import React, { PureComponent, Fragment } from 'react';
import { View } from 'react-native';

// Components
import { FilterBar } from '../../filterBar';
import { Comments } from '../../comments';

// Styles
import styles from './commentDisplayStyles';

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
  _handleOnDropdownSelect = () => {};

  render() {
    const {
      author, permlink, commentCount, fetchPost,
    } = this.props;
    // TODO: implement comments filtering
    return (
      <Fragment>
        {commentCount > 0 && (
          <Fragment>
            <FilterBar
              dropdownIconName="arrow-drop-down"
              options={['TRENDING']}
              defaultText="TRENDING"
              onDropdownSelect={this._handleOnDropdownSelect}
            />
            <View style={styles.commentWrapper}>
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
