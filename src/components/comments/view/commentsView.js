import React, { Component } from 'react';
import { View } from 'react-native';

// Constants

// Components
import { FilterBar } from '../../filterBar';
import { PostHeaderDescription } from '../../postElements';

// Styles
import styles from './commentStyles';

class CommentsView extends Component {
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
    const { comments } = this.props;

    return (
      <View>
        <FilterBar
          dropdownIconName="md-arrow-dropdown"
          options={['NEW COMMENTS', 'VOTES', 'REPLIES', 'MENTIONS', 'FOLLOWS', 'REBLOGS']}
          defaultText="NEW COMMENTS"
          onDropdownSelect={this._handleOnDropdownSelect}
        />
        {comments
          && comments.map((comment, i) => (
            <PostHeaderDescription
              date={comment.created}
              name={comment.author}
              reputation={comment.author_reputation}
              avatar={comment.avatar}
              size={32}
            />
          ))}
      </View>
    );
  }
}

export default CommentsView;
