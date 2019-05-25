import React, { Component } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { injectIntl } from 'react-intl';

// Components
import { SearchModal } from '../../searchModal';
import { IconButton } from '../../iconButton';
import { UserAvatar } from '../../userAvatar';
// Styles
import styles from './headerStyles';

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
      displayName,
      handleOnPressBackButton,
      handleOpenDrawer,
      intl,
      isLoggedIn,
      isLoginDone,
      isReverse,
      reputation,
      username,
      isDarkTheme,
    } = this.props;
    const { isSearchModalOpen } = this.state;
    let gredientColor = isDarkTheme ? ['#081c36', '#43638e'] : ['#2d5aa0', '#357ce6'];

    if (isReverse) {
      gredientColor = isDarkTheme ? ['#43638e', '#081c36'] : ['#357ce6', '#2d5aa0'];
    } else {
      gredientColor = isDarkTheme ? ['#081c36', '#43638e'] : ['#2d5aa0', '#357ce6'];
    }

    return (
      <SafeAreaView style={[styles.container, isReverse && styles.containerReverse]}>
        <SearchModal
          placeholder={intl.formatMessage({
            id: 'header.search',
          })}
          isOpen={isSearchModalOpen}
          handleOnClose={this._handleOnCloseSearch}
        />
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={() => handleOpenDrawer()}
          disabled={isReverse}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={gredientColor}
            style={[
              styles.avatarButtonWrapper,
              isReverse ? styles.avatarButtonWrapperReverse : styles.avatarDefault,
            ]}
          >
            <UserAvatar
              noAction
              style={isReverse ? styles.reverseAvatar : styles.avatar}
              username={username}
            />
          </LinearGradient>
        </TouchableOpacity>
        {displayName || username ? (
          <View style={styles.titleWrapper}>
            {displayName && <Text style={styles.title}>{displayName}</Text>}
            <Text style={styles.subTitle}>
              {`@${username}`}
              {reputation && ` (${reputation})`}
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
