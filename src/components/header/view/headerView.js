import React, { Component } from 'react';
import {
  View, StatusBar, Text, SafeAreaView, TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';

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
      handleOpenDrawer,
      handleOnPressBackButton,
      hideStatusBar,
      isReverse,
      currentAccount,
      isLoggedIn,
    } = this.props;
    const avatar = currentAccount && currentAccount.about && currentAccount.about.profile.profile_image;
    const name = currentAccount && currentAccount.about && currentAccount.about.profile.name;

    return (
      <SafeAreaView style={[styles.container, isReverse && styles.containerReverse]}>
        <StatusBar hidden={hideStatusBar} translucent />
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={() => !isReverse && handleOpenDrawer()}
        >
          <View
            style={[
              styles.avatarButtonWrapper,
              isReverse ? styles.avatarButtonWrapperReverse : styles.avatarDefault,
            ]}
          >
            <FastImage style={styles.avatar} source={{ uri: avatar }} defaultSource={DEFAULT_IMAGE} />
          </View>
        </TouchableOpacity>
        {currentAccount && currentAccount.name ? (
          <View style={styles.titleWrapper}>
           { name && <Text style={styles.title}>{name}</Text> }
            <Text style={styles.subTitle}>
              @
              {currentAccount.name}
              {`(${getReputation(currentAccount.reputation)})`}
            </Text>
          </View>
        ) : (
          <View style={styles.titleWrapper}>
            <Text style={styles.noAuthTitle}>Log in to customize your feed</Text>
          </View>
        )}
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
