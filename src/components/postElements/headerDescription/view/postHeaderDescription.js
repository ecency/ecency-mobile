import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';

// Components
import { Tag } from '../../../basicUIElements';

// Styles
import styles from './postHeaderDescriptionStyles';

// Constants
const DEFAULT_IMAGE = require('../../../../assets/esteem.png');

class PostHeaderDescription extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const {
      date, avatar, name, reputation, size, tag, handleOnUserPress, tagOnPress,
    } = this.props;

    const _reputationText = `(${reputation})`;
    const _avatar = avatar && { uri: avatar };

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.avatarNameWrapper}
          onPress={() => handleOnUserPress && handleOnUserPress(name)}
        >
          <FastImage
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
            source={_avatar}
            defaultSource={DEFAULT_IMAGE}
          />
          <Text style={styles.name}>{name}</Text>
        </TouchableOpacity>
        <Text style={styles.reputation}>{_reputationText}</Text>
        <TouchableOpacity onPress={() => tagOnPress && tagOnPress()}>
          <Tag isPin value={tag} />
        </TouchableOpacity>
        <Text style={styles.date}>{date}</Text>
      </View>
    );
  }
}

export default PostHeaderDescription;
