import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { toggleAccountsBottomSheet } from '../../../redux/actions/uiAction';

import { UserAvatar, Icon } from '../../index';

import styles from './accountsBottomSheetStyles';

const data = [
  {
    name: 'deneme',
    username: 'furkankilic',
    isCurrentAccount: true,
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
  {
    name: 'deneme',
    username: 'furkankilic',
  },
];

const AccountsBottomSheet = forwardRef(({ accounts, currentAccount }, ref) => {
  const dispatch = useDispatch();
  const bottomSheetModalRef = useRef();
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => ['35%'], []);

  useImperativeHandle(ref, () => ({
    showAccountsBottomSheet() {
      bottomSheetModalRef.current?.present();
    },
    closeAccountsBottomSheet() {
      _handleDismissBottomSheet();
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
            onPress={_handleDismissBottomSheet}
          />
        )}
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={() => console.log('dismiss')}
      >
        <BottomSheetFlatList
          data={data}
          scrollEnabled
          keyExtractor={(i) => i}
          renderItem={({ item }) => _renderAccountTile(item)}
          //contentContainerStyle={styles.contentContainer}
        />
        <View style={{ paddingBottom: insets.bottom }} />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
});

export default AccountsBottomSheet;
