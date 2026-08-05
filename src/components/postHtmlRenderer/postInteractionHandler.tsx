import React, { forwardRef, useImperativeHandle, useRef, useState, Fragment } from 'react';
import { Linking } from 'react-native';
import { useIntl } from 'react-intl';
import ActionsSheet from 'react-native-actions-sheet';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../constants/routeNames';
import { toastNotification } from '../../redux/actions/uiAction';
import { writeToClipboard } from '../../utils/clipboard';

import { OptionsModal } from '../atoms';
import VideoPlayer from '../videoPlayer/videoPlayerView';

import { PostTypes } from '../../constants/postTypes';
import { isHiveUri, isWebUrl } from '../../utils/hive-uri';
import { parseWavesUrl } from '../../utils/postUrlParser';
import showExploreLinkWarning from '../../utils/showExploreLinkWarning';
import { ImageViewer } from '../imageViewer';
import { useLinkProcessor } from '../../hooks';
import { CopyModal } from '../copyModal';

interface PostHtmlInteractionHandlerProps {
  postType?: PostTypes;
}

export const PostHtmlInteractionHandler = forwardRef(
  ({ postType: _postType }: PostHtmlInteractionHandlerProps, ref) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const intl = useIntl();

    const linkProcessor = useLinkProcessor();

    const actionLink = useRef<any>(null);
    const youtubePlayerRef = useRef<any>(null);
    const imageViewerRef = useRef<any>(null);
    const copyModalRef = useRef<any>(null);

    const [videoUrl, setVideoUrl] = useState<any>(null);
    const [videoThumbUrl, setVideoThumbUrl] = useState<string | undefined>(undefined);
    const [youtubeVideoId, setYoutubeVideoId] = useState<any>(null);
    const [videoStartTime, setVideoStartTime] = useState(0);
    const [selectedLink, setSelectedLink] = useState<any>(null);

    useImperativeHandle(ref, () => ({
      handleImagePress: (url: string, postImgUrls: string[]) => {
        if (imageViewerRef.current) {
          imageViewerRef.current.show(url, postImgUrls);
        }
      },
      handleLinkPress: (url: string) => {
        if (isHiveUri(url)) {
          linkProcessor.handleLink(url);
          return;
        }

        // waves permalinks have no @author segment, so render-helper classifies
        // them as external; open the wave thread natively instead of the link sheet
        const wavesLink = parseWavesUrl(url);
        if (wavesLink) {
          navigation.navigate({
            name: ROUTES.SCREENS.POST,
            params: {
              author: wavesLink.author,
              permlink: wavesLink.permlink,
            },
            key: `${wavesLink.author}/${wavesLink.permlink}`,
          } as never);
          return;
        }

        setSelectedLink(url);
        actionLink.current?.show();
      },
      handleYoutubePress: (videoId: any, startTime: any) => {
        if (videoId && youtubePlayerRef.current) {
          setYoutubeVideoId(videoId);
          setVideoStartTime(startTime);
          youtubePlayerRef.current.show();
        }
      },

      handleVideoPress: (embedUrl: any, thumbUrl?: string) => {
        if (embedUrl && youtubePlayerRef.current) {
          setVideoUrl(embedUrl);
          setVideoThumbUrl(thumbUrl);
          setVideoStartTime(0);
          youtubePlayerRef.current.show();
        }
      },
      handleParaSelection: (selectedText: string) => {
        if (copyModalRef.current && selectedText) {
          copyModalRef.current.show(selectedText);
        }
      },
    }));

    const _handleLinkOptionPress = (ind: any) => {
      if (!selectedLink) {
        setSelectedLink(null);
        return;
      }

      switch (ind) {
        case 0:
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
          break;

        case 1:
          // open web links inside the in-app Explore dApp browser, but warn
          // first since Explore exposes the wallet bridge to the page
          if (isWebUrl(selectedLink)) {
            const link = selectedLink;
            showExploreLinkWarning({
              intl,
              url: link,
              onConfirm: () =>
                navigation.navigate({
                  name: ROUTES.SCREENS.DAPP_BROWSER,
                  params: {
                    url: link,
                  },
                  key: link,
                } as never),
            });
            break;
          }
        // non-web scheme (mailto:, tel:, etc.) — let the OS handle it
        // falls through

        case 2:
          // open in the device's default browser
          Linking.openURL(selectedLink).catch(() => {
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.something_wrong',
                }),
              ),
            );
          });
          break;

        default:
          break;
      }

      setSelectedLink(null);
    };

    return (
      <Fragment>
        <ImageViewer ref={imageViewerRef} />

        <OptionsModal
          ref={actionLink}
          options={[
            intl.formatMessage({ id: 'post.link_copy' }),
            intl.formatMessage({ id: 'post.link_open_explore' }),
            intl.formatMessage({ id: 'post.link_open_system' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'post.link' })}
          cancelButtonIndex={3}
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
            setVideoThumbUrl(undefined);
          }}
        >
          <VideoPlayer
            mode={youtubeVideoId ? 'youtube' : 'uri'}
            youtubeVideoId={youtubeVideoId}
            uri={videoUrl}
            startTime={videoStartTime}
            thumbnailUrl={videoThumbUrl}
          />
        </ActionsSheet>

        <CopyModal ref={copyModalRef} />
      </Fragment>
    );
  },
);
