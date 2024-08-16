import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet from 'react-native-actions-sheet';
import { get } from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';
import { setPrevLoggedInUsers } from '../../../redux/actions/accountAction';

import { UserAvatar, Icon, Separator } from '../../index';

import { default as ROUTES } from '../../../constants/routeNames';

import styles from './accountsBottomSheetStyles';

const AccountsBottomSheet = forwardRef(
  (
    {
      accounts,
      currentAccount,
      navigateToRoute,
      switchAccount,
      onClose,
      prevLoggedInUsers,
      dispatch,
      isLoggedIn,
    },
    ref,
  ) => {
    const bottomSheetModalRef = useRef();
    const userList = useRef();
    const insets = useSafeAreaInsets();
    const intl = useIntl();

    useImperativeHandle(ref, () => ({
      showAccountsBottomSheet() {
        bottomSheetModalRef.current?.show();
      },
      closeAccountsBottomSheet() {
        bottomSheetModalRef.current?.hide();
      },
    }));

    const _renderAccountTile = ({ item }) => {
      return (
        <TouchableOpacity style={styles.accountTile} onPress={() => switchAccount(item)}>
          <View style={styles.avatarAndNameContainer}>
            <UserAvatar username={item.username} />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{`@${item.username}`}</Text>
            </View>
          </View>
          {currentAccount.name === item.username && (
            <Icon iconType="AntDesign" name="checkcircle" style={styles.checkIcon} size={24} />
          )}
        </TouchableOpacity>
      );
    };

    const _handlePressLoggedOutAccountTile = (item) => {
      if (item && item?.isLoggedOut === true) {
        navigateToRoute(ROUTES.SCREENS.LOGIN, { username: item?.username || '' });
      }
    };

    const _renderLoggedOutAccountTile = ({ item }) => {
      if (
        item &&
        item?.isLoggedOut === true &&
        accounts?.findIndex((el) => get(el, 'local.username', '') === item?.username) === -1
      ) {
        return (
          <View style={styles.loggedOutAccountTileContainer}>
            <TouchableOpacity
              style={styles.loggedOutAccountTile}
              onPress={() => _handlePressLoggedOutAccountTile(item)}
            >
              <View style={styles.avatarAndNameContainer}>
                <UserAvatar username={item.username} />
                <View style={styles.nameContainer}>
                  <Text style={styles.name}>{`@${item.username}`}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <Icon
              iconType="AntDesign"
              name="close"
              style={styles.deleteIcon}
              size={24}
              onPress={() => _removePrevLoggedInUsersList(item?.username || '')}
            />
          </View>
        );
      }
    };
    const _renderPrevLoggedInUsersList = () =>
      // render only if user is logged out
      prevLoggedInUsers &&
      prevLoggedInUsers?.length > 0 &&
      prevLoggedInUsers?.filter((el) => el?.isLoggedOut === true).length > 0 ? (
        <>
          {!!isLoggedIn && <Separator style={styles.separator} />}
          <Text style={styles.textButton}>
            {intl.formatMessage({ id: 'side_menu.logged_out_accounts' })}
          </Text>
          <FlatList
            data={prevLoggedInUsers}
            ref={userList}
            scrollEnabled
            keyExtractor={(item, index) => `${item.name || item.username}${index}`}
            renderItem={_renderLoggedOutAccountTile}
            nestedScrollEnabled={true}
            onScrollEndDrag={() => bottomSheetModalRef.current?.handleChildScrollEnd()}
            onScrollAnimationEnd={() => bottomSheetModalRef.current?.handleChildScrollEnd()}
            onMomentumScrollEnd={() => bottomSheetModalRef.current?.handleChildScrollEnd()}
          />
        </>
      ) : null;

    // update previously loggedin users list,
    const _removePrevLoggedInUsersList = (username) => {
      if (prevLoggedInUsers && prevLoggedInUsers.length > 0) {
        const userIndex = prevLoggedInUsers.findIndex((el) => el?.username === username);
        if (userIndex > -1) {
          const updatedPrevLoggedInUsers = prevLoggedInUsers?.slice();
          updatedPrevLoggedInUsers?.splice(userIndex, 1);
          dispatch(setPrevLoggedInUsers(updatedPrevLoggedInUsers));
        }
      } else {
        console.log('user not found in list');
      }
    };

    return (
      <View style={[styles.accountsModal]}>
        <ActionSheet
          ref={bottomSheetModalRef}
          gestureEnabled={true}
          hideUnderlay
          containerStyle={styles.sheetContent}
          indicatorStyle={styles.sheetIndicator}
          onClose={onClose}
        >
          <FlatList
            data={accounts}
            ref={userList}
            scrollEnabled
            keyExtractor={(item, index) => `${item.name || item.username}${index}`}
            renderItem={_renderAccountTile}
            contentContainerStyle={styles.contentContainer}
            nestedScrollEnabled={true}
            onScrollEndDrag={() => bottomSheetModalRef.current?.handleChildScrollEnd()}
            onScrollAnimationEnd={() => bottomSheetModalRef.current?.handleChildScrollEnd()}
            onMomentumScrollEnd={() => bottomSheetModalRef.current?.handleChildScrollEnd()}
          />
          {_renderPrevLoggedInUsersList()}
          <Separator style={styles.separator} />
          <View style={{ paddingBottom: insets.bottom + 16 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigateToRoute(ROUTES.SCREENS.REGISTER)}
            >
              <View>
                <Text style={styles.textButton}>
                  {intl.formatMessage({ id: 'side_menu.create_a_new_account' })}
                </Text>
              </View>
            </TouchableOpacity>
            <Separator style={styles.separator} />
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigateToRoute(ROUTES.SCREENS.LOGIN)}
            >
              <View>
                <Text style={styles.textButton}>
                  {intl.formatMessage({ id: 'side_menu.add_an_existing_account' })}
                </Text>
              </View>
            </TouchableOpacity>
            <Separator style={styles.separator} />
          </View>
        </ActionSheet>
      </View>
    );
  },
);

export default AccountsBottomSheet;
