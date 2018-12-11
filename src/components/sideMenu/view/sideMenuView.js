import React, { Component } from 'react';
import {
  View, Text, ImageBackground, FlatList, TouchableOpacity,
} from 'react-native';
import { injectIntl } from 'react-intl';
import LinearGradient from 'react-native-linear-gradient';

// Components
import { Icon, IconButton } from '../..';
import { UserAvatar } from '../../userAvatar';

// Constants
import { default as MENU } from '../../../constants/sideMenuItems';

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
    const { isLoggedIn } = this.props;

    if (isLoggedIn !== nextProps.isLoggedIn) {
      this._setMenuItems(nextProps.isLoggedIn);
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

  render() {
    const {
      navigateToRoute, currentAccount, isLoggedIn, switchAccount, intl,
    } = this.props;
    const { menuItems, isAddAccountIconActive } = this.state;

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
                />
                <View style={styles.userInfoWrapper}>
                  {currentAccount.display_name && (
                    <Text style={styles.username}>{currentAccount.display_name}</Text>
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
                    size={15}
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
            renderItem={item => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  if (item.item.route) {
                    navigateToRoute(item.item.route);
                  } else {
                    switchAccount(item.item.name);
                  }
                }}
              >
                <View style={styles.itemWrapper}>
                  {item.item.icon && (
                    <Icon
                      iconType="FontAwesome"
                      style={styles.listItemIcon}
                      name={item.item.icon}
                    />
                  )}
                  {item.item.username && (
                    <UserAvatar username={item.item.username} style={styles.otherUserAvatar} />
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
      </View>
    );
  }
}

export default injectIntl(SideMenuView);
