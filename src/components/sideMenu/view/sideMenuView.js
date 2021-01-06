import React, { Component, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { injectIntl, useIntl } from 'react-intl';
import LinearGradient from 'react-native-linear-gradient';
import ActionSheet from 'react-native-actionsheet';
import VersionNumber from 'react-native-version-number';
import { getStorageType } from '../../../realm/realm';
import Modal from '../../modal';

// Components
import { Icon } from '../../icon';
import { UserAvatar } from '../../userAvatar';
import Separator from '../../basicUIElements/view/separator/separatorView';
import { TextWithIcon } from '../../basicUIElements';

// Constants
import MENU from '../../../constants/sideMenuItems';
import { default as ROUTES } from '../../../constants/routeNames';

//Utils
import { getVotingPower } from '../../../utils/manaBar';

// Styles
import styles from './sideMenuStyles';
import { TextButton } from '../../buttons';

// Images
const SIDE_MENU_BACKGROUND = require('../../../assets/side_menu_background.png');

const SideMenuView = ({
  currentAccount,
  isLoggedIn,
  handleLogout,
  accounts,
  switchAccount,
  navigateToRoute,
}) => {
  const intl = useIntl();
  const ActionSheetRef = useRef(null);

  const [menuItems, setMenuItems] = useState(
    isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS,
  );
  const [storageT, setStorageT] = useState('R');
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [upower, setUpower] = useState(0);

  // Component Life Cycles
  useEffect(() => {
    let _isMounted = false;
    getStorageType().then((item) => {
      if (!_isMounted) {
        setStorageT(item);
      }
    });
    return () => {
      _isMounted = true;
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setUpower(getVotingPower(currentAccount).toFixed(1));
    }
  });

  // Component Functions
  const _handleOnMenuItemPress = (item) => {
    if (item.id === 'logout') {
      ActionSheetRef.current.show();
      return;
    }

    navigateToRoute(item.route);
  };

  const _toggleAccountsModalOpen = () => {
    setIsAccountsModalOpen(!isAccountsModalOpen);
  };

  useEffect(() => {
    setMenuItems(isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS);
  }, [isLoggedIn]);

  const { buildVersion, appVersion } = VersionNumber;

  let _username = currentAccount.name;
  /*if (currentAccount.display_name && currentAccount.display_name.length > 8) {
    currentAccount.display_name = currentAccount.display_name.slice(0, 8);
  }

  if (currentAccount.name && currentAccount.name.length > 8) {
    _username = currentAccount.name.slice(0, 8);
  }*/

  const _renderItem = (item) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        _handleOnMenuItemPress(item.item);
      }}
    >
      <View style={styles.itemWrapper}>
        {item.item.icon && (
          <Icon iconType="SimpleLineIcons" style={styles.listItemIcon} name={item.item.icon} />
        )}
        {item.item.username && (
          <UserAvatar noAction username={item.item.username} style={styles.otherUserAvatar} />
        )}
        <Text style={styles.listItemText}>
          {intl.formatMessage({ id: `side_menu.${item.item.id}` })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const _handlePressAccountTile = (item) => {
    if (!item.isCurrentAccount) {
      switchAccount(item);
    }

    setIsAccountsModalOpen(false);
  };

  const _renderAccountTile = (item) => (
    <TouchableOpacity style={styles.accountTile} onPress={() => _handlePressAccountTile(item)}>
      <View style={styles.avatarAndNameContainer}>
        <UserAvatar username={item.username} />
        <View style={styles.nameContainer}>
          {item.displayName && <Text style={styles.displayName}>{item.displayName}</Text>}
          <Text style={styles.name}>{item.name}</Text>
        </View>
      </View>
      {item.isCurrentAccount && (
        <Icon iconType="AntDesign" name="checkcircle" style={styles.checkIcon} size={24} />
      )}
    </TouchableOpacity>
  );

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
              <View
                style={[
                  styles.userInfoWrapper,
                  currentAccount.display_name && { alignSelf: 'flex-start' },
                ]}
              >
                {currentAccount.display_name && (
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.username}>
                    {currentAccount.display_name}
                  </Text>
                )}
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.usernick}>
                  {`@${_username}`}
                </Text>
                <TextWithIcon
                  iconName="expand-less"
                  iconSize={30}
                  iconType="MaterialIcons"
                  text={`${upower}%`}
                  textStyle={styles.vpText}
                />
              </View>

              <TouchableOpacity style={styles.iconWrapper} onPress={_toggleAccountsModalOpen}>
                <Icon
                  iconType="SimpleLineIcons"
                  style={styles.optionIcon}
                  name="options"
                  color="white"
                  size={16}
                />
              </TouchableOpacity>
            </View>
          )}
        </ImageBackground>
      </LinearGradient>
      <View style={styles.contentView}>
        <FlatList data={menuItems} keyExtractor={(item) => item.id} renderItem={_renderItem} />
      </View>
      <Text style={styles.versionText}>{`v${appVersion}, ${buildVersion}${storageT}`}</Text>
      <ActionSheet
        ref={ActionSheetRef}
        options={[
          intl.formatMessage({ id: 'side_menu.logout' }),
          intl.formatMessage({ id: 'side_menu.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'side_menu.logout_text' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          index === 0 ? handleLogout() : null;
        }}
      />
      <Modal
        isFullScreen={false}
        isOpen={isAccountsModalOpen}
        isBottomModal
        isTransparent
        isRadius
        coverScreen={false}
        title={intl.formatMessage({ id: 'side_menu.accounts' })}
        onBackdropPress={_toggleAccountsModalOpen}
      >
        <SafeAreaView style={styles.accountModal}>
          <Separator style={styles.separator} />
          <FlatList
            data={accounts}
            ItemSeparatorComponent={() => <Separator style={styles.separator} />}
            renderItem={({ item }) => _renderAccountTile(item)}
            scrollEnabled
          />
          <Separator style={styles.separator} />
          <View style={styles.buttonContainer}>
            <TextButton
              text={intl.formatMessage({ id: 'side_menu.create_a_new_account' })}
              textStyle={styles.textButton}
              onPress={() => navigateToRoute(ROUTES.SCREENS.REGISTER)}
            />
          </View>
          <Separator style={styles.separator} />
          <View style={styles.buttonContainer}>
            <TextButton
              text={intl.formatMessage({ id: 'side_menu.add_an_existing_account' })}
              textStyle={styles.textButton}
              onPress={() => navigateToRoute(ROUTES.SCREENS.LOGIN)}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default injectIntl(SideMenuView);
