import React, { useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from 'react-native-fast-image';

import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { extractImageUrls } from '../../../utils/editor';
import styles from './styles';

export interface ThumbSelectionModalProps {
  thumbUrl: string;
  onThumbSelection: (index: number) => void;
}

const ThumbSelectionModal = ({ onThumbSelection, thumbUrl }: ThumbSelectionModalProps, ref) => {
  const intl = useIntl();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const sheetModalRef = useRef<ActionSheet>();

  // CALLBACK_METHODS
  useImperativeHandle(ref, () => ({
    show: (postBody: string) => {
      console.log('Showing action modal');

      const urls = extractImageUrls({ body: postBody });

      if (urls.length < 2) {
        console.log('Skipping modal show as post images are less than 2');
        Alert.alert(intl.formatMessage({ id: 'editor.two_thumbs_required' }));
        onThumbSelection(0);
        return;
      }

      setImageUrls(urls);
      sheetModalRef.current?.show();
    },
  }));

  const _onSelection = (index: number) => {
    onThumbSelection(index);
    sheetModalRef.current?.hide();
  };

  // VIEW_RENDERERS
  const _renderImageItem = ({ item, index }: { item: string; index: number }) => {
    const _onPress = () => {
      _onSelection(index);
    };

    const selectedStyle = item === thumbUrl ? styles.selectedStyle : null;

    return (
      <TouchableOpacity onPress={() => _onPress()}>
        <FastImage
          source={{ uri: item }}
          style={{ ...styles.thumbStyle, ...selectedStyle }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const _renderContent = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'editor.select_thumb' })}</Text>
        <FlatList
          data={imageUrls}
          renderItem={_renderImageItem}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal={true}
          contentContainerStyle={styles.listContainer}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={false}
      containerStyle={styles.sheetContent}
      indicatorStyle={{ backgroundColor: EStyleSheet.value('$primaryWhiteLightBackground') }}
    >
      {_renderContent()}
    </ActionSheet>
  );
};

export default forwardRef(ThumbSelectionModal);
