import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { PostHeaderDescription } from '../../postElements';
import { getTimeFromNow } from '../../../utils/time';

// Constants

// Components

// Defaults
import DEFAULT_IMAGE from '../../../assets/no_image.png';

// Styles
import styles from './postListItemStyles';

class PostListItemView extends Component {
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
    const {
      title, summary, mainTag, username, reputation, created, image,
    } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <PostHeaderDescription
            date={getTimeFromNow(created)}
            name={username}
            reputation={reputation}
            size={32}
            tag={mainTag}
          />
          <View style={styles.rightItem}>
            <Text>icon</Text>
          </View>
        </View>
        <View style={styles.body}>
          <TouchableOpacity style={[{ flexDirection: 'column' }]}>
            <FastImage source={image} style={styles.image} defaultSource={DEFAULT_IMAGE} />
            <View style={[styles.postDescripton]}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.summary}>{summary}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default PostListItemView;
