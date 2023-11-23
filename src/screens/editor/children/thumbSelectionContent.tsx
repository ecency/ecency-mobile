import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { FlatList } from 'react-native-gesture-handler';
import ESStyleSheet from 'react-native-extended-stylesheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { extractImageUrls } from '../../../utils/editor';
import styles from './styles';
import { Icon } from '../../../components';

interface ThumbSelectionContentProps {
  body: string;
  thumbUrl: string;
  videoThumbUrls: string[];
  isUploading: boolean;
  onThumbSelection: (url: string) => void;
}

const ThumbSelectionContent = ({
  body,
  thumbUrl,
  videoThumbUrls,
  onThumbSelection,
  isUploading,
}: ThumbSelectionContentProps) => {
  const intl = useIntl();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [needMore, setNeedMore] = useState(true);
  const [thumbIndex, setThumbIndex] = useState(0);

  useEffect(() => {
    const urls = [...extractImageUrls({ body }), ...videoThumbUrls];

    if (urls.length < 2) {
      setNeedMore(true);
      onThumbSelection(urls[0] || '');
      setThumbIndex(0);
      setImageUrls([]);
    } else {
      setNeedMore(false);
      setImageUrls(urls);
    }

    const _urlIndex = urls.indexOf(thumbUrl);
    if (_urlIndex < 0) {
      onThumbSelection(urls[0] || '');
      setThumbIndex(0);
    } else {
      setThumbIndex(_urlIndex);
    }
  }, [body]);

  // VIEW_RENDERERS
  const _renderImageItem = ({ item, index }: { item: string; index: number }) => {
    const _onPress = () => {
      onThumbSelection(item);
      setThumbIndex(index);
    };

    const isSelected = item === thumbUrl && index === thumbIndex;

    return (
      <TouchableOpacity onPress={() => _onPress()}>
        <FastImage source={{ uri: item }} style={styles.thumbStyle} resizeMode="cover" />
        {isSelected && (
          <Animated.View entering={ZoomIn} style={styles.checkContainer}>
            <Icon
              color={EStyleSheet.value('$primaryBlue')}
              iconType="MaterialCommunityIcons"
              name="checkbox-marked-circle"
              size={20}
            />
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  const _renderHeader = () =>
    isUploading && (
      <View style={{ flex: 1, justifyContent: 'center', marginRight: 16 }}>
        <ActivityIndicator color={ESStyleSheet.value('$primaryBlue')} />
      </View>
    );

  return (
    <View style={styles.thumbSelectContainer}>
      <Text style={styles.settingLabel}>{intl.formatMessage({ id: 'editor.select_thumb' })}</Text>
      {needMore ? (
        <Text style={styles.contentLabel}>
          {intl.formatMessage({ id: 'editor.add_more_imgs' })}
        </Text>
      ) : (
        <FlatList
          data={imageUrls}
          renderItem={_renderImageItem}
          ListHeaderComponent={_renderHeader}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal={true}
          contentContainerStyle={styles.listContainer}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ThumbSelectionContent;
