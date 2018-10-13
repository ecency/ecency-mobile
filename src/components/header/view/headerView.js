import React, { Component } from 'react';
import {
  View, StatusBar, Text, SafeAreaView, TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
// Constants

// Components

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
    const { avatar, handleOpenDrawer, hideStatusBar } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden={hideStatusBar} translucent />
        <TouchableOpacity onPress={() => handleOpenDrawer()}>
          <View style={styles.avatarWrapper}>
            <FastImage style={styles.avatar} source={avatar} defaultSource={DEFAULT_IMAGE} />
          </View>
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}> eSteem Project </Text>
          <Text style={styles.subTitle}> @u-e (63)</Text>
        </View>
      </SafeAreaView>
    );
  }
}

export default HeaderView;
