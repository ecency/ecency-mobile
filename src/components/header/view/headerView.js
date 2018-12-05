import React, { Component } from 'react';
import {
  View, StatusBar, Text, SafeAreaView, TouchableOpacity, Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { injectIntl } from 'react-intl';

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
      avatar,
      displayName,
      handleOnPressBackButton,
      handleOpenDrawer,
      hideStatusBar,
      intl,
      isLoggedIn,
      isLoginDone,
      isReverse,
      reputation,
      userName,
    } = this.props;
    const { isSearchModalOpen } = this.state;

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
            <Image style={styles.avatar} source={avatar} defaultSource={DEFAULT_IMAGE} />
          </LinearGradient>
        </TouchableOpacity>
        {displayName || userName ? (
          <View style={styles.titleWrapper}>
            {displayName && <Text style={styles.title}>{displayName}</Text>}
            <Text style={styles.subTitle}>
              @
              {userName}
              {`(${reputation})`}
            </Text>
          </View>
        ) : (
          <View style={styles.titleWrapper}>
            {isLoginDone && !isLoggedIn && (
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
