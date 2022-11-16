import React, { Fragment, useState, useRef } from 'react';
import { Linking, Modal, PermissionsAndroid, Platform, View } from 'react-native';
import { useIntl } from 'react-intl';
import CameraRoll from '@react-native-community/cameraroll';
import RNFetchBlob from 'rn-fetch-blob';
import ImageViewer from 'react-native-image-zoom-viewer';
import ActionsSheetView from 'react-native-actions-sheet';

// import AutoHeightWebView from 'react-native-autoheight-webview';
import EStyleSheet from 'react-native-extended-stylesheet';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import RootNavigation from '../../../../navigation/rootNavigation';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';

import { PostHtmlRenderer, TextButton, VideoPlayer } from '../../..';

// Styles
import styles from './commentBodyStyles';

// Services and Actions
import { writeToClipboard } from '../../../../utils/clipboard';
import { toastNotification } from '../../../../redux/actions/uiAction';

import { OptionsModal } from '../../../atoms';
import { useAppDispatch } from '../../../../hooks';
import { isCommunity } from '../../../../utils/communityValidation';
import { GLOBAL_POST_FILTERS_VALUE } from '../../../../constants/options/filters';
import getWindowDimensions from '../../../../utils/getWindowDimensions';

const WIDTH = getWindowDimensions().width;

const CommentBody = ({
  body,
  handleOnUserPress,
  handleOnPostPress,
  handleOnLongPress,
  created,
  commentDepth,
  reputation = 25,
  isMuted,
}) => {
  const _contentWidth = WIDTH - (40 + 28 + (commentDepth > 2 ? 44 : 0));

  const dispatch = useAppDispatch();

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [revealComment, setRevealComment] = useState(reputation > 0 && !isMuted);
  const [videoUrl, setVideoUrl] = useState(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [videoStartTime, setVideoStartTime] = useState(0);

  const intl = useIntl();
  const actionImage = useRef(null);
  const actionLink = useRef(null);
  const youtubePlayerRef = useRef(null);

  const _onLongPressStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      handleOnLongPress();
    }
  };

  const _showLowComment = () => {
    setRevealComment(true);
  };

  const handleImagePress = (ind) => {
    if (ind === 1) {
      // open gallery mode
      setIsImageModalOpen(true);
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
    if (ind === 2) {
      // save to local
      _saveImage(selectedImage);
    }

    setSelectedImage(null);
  };

  const handleLinkPress = (ind) => {
    if (ind === 1) {
      // open link
      if (selectedLink) {
        RootNavigation.navigate({
          name: ROUTES.SCREENS.WEB_BROWSER,
          params: {
            url: selectedLink,
          },
          key: selectedLink,
        });
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

  const _handleTagPress = (tag: string, filter: string = GLOBAL_POST_FILTERS_VALUE[0]) => {
    if (tag) {
      const name = isCommunity(tag) ? ROUTES.SCREENS.COMMUNITY : ROUTES.SCREENS.TAG_RESULT;
      const key = `${filter}/${tag}`;
      RootNavigation.navigate({
        name,
        params: {
          tag,
          filter,
          key,
        },
      });
    }
  };

  const _handleSetSelectedLink = (link: string) => {
    setSelectedLink(link);
    actionLink.current.show();
  };

  const _handleSetSelectedImage = (imageLink: string, postImgUrls: string[]) => {
    if (postImages.length !== postImgUrls.length) {
      setPostImages(postImgUrls);
    }
    setSelectedImage(imageLink);
    actionImage.current.show();
  };

  const _handleOnPostPress = (permlink, author) => {
    if (handleOnPostPress) {
      handleOnUserPress(permlink, author);
      return;
    }
    if (permlink) {
      RootNavigation.navigate({
        name: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: `@${author}/${permlink}`,
      });
    }
  };

  const _handleOnUserPress = (username) => {
    if (handleOnUserPress) {
      handleOnUserPress(username);
      return;
    }
    if (username) {
      RootNavigation.navigate({
        name: ROUTES.SCREENS.PROFILE,
        params: {
          username,
        },
        key: username,
      });
    } else {
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'post.wrong_link',
          }),
        ),
      );
    }
  };

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
      CameraRoll.saveToCameraRoll(uri)
        .then(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'post.image_saved',
              }),
            ),
          );
        })
        .catch(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'post.image_saved_error',
              }),
            ),
          );
        });
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

  const _handleYoutubePress = (videoId, startTime) => {
    if (videoId && youtubePlayerRef.current) {
      setYoutubeVideoId(videoId);
      setVideoStartTime(startTime);
      youtubePlayerRef.current.setModalVisible(true);
    }
  };

  const _handleVideoPress = (embedUrl) => {
    if (embedUrl && youtubePlayerRef.current) {
      setVideoUrl(embedUrl);
      setVideoStartTime(0);
      youtubePlayerRef.current.setModalVisible(true);
    }
  };

  return (
    <Fragment>
      <Modal key={`mkey-${created.toString()}`} visible={isImageModalOpen} transparent={true}>
        <ImageViewer
          imageUrls={postImages.map((url) => ({ url }))}
          enableSwipeDown
          onCancel={() => setIsImageModalOpen(false)}
          onClick={() => setIsImageModalOpen(false)}
        />
      </Modal>
      <OptionsModal
        ref={actionImage}
        options={[
          intl.formatMessage({ id: 'post.copy_link' }),
          intl.formatMessage({ id: 'post.gallery_mode' }),
          intl.formatMessage({ id: 'post.save_to_local' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'post.image' })}
        cancelButtonIndex={3}
        onPress={(index) => {
          handleImagePress(index);
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
          handleLinkPress(index);
        }}
      />
      {revealComment ? (
        <LongPressGestureHandler onHandlerStateChange={_onLongPressStateChange}>
          <View>
            <PostHtmlRenderer
              contentWidth={_contentWidth}
              body={body}
              isComment={true}
              setSelectedImage={_handleSetSelectedImage}
              setSelectedLink={_handleSetSelectedLink}
              handleOnPostPress={_handleOnPostPress}
              handleOnUserPress={_handleOnUserPress}
              handleTagPress={_handleTagPress}
              handleVideoPress={_handleVideoPress}
              handleYoutubePress={_handleYoutubePress}
            />
          </View>
        </LongPressGestureHandler>
      ) : (
        <TextButton
          style={styles.revealButton}
          textStyle={styles.revealText}
          onPress={() => _showLowComment()}
          text={intl.formatMessage({ id: 'comments.reveal_comment' })}
        />
      )}
      <ActionsSheetView
        ref={youtubePlayerRef}
        gestureEnabled={true}
        hideUnderlay
        containerStyle={{ backgroundColor: 'black' }}
        indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
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
      </ActionsSheetView>
    </Fragment>
  );
};

export default CommentBody;
