import React, { Component, useEffect, useState } from 'react';
import { View, Text, ImageBackground, FlatList, TouchableOpacity } from 'react-native';
import { injectIntl } from 'react-intl';
import LinearGradient from 'react-native-linear-gradient';
import ActionSheet from 'react-native-actionsheet';
import VersionNumber from 'react-native-version-number';
import { getStorageType } from '../../../realm/realm';

// Components
import { IconButton } from '../../iconButton';
import { Icon } from '../../icon';
import { UserAvatar } from '../../userAvatar';

// Constants
import MENU from '../../../constants/sideMenuItems';

// Styles
import styles from './sideMenuStyles';

// Images
const SIDE_MENU_BACKGROUND = require('../../../assets/side_menu_background.png');

const SideMenuView = ({
  currentAccount,
  isLoggedIn,
  intl,
  handleLogout,
  accounts,
  switchAccount,
  navigateToRoute,
}) => {
  const [menuItems, setMenuItems] = useState(
    isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS,
  );
  const [isAddAccountIconActive, setIsAddAccountIconActive] = useState(false);
  const [storageT, setStorageT] = useState('R');

  // Component Life Cycles
  useEffect(() => {
    let _isMounted = false;
    getStorageType().then(item => {
      if (!_isMounted) {
        setStorageT(item);
      }
    });
  }, []);

  // Component Functions

  const _handleOnPressAddAccountIcon = () => {
    if (!isAddAccountIconActive) {
      setMenuItems(accounts);
    } else {
      setMenuItems(isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS);
    }

    setIsAddAccountIconActive(!isAddAccountIconActive);
  };

  const _handleOnMenuItemPress = item => {
    if (item.id === 'logout') {
      // eslint-disable-next-line react/no-this-in-sfc
      this.ActionSheet.show();
      return;
    }

    if (item.route) {
      navigateToRoute(item.route);
    } else {
      switchAccount(item.username);
    }
  };

  useEffect(() => {
    if (isAddAccountIconActive) {
      setMenuItems(accounts);
    }

    setMenuItems(isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS);

    return () => {};
  }, []);

  //UNSAFE_componentWillReceiveProps(nextProps) {}

  const { buildVersion, appVersion } = VersionNumber;

  return (
    <View style={styles.container}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={['#357ce6', '#2d5aa0']}
        style={styles.headerView}
      >
        <ImageBackground source={SIDE_MENU_BACKGROUND} style={styles.imageBackground}>
          {isLoggedIn && (
            <View style={styles.headerContentWrapper}>
              <UserAvatar username={currentAccount.name} size="xl" style={styles.userAvatar} />
              <View style={styles.userInfoWrapper}>
                {currentAccount.display_name && (
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.username}>
                    {currentAccount.display_name}
                  </Text>
                )}
                <Text style={styles.usernick}>{`@${currentAccount.name}`}</Text>
              </View>

              <View style={styles.userInfoWrapper}>
                <IconButton
                  name={isAddAccountIconActive ? 'ios-arrow-dropup' : 'ios-add-circle-outline'}
                  color="white"
                  size={20}
                  onPress={_handleOnPressAddAccountIcon}
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
                _handleOnMenuItemPress(item.item);
              }}
            >
              <View style={styles.itemWrapper}>
                {item.item.icon && (
                  <Icon
                    iconType="MaterialCommunityIcons"
                    style={styles.listItemIcon}
                    name={item.item.icon}
                  />
                )}
                {item.item.username && (
                  <UserAvatar
                    noAction
                    username={item.item.username}
                    style={styles.otherUserAvatar}
                  />
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
      <Text style={styles.versionText}>{`v${appVersion}, ${buildVersion}${storageT}`}</Text>
      <ActionSheet
        // eslint-disable-next-line react/no-this-in-sfc
        ref={o => (this.ActionSheet = o)}
        options={[
          intl.formatMessage({ id: 'side_menu.logout' }),
          intl.formatMessage({ id: 'side_menu.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'side_menu.logout_text' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={index => {
          index === 0 ? handleLogout() : null;
        }}
      />
    </View>
  );
};

export default injectIntl(SideMenuView);
