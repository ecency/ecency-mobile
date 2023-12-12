import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Video as VideoType } from 'react-native-image-crop-picker';
import Video from 'react-native-video';
import { createThumbnail } from 'react-native-create-thumbnail';
import { useQueryClient } from '@tanstack/react-query';
import ImagePicker, { Options } from 'react-native-image-crop-picker';
import { FlashList } from '@shopify/flash-list';
import * as Progress from 'react-native-progress';
import { useIntl } from 'react-intl';
import styles from '../styles/speakUploaderModal.styles';
import { MainButton } from '../../mainButton';
import { uploadFile, uploadVideoInfo } from '../../../providers/speak/speak';
import { useAppSelector } from '../../../hooks';
import QUERIES from '../../../providers/queries/queryKeys';
import Icon from '../../icon';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import { TextButton } from '../../buttons';

interface Props {
  setIsUploading: (flag: boolean) => void;
  isUploading: boolean;
}

export const SpeakUploaderModal = forwardRef(({ setIsUploading, isUploading }: Props, ref) => {
  const intl = useIntl();
  const sheetModalRef = useRef();

  const queryClient = useQueryClient();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);

  const [selectedThumb, setSelectedThumb] = useState(null);
  const [availableThumbs, setAvailableThumbs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [selectedVido, setSelectedVideo] = useState<VideoType | null>(null);

  useImperativeHandle(ref, () => ({
    showUploader: async (_video: VideoType) => {
      if (sheetModalRef.current) {
        sheetModalRef.current.show();

        if (_video) {
          if (!_video.filename) {
            _video.filename = _video.path.split('/').pop();
          }
          setSelectedVideo(_video);
          setSelectedThumb(null);
          setUploadProgress(0);

          const thumbs = [];
          const _diff = _video.duration / 5;
          for (let i = 0; i < 5; i++) {
            // eslint-disable-next-line no-await-in-loop
            const _thumb = await createThumbnail({
              url: _video.sourceURL || _video.path,
              timeStamp: i * _diff,
            });
            thumbs.push(_thumb);
          }

          setAvailableThumbs(thumbs);
        }
      }
    },
  }));

  const _startUpload = async () => {
    if (!selectedVido || isUploading) {
      return;
    }

    setIsUploading(true);

    try {
      const { filename, size, duration } = selectedVido;

      const _onProgress = (progress) => {
        console.log('Upload progress', progress);
        setUploadProgress(progress);
      };

      const videoId = await uploadFile(selectedVido, _onProgress);

      let thumbId: any = '';
      if (selectedThumb) {
        thumbId = await uploadFile(selectedThumb);
      }

      console.log('updating video information', videoId, thumbId);

      const response = await uploadVideoInfo(
        currentAccount,
        pinHash,
        filename,
        size,
        videoId,
        thumbId,
        duration,
      );

      queryClient.invalidateQueries([QUERIES.MEDIA.GET_VIDEOS]);

      if (sheetModalRef.current) {
        sheetModalRef.current.hide();
      }

      console.log('response after updating video information', response);
    } catch (err) {
      console.warn('Video upload failed', err);
    }

    setIsUploading(false);
  };

  const _onClosePress = () => {
    sheetModalRef.current?.hide();
  };

  const _handleOpenImagePicker = () => {
    const _options: Options = {
      includeBase64: true,
      mediaType: 'photo',
      smartAlbums: ['UserLibrary', 'Favorites', 'PhotoStream', 'Panoramas', 'Bursts'],
    };

    ImagePicker.openPicker(_options)
      .then((items) => {
        if (items && !Array.isArray(items)) {
          items = [items];
        }
        setSelectedThumb(items[0]);
      })
      .catch((e) => {
        Alert.alert('Fail', `Thumb selection failed, ${e.message}`);
      });
  };

  const _renderThumbSelection = () => {
    const _renderThumb = (uri, onPress) => (
      <TouchableOpacity onPress={onPress} disabled={isUploading}>
        <Image source={uri && { uri }} style={styles.thumbnail} />
      </TouchableOpacity>
    );

    const _renderThumbItem = ({ item }) => {
      const _onPress = () => {
        setSelectedThumb(item);
      };

      return _renderThumb(item.path || '', _onPress);
    };

    const _renderHeader = () => (
      <View style={styles.selectedThumbContainer}>
        <>
          {_renderThumb(selectedThumb?.path || '', _handleOpenImagePicker)}
          <Icon
            iconType="MaterialCommunityIcons"
            style={{ position: 'absolute', top: 16, left: 8 }}
            name="pencil"
            color={EStyleSheet.value('$iconColor')}
            size={20}
          />
        </>

        <View style={styles.thumbSeparator} />
      </View>
    );

    return (
      <View style={styles.imageContainer}>
        <Text style={styles.label}>{intl.formatMessage({ id: 'uploads_modal.select_thumb' })}</Text>
        <FlashList
          horizontal={true}
          ListHeaderComponent={_renderHeader}
          data={availableThumbs.slice()}
          renderItem={_renderThumbItem}
          keyExtractor={(item, index) => item.path + index}
          estimatedItemSize={128}
        />
      </View>
    );
  };

  const _renderUploadProgress = () => {
    return (
      <Progress.Bar
        style={{ alignSelf: 'center', marginBottom: 12, borderWidth: 0 }}
        progress={uploadProgress}
        color={EStyleSheet.value('$primaryBlue')}
        unfilledColor={EStyleSheet.value('$primaryLightBackground')}
        width={getWindowDimensions().width - 40}
        indeterminate={uploadProgress === 1 && isUploading}
      />
    );
  };

  const _renderActionPanel = () => {
    return (
      <View style={styles.actionPanel}>
        <TextButton
          text={intl.formatMessage({ id: 'alert.close' })}
          onPress={_onClosePress}
          textStyle={styles.btnTxtClose}
          style={styles.btnClose}
        />
        <MainButton
          style={{}}
          onPress={_startUpload}
          text={intl.formatMessage({
            id: `uploads_modal.${isUploading ? 'uploading' : 'start_upload'}`,
          })}
          isDisable={isUploading}
        />
      </View>
    );
  };

  const _renderFormContent = () => {
    return (
      <View style={styles.contentContainer}>
        {!!selectedVido && (
          <Video
            source={{
              uri: selectedVido?.sourceURL || selectedVido?.path,
            }}
            repeat={true}
            resizeMode="contain"
            fullscreen={false}
            paused={isUploading}
            style={styles.mediaPlayer}
            volume={0}
          />
        )}

        {_renderThumbSelection()}
        {_renderUploadProgress()}
        {_renderActionPanel()}
      </View>
    );
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={true}
      closeOnTouchBackdrop={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.sheetIndicator}
    >
      {_renderFormContent()}
    </ActionSheet>
  );
});
