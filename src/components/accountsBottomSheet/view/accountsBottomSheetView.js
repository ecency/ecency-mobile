import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { toggleAccountsBottomSheet } from '../../../redux/actions/uiAction';

import { UserAvatar, Icon, TextButton, Separator } from '../../index';

import { default as ROUTES } from '../../../constants/routeNames';

import styles from './accountsBottomSheetStyles';
import { switchAccount } from '../../../providers/hive/auth';

const AccountsBottomSheet = forwardRef(
  ({ accounts, currentAccount, navigateToRoute, switchAccount }, ref) => {
    const dispatch = useDispatch();
    const bottomSheetModalRef = useRef();
    const insets = useSafeAreaInsets();
    const intl = useIntl();

    const snapPoints = useMemo(() => [accounts.length <= 4 ? accounts.length * 60 + 150 : 405], []);

    useImperativeHandle(ref, () => ({
      showAccountsBottomSheet() {
        bottomSheetModalRef.current?.present();
      },
      closeAccountsBottomSheet() {
        _handleCloseBottomSheet();
      },
    }));

    const _handleCloseBottomSheet = () => {
      bottomSheetModalRef.current?.dismiss();
    };

    const _handleDispatchDismissBottomSheet = () => {
      dispatch(toggleAccountsBottomSheet());
    };

    //_handlePressAccountTile(item)
    const _renderAccountTile = (item) => (
      <TouchableOpacity style={styles.accountTile} onPress={() => switchAccount(item)}>
        <View style={styles.avatarAndNameContainer}>
          <UserAvatar username={item.username} />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{`@${item.username}`}</Text>
          </View>
        </View>
        {currentAccount.name === item.name && (
          <Icon iconType="AntDesign" name="checkcircle" style={styles.checkIcon} size={24} />
        )}
      </TouchableOpacity>
    );

    return (
      <BottomSheetModalProvider>
        <BottomSheetModal
          backdropComponent={() => (
            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={_handleCloseBottomSheet}
            />
          )}
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          onDismiss={_handleDispatchDismissBottomSheet}
          shouldMeasureContentHeight={true}
        >
          <BottomSheetFlatList
            data={accounts}
            scrollEnabled
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => _renderAccountTile(item)}
            //contentContainerStyle={styles.contentContainer}
          />
          <Separator style={styles.separator} />
          <View style={{ paddingBottom: insets.bottom }}>
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
            <Separator style={styles.separator} />
          </View>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  },
);

export default AccountsBottomSheet;
