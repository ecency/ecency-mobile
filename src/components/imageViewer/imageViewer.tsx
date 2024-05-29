import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, Platform, SafeAreaView, Share, Alert } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import ImageViewing from 'react-native-image-viewing';
import { useIntl } from 'react-intl';
import { PermissionsAndroid } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Image as ExpoImage } from 'expo-image';
import RNFetchBlob from 'rn-fetch-blob';
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

  const _downloadImage = async (uri: string) => {
    return RNFetchBlob.config({
      fileCache: true,
      appendExt: 'jpg',
    })
      .fetch('GET', uri)
      .then((res) => {
        const { status } = res.info();

        if (status == 200) {
          return res.path();
        } else {
          Promise.reject();
        }
      })
      .catch((errorMessage) => {
        Promise.reject(errorMessage);
      });
  };

  const _onSavePress = async (index: number) => {
    try {
      if (Platform.OS === 'android') {
        await checkAndroidPermission();
      }

      const url = imageUrls[index];

      const imagePath = Platform.select({
        ios: await ExpoImage.getCachePathAsync(url),
        android: await _downloadImage(url),
      });

      if (!imagePath) {
        return;
      }

      const uri = `file://${imagePath}`;
      await CameraRoll.saveAsset(uri, { album: 'Ecency' });

      Alert.alert(intl.formatMessage({ id: 'post.image_saved' }));
    } catch (err) {
      console.warn('fail to save image', err.message);
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
      <SafeAreaView
        style={{
          marginTop: Platform.select({ ios: 0, android: 25 }),
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
      </SafeAreaView>
    );
  };

  const _onCloseImageViewer = () => {
    setVisible(false);
    setImageUrls([]);
  };

  return (
    <ImageViewing
      images={imageUrls.map((url) => ({ uri: url }))}
      imageIndex={selectedIndex}
      visible={visible}
      animationType="slide"
      swipeToCloseEnabled
      onRequestClose={_onCloseImageViewer}
      HeaderComponent={(data) => _renderImageViewerHeader(data.imageIndex)}
    />
  );
});
