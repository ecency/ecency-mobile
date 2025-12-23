import React from 'react';
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { TipsListContent } from './tipsListContent';
import { SheetNames } from '../../../navigation/sheets';

const TipsListModal = ({ payload }: SheetProps<SheetNames.TIPS_LIST>) => {
  const { author, permlink } = payload || {};

  return (
    <ActionSheet gestureEnabled containerStyle={styles.sheetContent}>
      <TipsListContent author={author} permlink={permlink} />
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  sheetContent: {
    paddingHorizontal: 12,
    backgroundColor: '$primaryBackgroundColor',
  },
});

export default TipsListModal;
