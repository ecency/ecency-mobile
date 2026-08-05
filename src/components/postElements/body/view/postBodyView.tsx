import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Linking, useWindowDimensions, View } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheetView, { SheetManager } from 'react-native-actions-sheet';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
import { writeToClipboard } from '../../../../utils/clipboard';
import { toastNotification } from '../../../../redux/actions/uiAction';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';
import { OptionsModal } from '../../../atoms';
import { isCommunity } from '../../../../utils/communityValidation';
import { GLOBAL_POST_FILTERS_VALUE } from '../../../../constants/options/filters';
import { CopyModal, ImageViewer, PostHtmlRenderer, VideoPlayer } from '../../..';
import { useAppDispatch, useLinkProcessor } from '../../../../hooks';
import { isHiveUri, isWebUrl } from '../../../../utils/hive-uri';
import { parseWavesUrl } from '../../../../utils/postUrlParser';
import showExploreLinkWarning from '../../../../utils/showExploreLinkWarning';
import { SheetNames } from '../../../../navigation/sheets';

interface PostBodyProps {
  body: string;
  metadata?: any;
  author?: string;
  permlink?: string;
  width?: number;
  enableViewabilityTracker?: boolean;
  onLoadEnd?: () => void;
}

const PostBody = ({
  body,
  metadata,
  author,
  permlink,
  width,
  enableViewabilityTracker,
  onLoadEnd,
}: PostBodyProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const linkProcessor = useLinkProcessor();

  const dims = useWindowDimensions();
  const contentWidth = width || dims.width - 32;

  const [selectedLink, setSelectedLink] = useState(null);
  const [html, setHtml] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoThumbUrl, setVideoThumbUrl] = useState<string | undefined>(undefined);
  const [videoStartTime, setVideoStartTime] = useState(0);

  const actionLink = useRef<any>(null);
  const imageViewerRef = useRef<any>(null);
  const youtubePlayerRef = useRef<any>(null);
  const copyModalRef = useRef<any>(null);

  useEffect(() => {
    if (body) {
      setHtml(body.replace(/<a/g, '<a target="_blank"'));
    }
  }, [body]);

  const _handleYoutubePress = (videoId: any, startTime: any) => {
    if (videoId && youtubePlayerRef.current) {
      setYoutubeVideoId(videoId);
      setVideoStartTime(startTime);
      youtubePlayerRef.current.show();
    }
  };

  const _handleVideoPress = (embedUrl: any, thumbUrl?: string) => {
    if (embedUrl && youtubePlayerRef.current) {
      setVideoUrl(embedUrl);
      setVideoThumbUrl(thumbUrl);
      setVideoStartTime(0);
      youtubePlayerRef.current.show();
    }
  };

  const handleLinkPress = (ind: any) => {
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
              (navigation as any).navigate({
                name: ROUTES.SCREENS.DAPP_BROWSER,
                params: {
                  url: link,
                },
                key: link,
              }),
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

  const _handleTagPress = (tag: any, filter = GLOBAL_POST_FILTERS_VALUE[0]) => {
    if (tag) {
      const name = isCommunity(tag) ? ROUTES.SCREENS.COMMUNITY : ROUTES.SCREENS.TAG_RESULT;
      const key = `${filter}/${tag}`;
      (navigation as any).navigate({
        name,
        params: {
          tag,
          filter,
          key,
        },
      });
    }
  };

  const _handleOnPostPress = (permlink: any, author: any) => {
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

      (navigation as any).navigate({
        name: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: `${author}/${permlink}`,
      });
    }
  };

  const _handleParaSelection = (selectedText: any) => {
    copyModalRef.current.show(selectedText);
  };

  const _handleOnUserPress = (username: any) => {
    if (username) {
      SheetManager.show(SheetNames.QUICK_PROFILE, {
        payload: {
          username,
        },
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

  const _handleLoadEnd = () => {
    if (onLoadEnd) {
      onLoadEnd();
    }
  };

  const _handleSetSelectedLink = (link: any) => {
    if (isHiveUri(link)) {
      linkProcessor.handleLink(link);
      return;
    }

    // waves permalinks have no @author segment, so render-helper classifies
    // them as external; open the wave thread natively instead of the link sheet
    const wavesLink = parseWavesUrl(link);
    if (wavesLink) {
      _handleOnPostPress(wavesLink.permlink, wavesLink.author);
      return;
    }

    setSelectedLink(link);
    actionLink.current.show();
  };

  const _handleSetSelectedImage = (imageLink: any, postImgUrls: any) => {
    if (imageViewerRef.current) {
      imageViewerRef.current.show(imageLink, postImgUrls);
    }
  };

  return (
    <Fragment>
      <ImageViewer ref={imageViewerRef} />

      <ActionSheetView
        ref={youtubePlayerRef}
        gestureEnabled={true}
        {...({ hideUnderlay: true } as any)}
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
      </ActionSheetView>

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
          handleLinkPress(index);
        }}
      />

      <CopyModal ref={copyModalRef} />

      <View>
        <PostHtmlRenderer
          key={`html_content_${contentWidth}`} // makes sure html content is rerendered on width update
          body={html}
          metadata={metadata}
          author={author}
          permlink={permlink}
          contentWidth={contentWidth}
          enableViewabilityTracker={enableViewabilityTracker}
          onLoaded={_handleLoadEnd}
          setSelectedImage={_handleSetSelectedImage}
          setSelectedLink={_handleSetSelectedLink}
          handleOnPostPress={_handleOnPostPress}
          handleOnUserPress={_handleOnUserPress}
          handleTagPress={_handleTagPress}
          handleVideoPress={_handleVideoPress}
          handleYoutubePress={_handleYoutubePress}
          handleParaSelection={_handleParaSelection}
        />
      </View>
    </Fragment>
  );
};

const areEqual = (prevProps: any, nextProps: any) => {
  if (prevProps.body === nextProps.body) {
    return true;
  }
  return false;
};

export default React.memo(PostBody, areEqual);
