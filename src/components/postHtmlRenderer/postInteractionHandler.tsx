import React, { forwardRef, useImperativeHandle, useRef, useState, Fragment } from 'react';
import { PermissionsAndroid, Platform, SafeAreaView, View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import ActionsSheet from 'react-native-actions-sheet';
import ImageView from 'react-native-image-viewing';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
// import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RNFetchBlob from 'rn-fetch-blob';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routeNames';
import { handleDeepLink, toastNotification } from '../../redux/actions/uiAction';
import { writeToClipboard } from '../../utils/clipboard';

import { OptionsModal } from '../atoms';
import VideoPlayer from '../videoPlayer/videoPlayerView';

import { IconButton } from '../buttons';
import styles from './postHtmlRendererStyles';
import { PostTypes } from '../../constants/postTypes';
import { isHiveUri } from '../../utils/hive-uri';

interface PostHtmlInteractionHandlerProps {
  postType?: PostTypes;
}

export const PostHtmlInteractionHandler = forwardRef(
  ({ postType }: PostHtmlInteractionHandlerProps, ref) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const intl = useIntl();

    const actionImage = useRef(null);
    const actionLink = useRef(null);
    const youtubePlayerRef = useRef(null);

    const [postImages, setPostImages] = useState<string[]>([]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const [videoUrl, setVideoUrl] = useState(null);
    const [youtubeVideoId, setYoutubeVideoId] = useState(null);
    const [videoStartTime, setVideoStartTime] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedLink, setSelectedLink] = useState(null);

    useImperativeHandle(ref, () => ({
      handleImagePress: (url: string, postImgUrls: string[]) => {
        setPostImages(postImgUrls);
        setSelectedImage(url);
        if (postType === PostTypes.WAVE) {
          setIsImageModalOpen(true);
        } else {
          actionImage.current?.show();
        }
      },
      handleLinkPress: (url: string) => {
        if (isHiveUri(url)) {
          dispatch(handleDeepLink(url));
        } else {
          setSelectedLink(url);
          actionLink.current?.show();
        }
      },
      handleYoutubePress: (videoId, startTime) => {
        if (videoId && youtubePlayerRef.current) {
          setYoutubeVideoId(videoId);
          setVideoStartTime(startTime);
          youtubePlayerRef.current.show();
        }
      },

      handleVideoPress: (embedUrl) => {
        if (embedUrl && youtubePlayerRef.current) {
          setVideoUrl(embedUrl);
          setVideoStartTime(0);
          youtubePlayerRef.current.show();
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

    const _downloadImage = async (uri) => {
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

    const _saveImage = async (uri) => {
      try {
        if (Platform.OS === 'android') {
          await checkAndroidPermission();
          uri = `file://${await _downloadImage(uri)}`;
        }
        // CameraRoll.saveToCameraRoll(uri)
        //   .then(() => {
        //     dispatch(
        //       toastNotification(
        //         intl.formatMessage({
        //           id: 'post.image_saved',
        //         }),
        //       ),
        //     );
        //   })
        //   .catch(() => {
        //     dispatch(
        //       toastNotification(
        //         intl.formatMessage({
        //           id: 'post.image_saved_error',
        //         }),
        //       ),
        //     );
        //   });
      } catch (error) {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'post.image_saved_error',
            }),
          ),
        );
      }
    };

    const _handleImageOptionPress = (ind) => {
      if (ind === 1) {
        // open gallery mode
        setIsImageModalOpen(true);
        return;
      }
      if (ind === 0) {
        // copy to clipboard
        writeToClipboard(selectedImage).then(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.copied',
              }),
            ),
          );
        });
      }
      // if (ind === 2) {
      //   // save to local
      //   _saveImage(selectedImage);
      // }

      setSelectedImage(null);
    };

    const _handleLinkOptionPress = (ind) => {
      if (ind === 1) {
        // open link
        if (selectedLink) {
          navigation.navigate({
            name: ROUTES.SCREENS.WEB_BROWSER,
            params: {
              url: selectedLink,
            },
            key: selectedLink,
          } as never);
        }
      }
      if (ind === 0) {
        // copy to clipboard
        writeToClipboard(selectedLink).then(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.copied',
              }),
            ),
          );
        });
      }

      setSelectedLink(null);
    };

    const _onCloseImageViewer = () => {
      setIsImageModalOpen(false);
      setSelectedImage(null);
    };

    const _renderImageViewerHeader = (imageIndex) => {
      return (
        <SafeAreaView
          style={{
            marginTop: Platform.select({ ios: 0, android: 25 }),
          }}
        >
          <View style={styles.imageViewerHeaderContainer}>
            <Text style={styles.imageGalleryHeaderText}>{`${imageIndex + 1}/${
              postImages.length
            }`}</Text>
            <IconButton
              name="close"
              color={EStyleSheet.value('$primaryDarkText')}
              buttonStyle={styles.closeIconButton}
              size={20}
              handleOnPress={_onCloseImageViewer}
            />
          </View>
        </SafeAreaView>
      );
    };

    return (
      <Fragment>
        <ImageView
          images={postImages.map((url) => ({ uri: url }))}
          imageIndex={postImages.indexOf(selectedImage)}
          visible={isImageModalOpen}
          animationType="slide"
          swipeToCloseEnabled
          onRequestClose={_onCloseImageViewer}
          HeaderComponent={(imageIndex) => _renderImageViewerHeader(imageIndex.imageIndex)}
        />

        <OptionsModal
          ref={actionImage}
          options={[
            intl.formatMessage({ id: 'post.copy_link' }),
            intl.formatMessage({ id: 'post.gallery_mode' }),
            // intl.formatMessage({ id: 'post.save_to_local' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'post.image' })}
          cancelButtonIndex={2}
          onPress={(index) => {
            _handleImageOptionPress(index);
          }}
        />

        <OptionsModal
          ref={actionLink}
          options={[
            intl.formatMessage({ id: 'post.copy_link' }),
            intl.formatMessage({ id: 'alert.external_link' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'post.link' })}
          cancelButtonIndex={2}
          onPress={(index) => {
            _handleLinkOptionPress(index);
          }}
        />

        <ActionsSheet
          ref={youtubePlayerRef}
          gestureEnabled={true}
          containerStyle={{ backgroundColor: 'black' }}
          indicatorStyle={{ backgroundColor: EStyleSheet.value('$primaryWhiteLightBackground') }}
          onClose={() => {
            setYoutubeVideoId(null);
            setVideoUrl(null);
          }}
        >
          <VideoPlayer
            mode={youtubeVideoId ? 'youtube' : 'uri'}
            youtubeVideoId={youtubeVideoId}
            uri={videoUrl}
            startTime={videoStartTime}
          />
        </ActionsSheet>
      </Fragment>
    );
  },
);
