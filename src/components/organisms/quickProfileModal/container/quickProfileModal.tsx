import React, { useEffect, useRef } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { QuickProfileContent } from '../children/quickProfileContent';
import styles from '../children/quickProfileStyles';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { hideProfileModal } from '../../../../redux/actions/uiAction';

export const QuickProfileModal = () => {
  const sheetModalRef = useRef<ActionSheet>();
  const dispatch = useAppDispatch();

  const profileModalUsername = useAppSelector((state) => state.ui.profileModalUsername);

  useEffect(() => {
    if (profileModalUsername) {
      sheetModalRef.current.show();
    } else {
      sheetModalRef.current.hide();
    }
  }, [profileModalUsername]);

  const _onClose = () => {
    dispatch(hideProfileModal());
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      onClose={_onClose}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
    >
      <QuickProfileContent username={profileModalUsername} onClose={_onClose} />
    </ActionSheet>
  );
};
