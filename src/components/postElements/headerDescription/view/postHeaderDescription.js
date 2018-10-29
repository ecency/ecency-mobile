import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';

// Components
import { Chip } from '../../../basicUIElements';

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
      date, avatar, name, reputation, size, tag, profileOnPress, tagOnPress,
    } = this.props;

    const _reputationText = `(${reputation})`;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.avatarNameWrapper}
          onPress={() => profileOnPress && profileOnPress()}
        >
          <FastImage
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
            source={{ uri: avatar }}
            defaultSource={DEFAULT_IMAGE}
          />
          <Text style={styles.name}>{name}</Text>
        </TouchableOpacity>
        <Text style={styles.reputation}>{_reputationText}</Text>
        <TouchableOpacity onPress={() => tagOnPress && tagOnPress()}>
          <Chip isPin editable={false} multiline={false} value={tag} />
        </TouchableOpacity>
        <Text style={styles.date}>{date}</Text>
      </View>
    );
  }
}

export default PostHeaderDescription;
