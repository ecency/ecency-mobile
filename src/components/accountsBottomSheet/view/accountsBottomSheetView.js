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

import styles from './accountsBottomSheetStyles';

const data = [
  {
    name: 'example',
    username: 'furkankilic',
    isCurrentAccount: true,
  },
  {
    name: 'example',
    username: 'furkankilic',
  },
];

const AccountsBottomSheet = forwardRef(({ accounts, currentAccount }, ref) => {
  const dispatch = useDispatch();
  const bottomSheetModalRef = useRef();
  const insets = useSafeAreaInsets();
  const intl = useIntl();

  const snapPoints = useMemo(() => [200], []);

  //const calculateHeight = () => data.length * 50 + 160;

  useImperativeHandle(ref, () => ({
    showAccountsBottomSheet() {
      bottomSheetModalRef.current?.present();
    },
  }));

  const _handleDismissBottomSheet = () => {
    bottomSheetModalRef.current?.dismiss();
    dispatch(toggleAccountsBottomSheet());
  };

  //_handlePressAccountTile(item)
  const _renderAccountTile = (item) => (
    <TouchableOpacity style={styles.accountTile} onPress={() => {}}>
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
    <BottomSheetModalProvider>
      <BottomSheetModal
        backdropComponent={() => (
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={bottomSheetModalRef.current?.dismiss}
            // when call the onPress, it calls onDismiss.
          />
        )}
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={_handleDismissBottomSheet}
        shouldMeasureContentHeight={true}
      >
        <BottomSheetFlatList
          data={data}
          scrollEnabled
          keyExtractor={(i) => i}
          renderItem={({ item }) => _renderAccountTile(item)}
          //contentContainerStyle={styles.contentContainer}
        />
        <Separator style={styles.separator} />
        <View style={{ paddingBottom: insets.bottom }}>
          <View style={styles.buttonContainer}>
            <TextButton
              text={intl.formatMessage({ id: 'side_menu.create_a_new_account' })}
              textStyle={styles.textButton}
              //onPress={() => navigateToRoute(ROUTES.SCREENS.REGISTER)}
            />
          </View>
          <Separator style={styles.separator} />
          <View style={styles.buttonContainer}>
            <TextButton
              text={intl.formatMessage({ id: 'side_menu.add_an_existing_account' })}
              textStyle={styles.textButton}
              //onPress={() => navigateToRoute(ROUTES.SCREENS.LOGIN)}
            />
          </View>
          <Separator style={styles.separator} />
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
});

export default AccountsBottomSheet;
