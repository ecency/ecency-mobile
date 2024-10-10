import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';

// Services and Actions
import ActionSheet from 'react-native-actions-sheet';
import { View } from 'react-native';
import Comments from '../../comments';
import styles from '../styles/commentsModal.styles';

/**
 * NOTE: this comments modal is in draft stage, right now rendering of 
 * content works great but actions do not respond as expected since most 
 * of action reply on modals and action sheets which causes a conflict with 
 * rendering comments in existing modal, similarly some actions require navigation
 * to different screen while comments modal is still visible on screen.
 */

export const CommentsModal = forwardRef((_, ref) => {
  const bottomSheetModalRef = useRef<ActionSheet | null>(null);

  const [comments, setComments] = useState<any>(null);

  useImperativeHandle(ref, () => ({
    show: (_comments) => {
      if (bottomSheetModalRef.current) {
        setComments(_comments);
        bottomSheetModalRef.current.show();
      }
    },
  }));

  const _renderContent = (
    <View style={{ height: '100%', width: '100%' }}>
      <Comments
        comments={comments}
        fetchPost={() => {
          console.log('implement fetch if required');
        }}
      />
    </View>
  );

  return (
    <ActionSheet
      ref={bottomSheetModalRef}
      gestureEnabled={true}
      hideUnderlay={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
    >
      {_renderContent}
    </ActionSheet>
  );
});
