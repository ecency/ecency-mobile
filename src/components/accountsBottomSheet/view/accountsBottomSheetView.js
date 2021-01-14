import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import styles from './accountsBottomSheetStyles';

const AccountsBottomSheet = forwardRef((props, ref) => {
  // ref
  const bottomSheetModalRef = useRef();

  // variables
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  useImperativeHandle(ref, () => ({
    showAccountsBottomSheet() {
      bottomSheetModalRef.current?.present();
    },
  }));

  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  // renders
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <View style={styles.contentContainer}>
          <Text>Awesome</Text>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
});

export default AccountsBottomSheet;
