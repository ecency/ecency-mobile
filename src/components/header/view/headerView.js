import React, { Component } from 'react';
import {
  View, StatusBar, Text, SafeAreaView, TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

// Utils
import { getReputation } from '../../../utils/user';

// Components
import { IconButton } from '../../iconButton';
import { Search } from '../..';

// Styles
import styles from './headerStyles';

const DEFAULT_IMAGE = require('../../../assets/avatar_default.png');

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
    if (Object.keys(currentAccount).length === 0) return currentAccount.name;
    if (Object.keys(currentAccount.about).length === 0) return currentAccount.name;
    if (Object.keys(currentAccount.about.profile).length !== 0) {
      return currentAccount.about.profile.name;
    }
    return currentAccount.name;
  };

  _getUserAvatar = () => {
    const { currentAccount } = this.props;
    if (Object.keys(currentAccount).length === 0) return DEFAULT_IMAGE;
    if (Object.keys(currentAccount.about).length === 0) return DEFAULT_IMAGE;
    if (Object.keys(currentAccount.about.profile).length !== 0) {
      return { uri: currentAccount.about.profile.profile_image };
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
    } = this.props;
    const _name = this._getNameOfUser();
    const _reputation = getReputation(currentAccount.reputation);

    return (
      <SafeAreaView style={[styles.container, isReverse && styles.containerReverse]}>
        <StatusBar hidden={hideStatusBar} translucent />
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={() => !isReverse && handleOpenDrawer()}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={['#2d5aa0', '#357ce6']}
            style={[
              styles.avatarButtonWrapper,
              isReverse ? styles.avatarButtonWrapperReverse : styles.avatarDefault,
            ]}
          >
            <View>
              <FastImage
                style={styles.avatar}
                source={this._getUserAvatar()}
                defaultSource={DEFAULT_IMAGE}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        {currentAccount && currentAccount.name ? (
          <View style={styles.titleWrapper}>
            {_name && <Text style={styles.title}>{_name}</Text>}
            <Text style={styles.subTitle}>
              @
              {currentAccount.name}
              {`(${_reputation})`}
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
