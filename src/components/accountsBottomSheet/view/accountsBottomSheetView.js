import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlatList } from 'react-native-gesture-handler';

import { UserAvatar, Icon, Separator } from '../../index';

import { default as ROUTES } from '../../../constants/routeNames';

import styles from './accountsBottomSheetStyles';

const AccountsBottomSheet = forwardRef(
  ({ accounts, currentAccount, navigateToRoute, switchAccount, onClose }, ref) => {

    const bottomSheetModalRef = useRef();
    const userList = useRef();
    const insets = useSafeAreaInsets();
    const intl = useIntl();

    useImperativeHandle(ref, () => ({
      showAccountsBottomSheet() {
        bottomSheetModalRef.current?.setModalVisible(true);
      },
      closeAccountsBottomSheet() {
        bottomSheetModalRef.current?.setModalVisible(false);
      },
    }));

    // _handlePressAccountTile(item)
    const _renderAccountTile = ({ item }) => (
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

    return (
      <View style={[styles.accountsModal]}>
        <ActionSheet
          ref={bottomSheetModalRef}
          gestureEnabled={true}
          hideUnderlay
          containerStyle={styles.sheetContent}
          indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
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
          <Separator style={styles.separator} />
          <View style={{ paddingBottom: insets.bottom + 16 }}>
            <TouchableWithoutFeedback
              style={styles.button}
              onPress={() => navigateToRoute(ROUTES.SCREENS.REGISTER)}
            >
              <View>
                <Text style={styles.textButton}>
                  {intl.formatMessage({ id: 'side_menu.create_a_new_account' })}
                </Text>
              </View>
            </TouchableWithoutFeedback>
            <Separator style={styles.separator} />
            <TouchableWithoutFeedback
              style={styles.button}
              onPress={() => navigateToRoute(ROUTES.SCREENS.LOGIN)}
            >
              <View>
                <Text style={styles.textButton}>
                  {intl.formatMessage({ id: 'side_menu.add_an_existing_account' })}
                </Text>
              </View>
            </TouchableWithoutFeedback>
            <Separator style={styles.separator} />
          </View>
        </ActionSheet>
      </View>
    );
  },
);

export default AccountsBottomSheet;
