import React, { forwardRef, useImperativeHandle, useRef, useState, Fragment } from 'react';
import { useIntl } from 'react-intl';
import ActionsSheet from 'react-native-actions-sheet';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routeNames';
import { handleDeepLink, toastNotification } from '../../redux/actions/uiAction';
import { writeToClipboard } from '../../utils/clipboard';

import { OptionsModal } from '../atoms';
import VideoPlayer from '../videoPlayer/videoPlayerView';

import { PostTypes } from '../../constants/postTypes';
import { isHiveUri } from '../../utils/hive-uri';
import { ImageViewer } from '../imageViewer';

interface PostHtmlInteractionHandlerProps {
  postType?: PostTypes;
}

export const PostHtmlInteractionHandler = forwardRef(
  ({ postType }: PostHtmlInteractionHandlerProps, ref) => {
    console.log('Post Type', postType);

    const navigation = useNavigation();
    const dispatch = useDispatch();
    const intl = useIntl();

    const actionLink = useRef(null);
    const youtubePlayerRef = useRef(null);
    const imageViewerRef = useRef(null);

    const [videoUrl, setVideoUrl] = useState(null);
    const [youtubeVideoId, setYoutubeVideoId] = useState(null);
    const [videoStartTime, setVideoStartTime] = useState(0);
    const [selectedLink, setSelectedLink] = useState(null);

    useImperativeHandle(ref, () => ({
      handleImagePress: (url: string, postImgUrls: string[]) => {
        if (imageViewerRef.current) {
          imageViewerRef.current.show(url, postImgUrls);
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

    return (
      <Fragment>
        <ImageViewer ref={imageViewerRef} />

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
