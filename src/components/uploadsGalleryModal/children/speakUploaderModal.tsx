import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
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

const THUMBS_COUNT = 5;
// react-native-image-crop-picker omits duration on some Android paths, fall back so
// timestamps never end up NaN
const FALLBACK_DURATION_MS = 10000;

/**
 * Samples THUMBS_COUNT evenly spread frames from the video. Frames are taken at the middle
 * of each slice rather than at its start, so the very first frame (often black) is skipped.
 * Individual failures are tolerated, a partial strip is better than none.
 */
const _generateThumbs = async (_video: VideoType): Promise<Thumbnail[]> => {
  const _duration =
    typeof _video.duration === 'number' && Number.isFinite(_video.duration) && _video.duration > 0
      ? _video.duration
      : FALLBACK_DURATION_MS;

  const _url = _video.sourceURL || _video.path;
  const _step = _duration / THUMBS_COUNT;
  const _thumbs: Thumbnail[] = [];

  for (let i = 0; i < THUMBS_COUNT; i++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const _thumb = await createThumbnail({
        url: _url,
        timeStamp: Math.round((i + 0.5) * _step),
      });
      _thumbs.push(_thumb);
    } catch (err) {
      console.warn(`Thumbnail generation failed for frame ${i}:`, err);
    }
  }

  return _thumbs;
};

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
    const [isGeneratingThumbs, setIsGeneratingThumbs] = useState(false);
    const generationIdRef = useRef(0);

    useImperativeHandle(ref, () => ({
      showUploader: async (_video: VideoType) => {
        if (_video) {
          if (!_video.filename) {
            _video.filename = _video.path.split('/').pop();
          }

          // Enforce 60s limit for shorts — validate before showing the modal
          if (isShort && _video.duration && _video.duration > 60000) {
            Alert.alert(
              intl.formatMessage({ id: 'alert.notice' }),
              intl.formatMessage({ id: 'video-upload.error-too-long-short' }),
            );
            return;
          }

          // Invalidate any generation still running for a previously selected video, so a
          // slow batch cannot land on top of the frames for this one
          const _generationId = ++generationIdRef.current;

          setVisible(true);
          setSelectedVideo(_video);
          setSelectedThumb(null);
          setAvailableThumbs([]);
          setIsGeneratingThumbs(true);

          try {
            const _thumbs = await _generateThumbs(_video);
            if (_generationId === generationIdRef.current) {
              setAvailableThumbs(_thumbs);
            }
          } finally {
            if (_generationId === generationIdRef.current) {
              setIsGeneratingThumbs(false);
            }
          }
        }
      },
    }));

    // Middle frame is the safest implicit default, opening and closing frames are
    // commonly black or a fade
    const _effectiveThumb = () =>
      selectedThumb || availableThumbs[Math.floor(availableThumbs.length / 2)] || null;

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
        const thumbToUse = _effectiveThumb();
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
        .then((items: any) => {
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
      const _renderThumb = (uri: any, onPress: any) => (
        <TouchableOpacity onPress={onPress} disabled={isUploading}>
          <Image source={uri && { uri }} style={styles.thumbnail} />
        </TouchableOpacity>
      );

      const _renderThumbItem = ({ item }: any) => {
        const _onPress = () => {
          setSelectedThumb(item);
        };

        return _renderThumb(item.path || '', _onPress);
      };

      const _renderHeader = () => (
        <View style={styles.selectedThumbContainer}>
          <>
            {_renderThumb(_effectiveThumb()?.path || '', _handleOpenImagePicker)}
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
            isDisable={isUploading || isGeneratingThumbs}
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
