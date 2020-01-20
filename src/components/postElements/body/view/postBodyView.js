import React, { Fragment, useState } from 'react';
import { Dimensions, Linking, Alert, Modal, PermissionsAndroid, Platform } from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import { withNavigation } from 'react-navigation';
import { useIntl, injectIntl } from 'react-intl';
import AutoHeightWebView from 'react-native-autoheight-webview';
import EStyleSheet from 'react-native-extended-stylesheet';
import get from 'lodash/get';
import ImageViewer from 'react-native-image-zoom-viewer';
import RNFetchBlob from 'rn-fetch-blob';

import { customBodyScript } from './config';
import { PostPlaceHolder, CommentPlaceHolder } from '../../../basicUIElements';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';

const WIDTH = Dimensions.get('window').width;

const PostBody = ({
  navigation,
  body,
  commentDepth,
  isComment,
  handleOnUserPress,
  handleOnPostPress,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [postImages, setPostImages] = useState([]);
  const intl = useIntl();

  const _handleOnLinkPress = event => {
    if ((!event && !get(event, 'nativeEvent.data'), false)) {
      return;
    }

    try {
      let data = {};
      try {
        data = JSON.parse(get(event, 'nativeEvent.data'));
      } catch (error) {
        data = {};
      }

      const { type, href, author, category, permlink, tag, proposal, videoHref } = data;

      switch (type) {
        case '_external':
        case 'markdown-external-link':
          _handleBrowserLink(href);
          break;
        case 'markdown-author-link':
          if (!handleOnUserPress) {
            _handleOnUserPress(author);
          } else {
            handleOnUserPress(author);
          }
          break;
        case 'markdown-post-link':
          if (!handleOnPostPress) {
            _handleOnPostPress(permlink, author);
          } else {
            handleOnPostPress(permlink, author);
          }
          break;
        case 'markdown-tag-link':
          _handleTagPress(tag);
          break;
        case 'markdown-witnesses-link':
          break;
        case 'markdown-proposal-link':
          break;
        case 'markdown-video-link':
          break;
        case 'image':
          setPostImages([{ url: href }]);
          setIsImageModalOpen(true);
          break;

        default:
          break;
      }
    } catch (error) {}
  };

  const _handleTagPress = tag => {
    if (tag) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.SEARCH_RESULT,
        params: {
          tag,
        },
      });
    }
  };

  const _handleBrowserLink = async url => {
    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(intl.formatMessage({ id: 'alert.failed_to_open' }));
        }
      });
    }
  };

  const _handleOnPostPress = (permlink, author) => {
    if (permlink) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: permlink,
      });
    }
  };

  const _handleOnUserPress = username => {
    if (username) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username,
        },
        key: username,
      });
    } else {
      Alert.alert('Opss!', 'Wrong link.');
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

  const _downloadImage = async uri => {
    return RNFetchBlob.config({
      fileCache: true,
      appendExt: 'jpg',
    })
      .fetch('GET', uri)
      .then(res => {
        let status = res.info().status;

        if (status == 200) {
          return res.path();
        } else {
          Promise.reject();
        }
      })
      .catch(errorMessage => {
        Promise.reject(errorMessage);
      });
  };

  const _saveImage = async uri => {
    try {
      if (Platform.OS === 'android') {
        await checkAndroidPermission();
        uri = `file://${await _downloadImage(uri)}`;
      }
      CameraRoll.saveToCameraRoll(uri)
        .then(res => {
          Alert.alert(
            intl.formatMessage({ id: 'alert.success' }),
            intl.formatMessage({ id: 'post.image_saved' }),
            [{ text: 'OK' }],
            { cancelable: false },
          );
        })
        .catch(error => {
          Alert.alert(
            intl.formatMessage({ id: 'post.image_saved_error' }),
            error.message,
            [{ text: 'OK' }],
            {
              cancelable: false,
            },
          );
        });
    } catch (error) {
      Alert.alert(
        intl.formatMessage({ id: 'post.image_saved_error' }),
        error.message,
        [{ text: 'OK' }],
        {
          cancelable: false,
        },
      );
    }
  };

  const html = body.replace(/<a/g, '<a target="_blank"');
  const customStyle = `
  * {
    color: ${EStyleSheet.value('$primaryBlack')};
    font-family: Roboto, sans-serif;
    max-width: 100%;
  }
  body {
    color: ${EStyleSheet.value('$primaryBlack')};
  }
  a {
    color: ${EStyleSheet.value('$primaryBlue')};
    cursor: pointer;
    margin-right: 5;
  }
  img {
    align-self: 'center';
    max-width: 100%;
  }
  center {
    text-align: 'center';
    align-items: 'center';
    justify-content: 'center';
  }
  th {
    flex: 1;
    justify-content: 'center';
    font-weight: 'bold';
    color: ${EStyleSheet.value('$primaryBlack')};
    font-size: 14;
    padding: 5;
  }
  tr {
    background-color: ${EStyleSheet.value('$darkIconColor')};
    flex-direction: 'row';
  }
  td {
    border-width: 0.5;
    border-color: ${EStyleSheet.value('$tableBorderColor')};
    flex: 1;
    padding: 10;
    background-color: ${EStyleSheet.value('$tableTrColor')};
  }
  blockquote {
    border-left-width: 5;
    border-left-style: solid;
    border-color: ${EStyleSheet.value('$darkIconColor')};
    padding-left: 5;
  }
  code {
    background-color: ${EStyleSheet.value('$darkIconColor')};
    font-family: ${EStyleSheet.value('$editorFont')};
  }
  center {
    text-align: 'center';
    align-items: 'center';
    justify-content: 'center';
  }
  .markdown-video-link {
    max-width: 100%;
    position: relative;
  }
  .markdown-video-play {
    position: absolute;
    width: 100px;
    height: 100px;
    background: url('data:image/png;base64,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') no-repeat center center;
    z-index: 20;
    opacity: 0.9;
    left: 50%;
    top: 50%;
    margin-top: -100px;
    transform: translateX(-50%) translateY(-50%);
    -webkit-transform: translateX(-50%) translateY(-50%);
    -moz-transform: translateX(-50%) translateY(-50%);
  }
  
  iframe {
    width: 100%;
    height: 240px;
  }
  .pull-right {
    float: right;
  }
  .pull-left {
    float: left;
  }
  .pull-left,
  .pull-right {
    max-width: calc(50% - 10px);
    padding-left: 10px;
    margin-bottom: 10px;
    box-sizing: border-box;
  }
  .phishy {
    display: inline;
    color: red;
  }

  .text-justify {
    text-align: justify;
    text-justify: inter-word;
    letter-spacing: 0px;
  }
  `;
  return (
    <Fragment>
      <Modal visible={isImageModalOpen} transparent={true}>
        <ImageViewer
          imageUrls={postImages}
          enableSwipeDown
          onCancel={() => setIsImageModalOpen(false)}
          onSave={uri => _saveImage(uri)}
          menuContext={{
            saveToLocal: intl.formatMessage({ id: 'post.save_to_local' }),
            cancel: intl.formatMessage({ id: 'alert.cancel' }),
          }}
        />
      </Modal>
      <AutoHeightWebView
        source={{ html }}
        allowsFullscreenVideo={true}
        style={{ width: isComment ? WIDTH - (32 + 34 * (commentDepth % 6)) : WIDTH - 32 }}
        customStyle={customStyle}
        onMessage={_handleOnLinkPress}
        customScript={customBodyScript}
        renderLoading={() => (isComment ? <CommentPlaceHolder /> : <PostPlaceHolder />)}
        startInLoadingState={true}
        onShouldStartLoadWithRequest={false}
        scrollEnabled={false}
      />
    </Fragment>
  );
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.body !== nextProps.body) {
    return true;
  }
  return false;
};

export default React.memo(injectIntl(withNavigation(PostBody)), areEqual);
