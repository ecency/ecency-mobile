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

  _getNameOfUser = () => {
    const { currentAccount } = this.props;
    if (Object.keys(currentAccount).length === 0) return '';
    const jsonMetadata = JSON.parse(currentAccount.json_metadata);
    if (Object.keys(jsonMetadata).length !== 0) {
      return jsonMetadata.profile.name;
    }
    return currentAccount.name;
  };

  _getUserAvatar = () => {
    const { currentAccount } = this.props;
    if (Object.keys(currentAccount).length === 0) return DEFAULT_IMAGE;
    const jsonMetadata = JSON.parse(currentAccount.json_metadata);
    if (Object.keys(jsonMetadata).length !== 0) {
      return { uri: jsonMetadata.profile.profile_image };
    }
    return DEFAULT_IMAGE;
  };

  render() {
    const {
      handleOpenDrawer,
      handleOnPressBackButton,
      hideStatusBar,
      isReverse,
      currentAccount,
      isLoggedIn,
    } = this.props;

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
            <FastImage
              style={styles.avatar}
              source={this._getUserAvatar()}
              defaultSource={DEFAULT_IMAGE}
            />
          </View>
        </TouchableOpacity>
        {isLoggedIn ? (
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{this._getNameOfUser()}</Text>
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
