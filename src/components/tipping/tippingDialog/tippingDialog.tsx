import React, { useRef } from 'react';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import TippingDialogContent from './tippingDialogContent';
import { SheetNames } from '../../../navigation/sheets';

const TippingDialog = ({ payload }: SheetProps<SheetNames.TIPPING_DIALOG>) => {
  const modalContentRef = useRef<any>(null);
  const { post, onSuccess } = payload || {};

  const _onClose = () => {
    SheetManager.hide(SheetNames.TIPPING_DIALOG);

    if (modalContentRef.current) {
      modalContentRef.current.handleSheetClose();
    }
  };

  return (
    <ActionSheet
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.sheetIndicator}
      defaultOverlayOpacity={0}
      keyboardHandlerEnabled={!(Platform.OS === 'android' && Platform.Version < 35)}
      onClose={_onClose}
    >
      <TippingDialogContent
        ref={modalContentRef}
        post={post}
        onClose={_onClose}
        onSuccess={onSuccess}
      />
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    paddingBottom: 20,
  },
  sheetIndicator: {
    backgroundColor: '$primaryDarkGray',
  },
});

export default TippingDialog;
