import React, { Component } from 'react';
import {
  View, StatusBar, Text, SafeAreaView, TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { injectIntl } from 'react-intl';

// Utils
import { getReputation } from '../../../utils/user';

// Components
import { SearchModal } from '../../searchModal';
import { IconButton } from '../../iconButton';

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
    this.state = {
      isSearchModalOpen: false,
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleOnCloseSearch = () => {
    this.setState({ isSearchModalOpen: false });
  };

  render() {
    const {
      handleOpenDrawer,
      handleOnPressBackButton,
      hideStatusBar,
      isReverse,
      currentAccount,
      intl,
      isLoginDone,
    } = this.props;
    const { isSearchModalOpen } = this.state;
    const _reputation = getReputation(currentAccount.reputation);
    const _avatar = currentAccount.profile_image
      ? { uri: currentAccount.profile_image }
      : DEFAULT_IMAGE;
    return (
      <SafeAreaView style={[styles.container, isReverse && styles.containerReverse]}>
        {/* <StatusBar style={ { height: 20}} hidden={hideStatusBar} translucent /> */}
        <SearchModal
          placeholder={intl.formatMessage({
            id: 'header.search',
          })}
          isOpen={isSearchModalOpen}
          handleOnClose={this._handleOnCloseSearch}
        />
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
            <FastImage style={styles.avatar} source={_avatar} defaultSource={DEFAULT_IMAGE} />
          </LinearGradient>
        </TouchableOpacity>
        {currentAccount && currentAccount.name ? (
          <View style={styles.titleWrapper}>
            {currentAccount.display_name && (
              <Text style={styles.title}>{currentAccount.display_name}</Text>
            )}
            <Text style={styles.subTitle}>
              @
              {currentAccount.name}
              {`(${_reputation})`}
            </Text>
          </View>
        ) : (
          <View style={styles.titleWrapper}>
            {isLoginDone && (
              <Text style={styles.noAuthTitle}>
                {intl.formatMessage({
                  id: 'header.title',
                })}
              </Text>
            )}
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

        {!isReverse && (
          <View
            style={{
              alignItems: 'flex-end',
              justifyContent: 'center',
              flex: 1,
              marginRight: 16,
            }}
          >
            <IconButton
              style={styles.searchButton}
              iconStyle={styles.backIcon}
              name="md-search"
              onPress={() => this.setState({ isSearchModalOpen: true })}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }
}

export default injectIntl(HeaderView);
