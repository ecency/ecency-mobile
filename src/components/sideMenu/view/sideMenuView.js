import React, { Component } from 'react';
import {
  View, Text, ImageBackground, FlatList, TouchableOpacity,
} from 'react-native';
import { injectIntl } from 'react-intl';
import LinearGradient from 'react-native-linear-gradient';
import ActionSheet from 'react-native-actionsheet';
import VersionNumber from 'react-native-version-number';

// Components
import { IconButton } from '../../buttons';
import { Icon } from '../../icon';
import { UserAvatar } from '../../userAvatar';

// Constants
import { default as MENU } from '../../../constants/sideMenuItems';
import PackageJson from '../../../../package.json';

// Styles
import styles from './sideMenuStyles';

// Images
const SIDE_MENU_BACKGROUND = require('../../../assets/side_menu_background.png');

class SideMenuView extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      menuItems: props.isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS,
      isAddAccountIconActive: false,
    };
  }

  // Component Life Cycles

  componentWillReceiveProps(nextProps) {
    const { isLoggedIn, accounts } = this.props;
    const { isAddAccountIconActive } = this.state;

    if (isLoggedIn !== nextProps.isLoggedIn) {
      this._setMenuItems(nextProps.isLoggedIn);
    }

    if (accounts !== nextProps.accounts && isAddAccountIconActive) {
      this.setState({ menuItems: nextProps.accounts });
    }
  }

  // Component Functions

  _handleOnPressAddAccountIcon = () => {
    const { isLoggedIn, accounts } = this.props;
    const { isAddAccountIconActive } = this.state;

    if (!isAddAccountIconActive) {
      this.setState({ menuItems: accounts });
    } else {
      this._setMenuItems(isLoggedIn);
    }

    this.setState({ isAddAccountIconActive: !isAddAccountIconActive });
  };

  _setMenuItems = (isLoggedIn) => {
    this.setState({
      menuItems: isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS,
    });
  };

  _handleOnMenuItemPress = (item) => {
    const { navigateToRoute, switchAccount } = this.props;

    if (item.id === 'logout') {
      this.ActionSheet.show();
      return;
    }

    if (item.route) {
      navigateToRoute(item.route);
    } else {
      switchAccount(item.username);
    }
  };

  render() {
    const {
      currentAccount, isLoggedIn, intl, handleLogout,
    } = this.props;
    const { menuItems, isAddAccountIconActive } = this.state;
    const { version } = PackageJson;
    const { buildVersion } = VersionNumber;

    return (
      <View style={styles.container}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['#357ce6', '#2d5aa0']}
          style={styles.headerView}
        >
          <ImageBackground
            source={SIDE_MENU_BACKGROUND}
            style={{ width: '100%', height: '100%', flexDirection: 'row' }}
          >
            {isLoggedIn && (
              <View style={styles.headerContentWrapper}>
                <UserAvatar
                  username={currentAccount.username}
                  size="xl"
                  style={styles.userAvatar}
                  noAction
                />
                <View style={styles.userInfoWrapper}>
                  {currentAccount.display_name && (
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.username}>{currentAccount.display_name}</Text>
                  )}
                  <Text style={styles.usernick}>{`@${currentAccount.name}`}</Text>
                </View>

                <View style={styles.userInfoWrapper}>
                  <IconButton
                    name={isAddAccountIconActive ? 'arrow-dropup' : 'add-circle-outline'}
                    androidName={
                      isAddAccountIconActive ? 'md-arrow-dropup' : 'ios-add-circle-outline'
                    }
                    color="white"
                    size={20}
                    handleOnPress={() => this._handleOnPressAddAccountIcon()}
                    style={styles.addAccountIcon}
                  />
                </View>
              </View>
            )}
          </ImageBackground>
        </LinearGradient>
        <View style={styles.contentView}>
          <FlatList
            data={menuItems}
            keyExtractor={item => item.id}
            renderItem={item => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  this._handleOnMenuItemPress(item.item);
                }}
              >
                <View style={styles.itemWrapper}>
                  {item.item.icon && (
                    <Icon
                      iconType="MaterialIcons"
                      style={styles.listItemIcon}
                      name={item.item.icon}
                    />
                  )}
                  {item.item.username && (
                    <UserAvatar noAction username={item.item.username} style={styles.otherUserAvatar} />
                  )}
                  <Text style={styles.listItemText}>
                    {isAddAccountIconActive
                      ? menuItems[menuItems.length - 1].id === item.item.id
                        ? intl.formatMessage({ id: `side_menu.${item.item.id}` })
                        : item.item.name
                      : intl.formatMessage({ id: `side_menu.${item.item.id}` })}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        <Text style={styles.versionText}>{`v${version}, ${buildVersion}`}</Text>
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          options={[intl.formatMessage({ id: 'side_menu.logout' }), intl.formatMessage({ id: 'side_menu.cancel' })]}
          title={intl.formatMessage({ id: 'side_menu.logout_text' })}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={(index) => {
            index === 0 ? handleLogout() : null;
          }}
        />
      </View>
    );
  }
}

export default injectIntl(SideMenuView);
