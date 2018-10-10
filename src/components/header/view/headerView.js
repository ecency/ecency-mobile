import React, { Component } from 'react';
import {
  View, StatusBar, Text, SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
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
    const { hideStatusBar, avatar } = this.props;
    // TODO: this can redesign for usage area.
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden={hideStatusBar} translucent />
        <LinearGradient
          start={{ x: 0.0, y: 0.25 }}
          end={{ x: 0.5, y: 1.0 }}
          locations={[0, 0.5, 0.6]}
          colors={['#4c669f', '#3b5998', '#192f6a']}
        >
          <View style={styles.avatarWrapper}>
            <FastImage style={styles.avatar} source={avatar} defaultSource={DEFAULT_IMAGE} />
          </View>
        </LinearGradient>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}> eSteem Project </Text>
          <Text style={styles.subTitle}> @u-e (63)</Text>
        </View>
      </SafeAreaView>
    );
  }
}

export default HeaderView;
