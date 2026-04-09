import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import * as Progress from 'react-native-progress';
import { createThumbnail, Thumbnail } from 'react-native-create-thumbnail';
import ImagePicker, { Options, Video as VideoType } from 'react-native-image-crop-picker';
import Video from 'react-native-video';

// Components
import { FlashList } from '@shopify/flash-list';
import styles from '../styles/speakUploaderModal.styles';
import { MainButton } from '../../mainButton';
import Icon from '../../icon';
import { TextButton } from '../../buttons';

// Hooks
import {
  useThreeSpeakEmbedUpload,
  useSetVideoThumbnail,
} from '../../../providers/queries/editorQueries/speakQueries';
import { isMediaPickerCancellation, reportMediaPickerError } from '../../../utils/mediaPickerError';
import { signImage } from '../../../providers/hive/hive';
import { uploadImage } from '../../../providers/ecency/ecency';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount, selectPin } from '../../../redux/selectors';

interface Props {
  setIsUploading: (flag: boolean) => void;
  isUploading: boolean;
  /** Called with the embed URL and optional thumbnail URL after successful upload. */
  onVideoUploaded?: (embedUrl: string, thumbnailUrl?: string) => void;
  /** If true, enforces 60-second max duration for Shorts/Waves. */
  isShort?: boolean;
}

export const SpeakUploaderModal = forwardRef(
  ({ setIsUploading, isUploading, onVideoUploaded, isShort = false }: Props, ref) => {
    const intl = useIntl();
    const [visible, setVisible] = useState(false);
    const dim = useWindowDimensions();

    const currentAccount = useAppSelector(selectCurrentAccount);
    const pinCode = useAppSelector(selectPin);

    const { mutateAsync: uploadVideo, completed: uploadProgress } = useThreeSpeakEmbedUpload();
    const { mutateAsync: setThumbnail } = useSetVideoThumbnail();

    const [selectedThumb, setSelectedThumb] = useState<Thumbnail | null>(null);
    const [availableThumbs, setAvailableThumbs] = useState<Thumbnail[]>([]);

    const [selectedVido, setSelectedVideo] = useState<VideoType | null>(null);

    useImperativeHandle(ref, () => ({
      showUploader: async (_video: VideoType) => {
        setVisible(true);

        if (_video) {
          if (!_video.filename) {
            _video.filename = _video.path.split('/').pop();
          }

          // Enforce 60s limit for shorts
          if (isShort && _video.duration && _video.duration > 60000) {
            Alert.alert(
              intl.formatMessage({ id: 'alert.notice' }),
              intl.formatMessage({ id: 'video-upload.error-too-long-short' }),
            );
            setVisible(false);
            return;
          }

          setSelectedVideo(_video);
          setSelectedThumb(null);

          // Generate 5 thumbnails from video
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
      },
    }));

    const _startUpload = async () => {
      if (!selectedVido || isUploading) {
        return;
      }

      setIsUploading(true);

      try {
        // Upload video via new 3Speak embed architecture
        const result = await uploadVideo({
          media: selectedVido,
          isShort,
        });

        // Upload thumbnail to Ecency image server, then set on 3Speak (fire-and-forget)
        const thumbToUse = selectedThumb || availableThumbs[0];
        let uploadedThumbUrl: string | undefined;

        if (thumbToUse?.path && result.permlink) {
          try {
            const thumbMedia = {
              path: thumbToUse.path,
              mime: 'image/jpeg',
              filename: 'thumbnail.jpg',
              size: 0,
            };
            const sign = await signImage(thumbMedia, currentAccount, pinCode);
            const imgRes = await uploadImage(thumbMedia, currentAccount.name, sign);
            if (imgRes?.url) {
              uploadedThumbUrl = imgRes.url;
              setThumbnail({
                permlink: result.permlink,
                thumbnailUrl: imgRes.url,
              }).catch((err) =>
                console.warn('3Speak thumbnail metadata failed (non-critical):', err),
              );
            }
          } catch (err) {
            console.warn('Thumbnail upload failed (non-critical):', err);
          }
        }

        setVisible(false);

        // Notify parent with the embed URL and uploaded thumbnail URL
        onVideoUploaded?.(result.embedUrl, uploadedThumbUrl);
      } catch (err: any) {
        // Show user-visible error if the mutation didn't already toast
        const msg = err?.message || 'Upload failed';
        if (!msg.includes('[3Speak]')) {
          Alert.alert(intl.formatMessage({ id: 'alert.fail' }), msg);
        }
      }

      setIsUploading(false);
    };

    const _onClosePress = () => {
      setVisible(false);
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
          if (isMediaPickerCancellation(e)) {
            return;
          }
          reportMediaPickerError(e, {
            feature: 'speak-uploader',
            action: 'openPicker',
            mediaType: 'photo',
          });
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
          <Text style={styles.label}>
            {intl.formatMessage({ id: 'uploads_modal.select_thumb' })}
          </Text>
          <FlashList
            horizontal={true}
            ListHeaderComponent={_renderHeader}
            data={availableThumbs.slice()}
            renderItem={_renderThumbItem}
            keyExtractor={(item, index) => item.path + index}
          />
        </View>
      );
    };

    const _renderUploadProgress = () => {
      return (
        <Progress.Bar
          style={{ alignSelf: 'center', marginBottom: 12, borderWidth: 0 }}
          progress={uploadProgress / 100}
          color={EStyleSheet.value('$primaryBlue')}
          unfilledColor={EStyleSheet.value('$primaryLightBackground')}
          width={dim.width - 40}
          indeterminate={uploadProgress >= 99 && isUploading}
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
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={_onClosePress}
      >
        <View style={styles.sheetContent}>{_renderFormContent()}</View>
      </Modal>
    );
  },
);
