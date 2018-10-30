import React, { Component } from 'react';
import {
  View, StatusBar, Text, SafeAreaView, TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
// Constants

// Utils

import { getReputation } from '../../../utils/user';

// Components
import { IconButton } from '../../iconButton';

// Styles
import styles from './headerStyles';

const DEFAULT_IMAGE = require('../../../assets/esteem.png');

class HeaderView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { boolean }    hideStatusBar                - Can declare status bar is hide or not.
    *
    */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const {
      avatar,
      handleOpenDrawer,
      handleOnPressBackButton,
      hideStatusBar,
      userName,
      isReverse,
      name,
      reputation,
    } = this.props;

    console.log('error', name, userName, reputation, getReputation(reputation));

    return (
      <SafeAreaView style={[styles.container, isReverse && styles.containerReverse]}>
        <StatusBar hidden={hideStatusBar} translucent />
        <TouchableOpacity onPress={() => !isReverse && handleOpenDrawer()}>
          <View
            style={[
              styles.avatarWrapper,
              isReverse ? styles.avatarWrapperReverse : styles.avatarDefault,
            ]}
          >
            <FastImage
              style={styles.avatar}
              source={{ uri: avatar }}
              defaultSource={DEFAULT_IMAGE}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          {name && <Text style={styles.title}>{name}</Text>}
          {userName !== undefined
            && reputation !== undefined && (
              <Text style={styles.subTitle}>
                @
                {userName}
                {`(${getReputation(reputation)})`}
              </Text>
          )}
        </View>
        {isReverse && (
          <View style={styles.backButtonWrapper}>
            <IconButton
              style={styles.backButton}
              iconStyle={styles.backIcon}
              name="md-arrow-back"
              onPress={() => handleOnPressBackButton()}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }
}

export default HeaderView;
