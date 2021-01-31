import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  BottomSheetModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

    const snapPoints = [accounts.length <= 4 ? accounts.length * 60 + 150 : 405];

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
        {currentAccount.name === item.username && (
          <Icon iconType="AntDesign" name="checkcircle" style={styles.checkIcon} size={24} />
        )}
      </TouchableOpacity>
    );

    const renderHandleComponent = () => (
      <View style={styles.handleComponent}>
        <View style={styles.handle} />
      </View>
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
          handleComponent={renderHandleComponent}
        >
          <View style={styles.accountsModal}>
            <BottomSheetFlatList
              data={accounts}
              scrollEnabled
              keyExtractor={(item, index) => `${item.name}${item.username}${index}`}
              renderItem={({ item }) => _renderAccountTile(item)}
              //contentContainerStyle={styles.contentContainer}
            />
            <Separator style={styles.separator} />
            <View style={{ paddingBottom: insets.bottom }}>
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
          </View>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  },
);

export default AccountsBottomSheet;
