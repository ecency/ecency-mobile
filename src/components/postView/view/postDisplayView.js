import React, { Component } from 'react';
import { View, Text } from 'react-native';

// Constants

// Components
import { PostHeaderDescription } from '../../postElements';
// Styles
import styles from './postDisplayStyles';

class PostDisplayView extends Component {
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

  render() {
    // eslint-disable-next-line
    const { content } = this.props;

    // eslint-disable-next-line
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Character Remakes Series</Text>
          <PostHeaderDescription
            date={8 || content.created}
            name={'dunsky' || content.author}
            reputation={67 || content.author_reputation}
            tag={'esteem' || content.category}
            avatar={'' || (content && content.avatar)}
            size={16}
          />
        </View>
      </View>
    );
  }
}

export default PostDisplayView;
