import React, { Component, Fragment } from 'react';
import { View, Text, ScrollView } from 'react-native';

// Constants

// Components
import { PostHeaderDescription, PostBody } from '../../postElements';
import { PostPlaceHolder } from '../../basicUIElements';
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

  _handleScroll = (e) => {
    console.log(e);
  };

  render() {
    const { post } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView onScroll={this._handleScroll}>
          <View style={styles.header}>
            {!post ? (
              <PostPlaceHolder />
            ) : (
              <Fragment>
                <Text style={styles.title}>{post && post.title}</Text>
                <PostHeaderDescription
                  date={post && post.created}
                  name={post && post.author}
                  reputation={post && post.author_reputation}
                  tag={post && post.category}
                  avatar={post && post.avatar}
                  size={16}
                />
              </Fragment>
            )}
          </View>
          <PostBody body={post && post.body} />
        </ScrollView>
      </View>
    );
  }
}

export default PostDisplayView;
