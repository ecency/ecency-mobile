import React, { PureComponent } from 'react';
import { View, FlatList } from 'react-native';

// Constants

// Components
import CommentLine from './commentLineView';

class CommentsView extends PureComponent {
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

  _keyExtractor = item => item.permlink;

  render() {
    const { comments } = this.props;

    return (
      <View>
        {!!comments && (
          <FlatList
            data={comments}
            keyExtractor={this._keyExtractor}
            renderItem={({ item, index }) => (
              <CommentLine item={item} index={index} {...this.props} />
            )}
          />
        )}
      </View>
    );
  }
}

export default CommentsView;
