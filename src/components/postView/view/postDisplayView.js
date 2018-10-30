import React, { Component, Fragment } from 'react';
import { View, Text, ScrollView } from 'react-native';

// Constants

// Components
import { PostHeaderDescription, PostBody, Tags } from '../../postElements';
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

  render() {
    const { post, handleOnUserPress } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scroll}>
          <View style={styles.header}>
            {!post ? (
              <PostPlaceHolder />
            ) : (
              <Fragment>
                <Text style={styles.title}>{post.title}</Text>
                <PostHeaderDescription
                  handleOnUserPress={handleOnUserPress}
                  date={post.created}
                  name={post.author}
                  reputation={post.author_reputation}
                  tag={post.category}
                  avatar={post.avatar}
                  size={16}
                />
                {post
                  && post.body && <PostBody handleOnUserPress={handleOnUserPress} body={post.body} />}
                <View style={styles.footer}>
                  <Tags tags={post.json_metadata && post.json_metadata.tags} />
                  <Text style={styles.footerText}>
                    Posted by
                    {' '}
                    <Text style={styles.footerName}>{post.author}</Text>
                    {' '}
                    {post.created}
                  </Text>
                </View>
              </Fragment>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default PostDisplayView;
