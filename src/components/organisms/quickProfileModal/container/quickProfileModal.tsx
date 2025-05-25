import React from 'react';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { QuickProfileContent } from '../children/quickProfileContent';
import styles from '../children/quickProfileStyles';
import assert from 'assert';
export const QuickProfileModal = ({payload}:SheetProps<'quick_profile'>) => {

  const username = payload?.username

  if(!username) {
    assert(!!username, 'QuickProfileModal requires a username in payload');
  }

  const _onClose = () => {
    SheetManager.hide('quick_profile');
  };

  return (
    <ActionSheet
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicatorStyle}
    >
      <QuickProfileContent username={username} onClose={_onClose} />
    </ActionSheet>
  );
};
