import React, { Fragment, useState, useEffect, useRef } from 'react';
import { SafeAreaView, PermissionsAndroid, Platform, View, Text } from 'react-native';
// import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import ImageView from 'react-native-image-viewing';
import RNFetchBlob from 'rn-fetch-blob';
import ActionSheetView from 'react-native-actions-sheet';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
import { writeToClipboard } from '../../../../utils/clipboard';
import { showProfileModal, toastNotification } from '../../../../redux/actions/uiAction';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';
import { OptionsModal } from '../../../atoms';
import { isCommunity } from '../../../../utils/communityValidation';
import { GLOBAL_POST_FILTERS_VALUE } from '../../../../constants/options/filters';
import { PostHtmlRenderer, VideoPlayer } from '../../..';
import getWindowDimensions from '../../../../utils/getWindowDimensions';
import { useAppDispatch } from '../../../../hooks';
import { IconButton } from '../../../buttons';
import styles from './postBodyStyles';

const WIDTH = getWindowDimensions().width;

const PostBody = ({ body, metadata, onLoadEnd, width }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [postImages, setPostImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [html, setHtml] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoStartTime, setVideoStartTime] = useState(0);

  const intl = useIntl();
  const actionImage = useRef(null);
  const actionLink = useRef(null);
  const youtubePlayerRef = useRef(null);

  useEffect(() => {
    if (body) {
      setHtml(body.replace(/<a/g, '<a target="_blank"'));
    }
  }, [body]);

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
        navigation.navigate({
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

  const _handleTagPress = (tag, filter = GLOBAL_POST_FILTERS_VALUE[0]) => {
    if (tag) {
      const name = isCommunity(tag) ? ROUTES.SCREENS.COMMUNITY : ROUTES.SCREENS.TAG_RESULT;
      const key = `${filter}/${tag}`;
      navigation.navigate({
        name,
        params: {
          tag,
          filter,
          key,
        },
      });
    }
  };

  const _handleOnPostPress = (permlink, author) => {
    if (permlink) {
      // snippets checks if there is anchored post inside permlink and use that instead
      const anchoredPostRegex = /(.*?\#\@)(.*)\/(.*)/;
      const matchedLink = permlink.match(anchoredPostRegex);
      if (matchedLink) {
        [, , author, permlink] = matchedLink;
      }

      // check if permlink has trailing query param, remove that if is the case
      const queryIndex = permlink.lastIndexOf('?');
      if (queryIndex > -1) {
        permlink = permlink.substring(0, queryIndex);
      }

      navigation.navigate({
        name: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: permlink,
      });
    }
  };

  const _handleOnUserPress = (username) => {
    if (username) {
      dispatch(showProfileModal(username));
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
      // CameraRoll.saveToCameraRoll(uri)
      //   .then((res) => {
      //     dispatch(
      //       toastNotification(
      //         intl.formatMessage({
      //           id: 'post.image_saved',
      //         }),
      //       ),
      //     );
      //   })
      //   .catch((error) => {
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

  const _handleLoadEnd = () => {
    if (onLoadEnd) {
      onLoadEnd();
    }
  };

  const _handleSetSelectedLink = (link) => {
    setSelectedLink(link);
    actionLink.current.show();
  };

  const _handleSetSelectedImage = (imageLink, postImgUrls) => {
    if (postImages.length !== postImgUrls.length) {
      setPostImages(postImgUrls);
    }
    setSelectedImage(imageLink);
    actionImage.current.show();
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
            handleOnPress={() => setIsImageModalOpen(false)}
          />
        </View>
      </SafeAreaView>
    );
  };

  return (
    <Fragment>
      <ImageView
        images={postImages.map((url) => ({ uri: url }))}
        imageIndex={0}
        visible={isImageModalOpen}
        animationType="slide"
        swipeToCloseEnabled
        onRequestClose={() => setIsImageModalOpen(false)}
        HeaderComponent={(imageIndex) => _renderImageViewerHeader(imageIndex.imageIndex)}
      />

      <ActionSheetView
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
      </ActionSheetView>

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
      <View>
        <PostHtmlRenderer
          body={html}
          metadata={metadata}
          contentWidth={width || WIDTH - 32}
          onLoaded={_handleLoadEnd}
          setSelectedImage={_handleSetSelectedImage}
          setSelectedLink={_handleSetSelectedLink}
          handleOnPostPress={_handleOnPostPress}
          handleOnUserPress={_handleOnUserPress}
          handleTagPress={_handleTagPress}
          handleVideoPress={_handleVideoPress}
          handleYoutubePress={_handleYoutubePress}
        />
      </View>
    </Fragment>
  );
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.body === nextProps.body) {
    return true;
  }
  return false;
};

export default React.memo(PostBody, areEqual);
