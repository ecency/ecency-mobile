import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, Platform, Share, Alert, PermissionsAndroid } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import ImageViewing from 'react-native-image-viewing';
import { useIntl } from 'react-intl';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Image as ExpoImage } from 'expo-image';
import RNFetchBlob from 'rn-fetch-blob';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from '../iconButton';
import styles from './imageViewer.styles';

// eslint-disable-next-line no-empty-pattern
export const ImageViewer = forwardRef(({}, ref) => {
  const intl = useIntl();
  // intl.formatMessage({ id: 'post.copy_link' }),
  // intl.formatMessage({ id: 'post.gallery_mode' }),
  // intl.formatMessage({ id: 'post.save_to_local' }),

  const [visible, setVisible] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const insets = useSafeAreaInsets();

  useImperativeHandle(ref, () => ({
    show(selectedUrl: string, _imageUrls: string[]) {
      setImageUrls(_imageUrls);
      setSelectedIndex(_imageUrls.indexOf(selectedUrl));
      setVisible(true);

      if (Platform.OS === 'ios') {
        ExpoImage.prefetch(_imageUrls, 'memory');
      }
    },
  }));

  const checkAndroidPermission = async () => {
    try {
      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      await PermissionsAndroid.request(permission);
      Promise.resolve();
    } catch (error) {
      Promise.reject(error);
    }
  };

  const _getImageExt = (url: string, contentType?: string): string => {
    // Try URL extension first (preserves gif, png, webp, etc.)
    try {
      const match = new URL(url).pathname.match(/\.(jpe?g|png|gif|webp|avif|bmp)$/i);
      if (match) return match[1].toLowerCase().replace('jpeg', 'jpg');
    } catch (_e) {
      /* ignore */
    }

    // Try content-type header
    if (contentType) {
      const typeMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };
      const type = contentType.split(';')[0].trim().toLowerCase();
      if (typeMap[type]) return typeMap[type];
    }

    return 'jpg';
  };

  const _downloadImage = async (uri: string) => {
    const res = await RNFetchBlob.config({
      fileCache: true,
    }).fetch('GET', uri);

    const { status, headers } = res.info();
    if (status != 200) {
      throw new Error(`Download failed with status ${status}`);
    }

    const contentType = headers['Content-Type'] || headers['content-type'] || '';
    const ext = _getImageExt(uri, contentType);
    const srcPath = res.path();
    const destPath = `${srcPath}.${ext}`;
    await RNFetchBlob.fs.mv(srcPath, destPath);
    return destPath;
  };

  const _onSavePress = async (index: number) => {
    try {
      if (Platform.OS === 'android') {
        await checkAndroidPermission();
      }

      const url = imageUrls[index];
      const imagePath = await _downloadImage(url);

      if (!imagePath) {
        return;
      }

      const uri = `file://${imagePath}`;
      await CameraRoll.saveAsset(uri, { album: 'Ecency' });

      Alert.alert(intl.formatMessage({ id: 'post.image_saved' }));
    } catch (err: any) {
      console.warn('fail to save image', err?.message);
      Alert.alert(intl.formatMessage({ id: 'alert.fail' }), err?.message);
    }
  };

  const _onCopyPress = (index: number) => {
    const url = imageUrls[index];
    Share.share(Platform.OS === 'ios' ? { url } : { message: url });
  };

  const _renderIconButton = (iconName: string, onPress: () => void) => (
    <IconButton
      name={iconName}
      iconType="MaterialCommunityIcons"
      color={EStyleSheet.value('$iconColor')}
      style={{ marginHorizontal: 4 }}
      size={24}
      onPress={onPress}
    />
  );

  const _renderImageViewerHeader = (imageIndex: number) => {
    return (
      <View
        style={{
          marginTop: Platform.select({ ios: insets.top, android: 16 }),
        }}
      >
        <View style={styles.imageViewerHeaderContainer}>
          <View style={styles.leftContainer}>
            {_renderIconButton('close', _onCloseImageViewer)}
            <Text style={styles.imageGalleryHeaderText}>
              {`Preview (${imageIndex + 1}/${imageUrls.length})`}
            </Text>
          </View>

          <View style={styles.rightContainer}>
            {_renderIconButton('content-copy', () => _onCopyPress(imageIndex))}
            {_renderIconButton('download', () => _onSavePress(imageIndex))}
          </View>
        </View>
      </View>
    );
  };

  const _onCloseImageViewer = () => {
    setVisible(false);
    setImageUrls([]);
  };

  return (
    // <SafeAreaView>
    <ImageViewing
      images={imageUrls.map((url) => ({ uri: url }))}
      imageIndex={selectedIndex}
      visible={visible}
      animationType="slide"
      swipeToCloseEnabled
      doubleTapScale={1.5}
      onRequestClose={_onCloseImageViewer}
      HeaderComponent={(data) => _renderImageViewerHeader(data.imageIndex)}
    />
    // </SafeAreaView>
  );
});
