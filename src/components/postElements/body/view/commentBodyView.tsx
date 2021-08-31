import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Alert, Dimensions, Linking, Modal, PermissionsAndroid, Platform, Image } from 'react-native';
import { useIntl } from 'react-intl';
import CameraRoll from '@react-native-community/cameraroll';
import RNFetchBlob from 'rn-fetch-blob';
import ImageViewer from 'react-native-image-zoom-viewer';
import ActionSheet from 'react-native-actionsheet';
import { connect } from 'react-redux';

// import AutoHeightWebView from 'react-native-autoheight-webview';
import EStyleSheet from 'react-native-extended-stylesheet';
import get from 'lodash/get';
import { navigate } from '../../../../navigation/service';
import RenderHTML, { CustomRendererProps, Element, TNode } from 'react-native-render-html';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';

import { TextButton } from '../../..';

// Styles
import styles from './commentBodyStyles';

// Services and Actions
import { writeToClipboard } from '../../../../utils/clipboard';
import { toastNotification } from '../../../../redux/actions/uiAction';
import { customCommentScript } from './config';

const WIDTH = Dimensions.get('window').width;

const CommentBody = ({
  body,
  textSelectable = true,
  handleOnUserPress,
  handleOnPostPress,
  handleOnLongPress,
  created,
  commentDepth,
  reputation,
  dispatch,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);

  const [revealComment, setRevealComment] = useState(reputation > 0);
  const intl = useIntl();
  const actionImage = useRef(null);
  const actionLink = useRef(null);

  useEffect(() => {
    if (selectedLink) {
      actionLink.current.show();
    }
  }, [selectedLink]);

  useEffect(() => {
    if (postImages.length > 0 && selectedImage !== null) {
      actionImage.current.show();
    }
  }, [selectedImage]);

  const _showLowComment = () => {
    setRevealComment(true);
  };

  const _onPress = (event, href, htmlArrts) => {
    console.log("a is pressed: ", event, href, htmlArrts);
    __handleOnLinkPress({
      type:htmlArrts.class,
      href:htmlArrts.href
    })
  }


  //new renderer functions
  const __handleOnLinkPress = (data) => {
    // if ((!event && !get(event, 'nativeEvent.data'), false)) {
    //   return;
    // }
    try {
      // let data = {};
      // try {
      //   data = JSON.parse(get(event, 'nativeEvent.data'));
      // } catch (error) {
      //   data = {};
      // }

      const {
        type,
        href,
        images,
        image,
        author,
        category,
        permlink,
        tag,
        proposal,
        videoHref,
      } = data;

      switch (type) {
        case '_external':
        case 'markdown-external-link':
          setSelectedLink(href);
          break;
        case 'longpress':
          handleOnLongPress();
          break;
        case 'markdown-author-link':
          if (!handleOnUserPress) {
            __handleOnUserPress(author);
          } else {
            handleOnUserPress(author);
          }
          break;
        case 'markdown-post-link':
          if (!handleOnPostPress) {
            __handleOnPostPress(permlink, author);
          } else {
            handleOnPostPress(permlink, author);
          }
          break;
        case 'markdown-tag-link':
          __handleTagPress(tag);
          break;
        case 'markdown-witnesses-link':
          break;
        case 'markdown-proposal-link':
          break;
        case 'markdown-video-link':
          break;
        case 'image':
          setPostImages(images);
          setSelectedImage(image);
          break;

        default:
          break;
      }
    } catch (error) {}
  };

  const handleImagePress = (ind) => {
    if (ind === 1) {
      //open gallery mode
      setIsImageModalOpen(true);
    }
    if (ind === 0) {
      //copy to clipboard
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
      //save to local
      _saveImage(selectedImage);
    }
    if (ind === 3) {
      setPostImages([]);
      setSelectedImage(null);
    }
  };

  const handleLinkPress = (ind) => {
    if (ind === 1) {
      //open link
      if (selectedLink) {
        Linking.canOpenURL(selectedLink).then((supported) => {
          if (supported) {
            Linking.openURL(selectedLink);
          } else {
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.failed_to_open',
                }),
              ),
            );
          }
        });
      }
    }
    if (ind === 0) {
      //copy to clipboard
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
    if (ind === 2) {
      setSelectedLink(null);
    }
  };

  const __handleTagPress = (tag) => {
    if (tag) {
      navigate({
        routeName: ROUTES.SCREENS.TAG_RESULT,
        params: {
          tag,
        },
      });
    }
  };

  const __handleOnPostPress = (permlink, author) => {
    if (permlink) {
      navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: `@${author}/${permlink}`,
      });
    }
  };

  const __handleOnUserPress = (username) => {
    if (username) {
      navigate({
        routeName: ROUTES.SCREENS.PROFILE,
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
        let status = res.info().status;

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
        .then((res) => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'post.image_saved',
              }),
            ),
          );
        })
        .catch((error) => {
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

  const html = body.replace(/data-href/g, 'href');

  


  const _imageRenderer = ({
      InternalRenderer,
      tnode,
      ...props
    }:CustomRendererProps<TNode>) => {

      const onPress = () => {
        const imgUrl = tnode.attributes.src;
        console.log("Image Pressed:", imgUrl)
        setSelectedImage(imgUrl);
      };

      const isAnchorChild = (tnode.parent?.classes?.indexOf('markdown-external-link') >= 0)

      return (
        <InternalRenderer
          tnode={tnode}
          onPress={!isAnchorChild && onPress}
          {...props}
        />
      );
    }


  const _onElement = (element:Element) => {
    if(element.tagName === 'img' && element.attribs.src){
      const imgUrl = element.attribs.src;
      console.log("img element detected",  imgUrl);
      if(postImages.indexOf(imgUrl) == -1){
        postImages.push(imgUrl);
        setPostImages(postImages);
      }
    }
  }


  return (
    <Fragment>
      <Modal key={`mkey-${created.toString()}`} visible={isImageModalOpen} transparent={true}>
        <ImageViewer
          imageUrls={postImages.map((url)=>({url}))}
          enableSwipeDown
          onCancel={() => setIsImageModalOpen(false)}
          onClick={() => setIsImageModalOpen(false)}
        />
      </Modal>
      <ActionSheet
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
      <ActionSheet
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
        <RenderHTML 
          contentWidth={WIDTH - (32 + 34 * (commentDepth % 6))}
          source={{ html }}
          baseStyle={styles.baseStyle}
          tagsStyles={{
            body:styles.body,
            a:styles.a,
            img:styles.img,
            th:styles.th,
            tr:styles.tr,
            td:styles.td,
            blockquote:styles.blockquote,
            code:styles.code,
            center:styles.code
          }}
          renderersProps={{
            a:{
              onPress:_onPress,
            }
          }}
          domVisitors={{
            onElement:_onElement
          }}
          renderers={{
            img:_imageRenderer
          }}

        />
        // <AutoHeightWebView
        //   key={`akey-${created.toString()}`}
        //   source={{ html }}
        //   allowsFullscreenVideo={true}
        //   style={{ width: WIDTH - (32 + 34 * (commentDepth % 6)) }}
        //   customStyle={customStyle}
        //   onMessage={__handleOnLinkPress}
        //   customScript={customCommentScript}
        //   renderLoading={() => <CommentPlaceHolder />}
        //   startInLoadingState={true}
        //   onShouldStartLoadWithRequest={false}
        //   scrollEnabled={false}
        //   scalesPageToFit={false}
        //   zoomable={false}
        // />
      ) : (
        <TextButton
          style={styles.revealButton}
          textStyle={styles.revealText}
          onPress={() => _showLowComment()}
          text={intl.formatMessage({ id: 'comments.reveal_comment' })}
        />
      )}
    </Fragment>
  );
};

const areEqual = (prevProps, nextProps) => prevProps.body !== nextProps.body;

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(React.memo(CommentBody, areEqual));
