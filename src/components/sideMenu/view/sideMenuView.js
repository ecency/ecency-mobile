import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, FlatList, TouchableOpacity } from 'react-native';
import { injectIntl, useIntl } from 'react-intl';
import VersionNumber from 'react-native-version-number';
import { isEmpty } from 'lodash';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EStyleSheet from 'react-native-extended-stylesheet';
import { SheetManager } from 'react-native-actions-sheet';
import { getStorageType } from '../../../realm/realm';

// Components
import { Icon } from '../../icon';
import { UserAvatar } from '../../userAvatar';

// Constants
import MENU from '../../../constants/sideMenuItems';
import ROUTES from '../../../constants/routeNames';

// Utils
import { getVotingPower } from '../../../utils/manaBar';

// Styles
import styles from './sideMenuStyles';

// Images
import SIDE_MENU_BACKGROUND from '../../../assets/side_menu_background.png';
import { SheetNames } from '../../../navigation/sheets';

const SideMenuView = ({
  currentAccount,
  isLoggedIn,
  handleLogout,
  navigateToRoute,
  prevLoggedInUsers,
  handleShowAccountsSheet,
}) => {
  const intl = useIntl();
  const insets = useSafeAreaInsets();

  const [menuItems, setMenuItems] = useState(
    isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS,
  );
  const [storageT, setStorageT] = useState('R');
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
    if (isLoggedIn && !isEmpty(currentAccount)) {
      setUpower(getVotingPower(currentAccount).toFixed(1));
    }
  });

  // Component Functions
  const _handleOnMenuItemPress = (item) => {
    if (item.id === 'logout') {
      SheetManager.show(SheetNames.ACTION_MODAL, {
        payload: {
          title: intl.formatMessage({ id: 'side_menu.logout_text' }),
          buttons: [
            {
              text: intl.formatMessage({ id: 'side_menu.cancel' }),
              onPress: () => {
                console.log('cancel pressed');
              },
            },
            {
              text: intl.formatMessage({ id: 'side_menu.logout' }),
              onPress: () => {
                handleLogout();
              },
            },
          ],
        },
      });
      return;
    }

    if (item.id === 'qr') {
      SheetManager.show(SheetNames.QR_SCAN);
      return;
    }

    if (item.id === 'favorites') {
      navigateToRoute({
        name: ROUTES.SCREENS.BOOKMARKS,
        params: {
          showFavorites: true,
        },
      });
      return;
    }

    if (item.id === 'schedules') {
      navigateToRoute({
        name: ROUTES.SCREENS.DRAFTS,
        params: {
          showSchedules: true,
        },
      });
      return;
    }
    // if there is any prevLoggedInUser, show account switch modal
    if (item.id === 'add_account') {
      if (prevLoggedInUsers && prevLoggedInUsers?.length > 0) {
        handleShowAccountsSheet();
      } else {
        navigateToRoute(item.route);
      }
      return;
    }

    navigateToRoute(item.route);
  };

  useEffect(() => {
    setMenuItems(isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS);
  }, [isLoggedIn]);

  const { buildVersion, appVersion } = VersionNumber;

  const _username = currentAccount.name;

  const _renderItem = (item) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        _handleOnMenuItemPress(item.item);
      }}
    >
      <View style={styles.itemWrapper}>
        {item.item.icon && (
          <Icon
            iconType={item.item.iconType ? item.item.iconType : 'SimpleLineIcons'}
            style={styles.listItemIcon}
            name={item.item.icon}
            size={20}
          />
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

  const _renderHeader = () => {
    return (
      <View style={styles.headerView}>
        <ImageBackground source={SIDE_MENU_BACKGROUND} style={styles.imageBackground}>
          {isLoggedIn && (
            <View style={{ ...styles.headerContentWrapper, marginTop: insets.top }}>
              <UserAvatar username={currentAccount.name} size="xl" style={styles.userAvatar} />

              <View style={styles.userInfoWrapper}>
                {currentAccount.display_name && (
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.username}>
                    {currentAccount.display_name}
                  </Text>
                )}
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.usernick}>
                  {`@${_username}`}
                </Text>

                <View style={styles.pwInfoWrapper}>
                  <Icon
                    iconType="MaterialIcons"
                    name="expand-less"
                    color={EStyleSheet.value('$iconColor')}
                    size={18}
                  />
                  <Text style={styles.vpText}>{upower}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.iconWrapper} onPress={handleShowAccountsSheet}>
                <Icon
                  iconType="SimpleLineIcons"
                  style={styles.optionIcon}
                  name="options"
                  color="white"
                  size={14}
                />
              </TouchableOpacity>
            </View>
          )}
        </ImageBackground>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {_renderHeader()}
      <View style={styles.contentView}>
        <FlatList data={menuItems} keyExtractor={(item) => item.id} renderItem={_renderItem} />
      </View>
      <Text style={styles.versionText}>{`v${appVersion}, ${buildVersion}${storageT}`}</Text>
    </SafeAreaView>
  );
};

export default injectIntl(SideMenuView);
