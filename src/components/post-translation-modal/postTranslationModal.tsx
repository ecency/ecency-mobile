import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Alert, Share, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet from 'react-native-actions-sheet';

// Component

import styles from './postTranslationModalStyle';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

interface Props {}

const PostTranslationModal = ({}: Props, ref) => {
  const intl = useIntl();
  const bottomSheetModalRef = useRef<ActionSheet | null>(null);

  const [content, setContent] = useState<any>(null);
  const [translatedPost, setTranslatedPost] = useState('');

  useImperativeHandle(ref, () => ({
    show: (_content) => {
      if (!_content) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.something_wrong' }),
          'Post content not passed for viewing post options',
        );
        return;
      }

      if (bottomSheetModalRef.current) {
        console.log('_content : ', _content);

        setContent(_content);
        bottomSheetModalRef.current.show();
      }
    },
  }));

  useEffect(() => {
    if (content && content.body) {
      console.log('content.body : ', content.body);
    }
  }, [content]);

  return (
    <ActionSheet
      ref={bottomSheetModalRef}
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.listContainer}>
        <Text>text</Text>
      </View>
    </ActionSheet>
  );
};

export default forwardRef(PostTranslationModal);
