import React, { memo, useMemo, useRef, useCallback } from 'react';
import RenderHTML, {
  CustomRendererProps,
  domNodeToHTMLString,
  Element,
  TNode,
} from 'react-native-render-html';
import { useHtmlIframeProps, iframeModel } from '@native-html/iframe-plugin';
import WebView from 'react-native-webview';
import { ScrollView } from 'react-native-gesture-handler';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { postBodySummary } from '@ecency/render-helper';
import styles from './postHtmlRendererStyles';
import { LinkData, parseLinkData } from './linkDataParser';
import VideoThumb from './videoThumb';
import { AutoHeightImage } from '../autoHeightImage/autoHeightImage';
import { HiveLinkPreview, UserAvatar, VideoPlayer } from '..';

const _getFirstMetaImage = (metadataImage: any): string | undefined => {
  if (Array.isArray(metadataImage) && metadataImage.length > 0) {
    return metadataImage[0];
  }
  if (typeof metadataImage === 'string') {
    return metadataImage;
  }
  return undefined;
};

interface PostHtmlRendererProps {
  contentWidth: number;
  body: string;
  metadata: any;
  isComment?: boolean;
  enableViewabilityTracker?: boolean;
  onLoaded?: () => void;
  setSelectedImage: (imgUrl: string, postImageUrls: string[]) => void;
  setSelectedLink: (url: string) => void;
  handleOnPostPress: (permlink: string, authro: string) => void;
  handleOnUserPress: (username: string) => void;
  handleTagPress: (tag: string, filter?: string) => void;
  handleVideoPress: (videoUrl: string, thumbnailUrl?: string) => void;
  handleYoutubePress: (videoId: string, startTime: number) => void;
  handleParaSelection: (selectedText: string) => void;
  handleOnContentPress: () => void;
}

export const PostHtmlRenderer = memo(
  ({
    contentWidth,
    body,
    metadata,
    isComment,
    enableViewabilityTracker,
    onLoaded,
    setSelectedImage,
    setSelectedLink,
    handleOnPostPress,
    handleOnUserPress,
    handleTagPress,
    handleVideoPress,
    handleYoutubePress,
    handleOnContentPress,
    handleParaSelection,
  }: PostHtmlRendererProps) => {
    const postImgUrlsRef = useRef<string[]>([]);

    // Memoize body processing to avoid expensive regex operations on every render
    const { processedBody, extractedVideo } = useMemo(() => {
      let processed = body;
      let video: { embedSrc?: string; thumbUrl?: string } | null = null;

      if (processed) {
        processed = processed
          .replace(/<center>/g, '<div class="text-center">')
          .replace(/<\/center>/g, '</div>')
          .replace(/<span(.*?)>/g, '') // TODO: later handle span with propties lie <span class="ll-key"> and remove on raw <span/>
          .replace(/<\/span>/g, '');

        // For waves, extract the *trailing* video link and render
        // it as a separate block below text. This avoids inline
        // overlap with RTL/mixed-direction text.  Only trailing
        // videos are extracted because wave submit always appends
        // the embed URL at the end of the body; a mid-content
        // video in a regular comment should stay in place.
        const isWave = metadata?.type === 'wave';
        if (isWave) {
          // Trailing whitespace / empty tags after the video
          const tail = '(?:\\s|<br\\s*/?>|<p>\\s*</p>)*$';

          // Match video link anchor at end of body (exclude YouTube
          // links so their youtubeId/startTime handling is preserved)
          const videoTailRx = new RegExp(
            `(<a[^>]*class="[^"]*markdown-video-link[^"]*"[^>]*>[\\s\\S]*?</a>)${tail}`,
            'i',
          );
          const videoMatch = processed.match(videoTailRx);
          if (videoMatch && !videoMatch[1].includes('markdown-video-link-youtube')) {
            const html = videoMatch[1];
            const embedMatch = html.match(/data-embed-src="([^"]*)"/);
            const thumbRx = /class="[^"]*video-thumbnail[^"]*"[^>]*src="([^"]*)"/;
            const thumbMatch = html.match(thumbRx);
            video = {
              embedSrc: embedMatch?.[1],
              thumbUrl: thumbMatch?.[1],
            };
            processed = processed.replace(videoTailRx, '');
          }

          // Match trailing iframe video embeds (3speak etc.)
          if (!video) {
            const iframeTailRx = new RegExp(
              `(<iframe[^>]*src="([^"]*)"[^>]*>[\\s\\S]*?</iframe>)${tail}`,
              'i',
            );
            const iframeMatch = processed.match(iframeTailRx);
            if (iframeMatch) {
              video = { embedSrc: iframeMatch[2] };
              processed = processed.replace(iframeTailRx, '');
            }
          }

          // Use metadata.image as thumbnail fallback
          if (video && !video.thumbUrl) {
            video.thumbUrl = _getFirstMetaImage(metadata?.image);
          }

          // Group adjacent image-only <p> tags into a grid wrapper
          // so the image grid renderer can display them side by side
          processed = processed.replace(
            /(<p[^>]*>\s*<img[^>]*\/?\s*>\s*<\/p>\s*){2,}/gi,
            (match) => `<div class="wave-image-grid">${match}</div>`,
          );
        }
      }
      return { processedBody: processed, extractedVideo: video };
    }, [body, metadata]);

    const _minTableColWidth = contentWidth / 3 - 12;

    // Extract thumbnail from metadata for video orientation detection and comment thumbnails
    const _metadataThumbUrl = useMemo(() => _getFirstMetaImage(metadata?.image), [metadata]);

    const _handleOnLinkPress = useCallback(
      (data: LinkData) => {
        if (!data) {
          return;
        }

        const {
          type,
          href,
          author,
          permlink,
          tag,
          youtubeId,
          startTime,
          filter,
          videoHref,
          community,
        } = data;

        try {
          switch (type) {
            case '_external':
            case 'markdown-external-link':
              if (href) {
                setSelectedLink(href);
              }
              break;
            case 'markdown-author-link':
              if (handleOnUserPress && author) {
                handleOnUserPress(author);
              }
              break;
            case 'markdown-post-link':
              if (handleOnPostPress && permlink && author) {
                handleOnPostPress(permlink, author);
              }
              break;
            case 'markdown-tag-link':
              if (handleTagPress && tag) {
                handleTagPress(tag, filter);
              }
              break;

            case 'markdown-video-link':
              if (handleVideoPress && videoHref) {
                handleVideoPress(videoHref, _metadataThumbUrl);
              }
              break;
            case 'markdown-video-link-youtube':
              if (handleYoutubePress && youtubeId) {
                handleYoutubePress(youtubeId, startTime);
              }

              break;

            // unused cases
            case 'markdown-witnesses-link':
              if (href) {
                setSelectedLink(href);
              }
              break;

            case 'markdown-proposal-link':
              if (href) {
                setSelectedLink(href);
              }
              break;

            case 'markdown-community-link':
              // tag press also handles community by default
              if (handleTagPress && community) {
                handleTagPress(community, filter);
              }
              break;

            default:
              break;
          }
        } catch (error) {
          console.error('[PostHtmlRenderer] Failed to handle link press', error);
        }
      },
      [
        setSelectedLink,
        handleOnUserPress,
        handleOnPostPress,
        handleTagPress,
        handleVideoPress,
        handleYoutubePress,
        _metadataThumbUrl,
      ],
    );

    // this method checks if image is a child of table column
    // and calculates img width accordingly,
    // returns full width if img is not part of table
    const getMaxImageWidth = (tnode: TNode) => {
      // return full width if not parent exist
      if (!tnode.parent || tnode.parent.tagName === 'body') {
        return contentWidth;
      }

      // return divided width based on number td tags
      if (tnode.parent.tagName === 'td' || tnode.parent.tagName === 'th') {
        const cols = tnode.parent.parent.children.length;
        return contentWidth / cols;
      }

      // check next parent
      return getMaxImageWidth(tnode.parent);
    };

    // Does some needed dom modifications for proper rendering
    const _onElement = useCallback((element: Element) => {
      // Handle data-align attribute on any element
      if (element.attribs && element.attribs['data-align']) {
        const alignValue = element.attribs['data-align'].toLowerCase();
        const alignClass = `align-${alignValue}`;

        // Add align class to existing classes
        if (element.attribs.class) {
          if (!element.attribs.class.includes(alignClass)) {
            element.attribs.class = `${element.attribs.class} ${alignClass}`;
          }
        } else {
          element.attribs.class = alignClass;
        }
      }

      if (element.tagName === 'img' && element.attribs.src) {
        const imgUrl = element.attribs.src;
        console.log('img element detected', imgUrl);
        if (!postImgUrlsRef.current.includes(imgUrl)) {
          postImgUrlsRef.current.push(imgUrl);
        }
      }

      // this avoids invalid rendering of first element of table pushing rest of columns to extreme right.
      if (element.tagName === 'table') {
        console.log('table detected');

        element.children.forEach((child) => {
          if (child.name === 'tr') {
            let headerIndex = -1;
            let colIndex = -1;

            child.children.forEach((gChild, index) => {
              // check if element of row in table is not a column while it's other siblings are columns
              if (gChild.type === 'tag') {
                if (gChild.name !== 'td' && headerIndex === -1) {
                  headerIndex = index;
                } else if (colIndex === -1) {
                  colIndex = index;
                }
              }
            });

            // if a row contains a header with column siblings
            // remove first child and place it as first separate row in table
            if (headerIndex !== -1 && colIndex !== -1 && headerIndex < colIndex) {
              console.log('time to do some switching', headerIndex, colIndex);
              // const header = child.children[headerIndex];
              // const headerRow = new Element('tr', {}, [header]);

              // TODO: put back replacement for domutils
              // removeElement(header);
              // prependChild(element, headerRow);
            }
          }
        });
      }
    }, []);

    const _anchorRenderer = useCallback(
      ({ InternalRenderer, tnode, ...props }: CustomRendererProps<TNode>) => {
        const parsedTnode = parseLinkData(tnode);

        const _onPress = () => {
          // parse link data and handle on link press
          const linkData = parseLinkData(tnode);
          console.log('Link Data:', linkData);
          _handleOnLinkPress(linkData);
        };

        // process video link
        if (parsedTnode?.type === 'markdown-video-link') {
          if (isComment) {
            const imgElement = tnode.children.find(
              (child) => child.classes.indexOf('video-thumbnail') >= 0,
            );
            const thumbUri = imgElement?.attributes?.src || _metadataThumbUrl;
            return <VideoThumb contentWidth={contentWidth} uri={thumbUri} onPress={_onPress} />;
          } else {
            return (
              <View style={{ width: contentWidth }}>
                <VideoPlayer
                  mode={parsedTnode.youtubeId ? 'youtube' : 'uri'}
                  contentWidth={contentWidth}
                  uri={parsedTnode.videoHref}
                  youtubeVideoId={parsedTnode.youtubeId}
                  startTime={parsedTnode.startTime}
                  disableAutoplay={true}
                  thumbnailUrl={_metadataThumbUrl}
                />
              </View>
            );
          }
        }

        if (tnode.children.length === 1 && tnode.children[0].tagName === 'img') {
          const maxImgWidth = getMaxImageWidth(tnode);
          return (
            <AutoHeightImage
              contentWidth={maxImgWidth}
              imgUrl={tnode.children[0].attributes.src}
              metadata={metadata}
              isAnchored={false}
              activeOpacity={0.8}
              onPress={_onPress}
            />
          );
        }

        // render hive post mini card for post-link
        if (parsedTnode?.type === 'markdown-post-link' && parsedTnode.isInLine) {
          const origUrl = parsedTnode.href;
          const linkMeta = metadata?.links_meta && metadata.links_meta[origUrl || ''];

          return (
            <HiveLinkPreview
              author={parsedTnode.author}
              permlink={parsedTnode.permlink}
              linkMeta={linkMeta}
              onPress={_onPress}
              contentWidth={contentWidth}
            />
          );
        }

        // render user avatar
        if (parsedTnode?.type === 'markdown-author-link') {
          const usernameStyle = { ...styles.tagText, marginLeft: 4 };
          return (
            <Text>
              {' '}
              <TouchableOpacity onPress={_onPress} style={styles.tagWrapper}>
                <UserAvatar
                  username={parsedTnode.author || ''}
                  size="small"
                  metadata={metadata}
                  noAction
                />
                <Text style={usernameStyle}>@{tnode.attributes['data-author']}</Text>
              </TouchableOpacity>{' '}
            </Text>
          );
        }

        // render tag
        if (parsedTnode?.type === 'markdown-tag-link') {
          return (
            <Text>
              {' '}
              <TouchableOpacity onPress={_onPress} style={styles.tagWrapper}>
                <Text style={styles.tagText}>#{parsedTnode.tag}</Text>
              </TouchableOpacity>{' '}
            </Text>
          );
        }

        return <InternalRenderer tnode={tnode} onPress={_onPress} {...props} />;
      },
      [_handleOnLinkPress, isComment, contentWidth, metadata, _metadataThumbUrl],
    );

    const _imageRenderer = useCallback(
      ({ tnode }: CustomRendererProps<TNode>) => {
        const imgUrl = tnode.attributes.src;
        const _onPress = () => {
          console.log('Image Pressed:', imgUrl);
          setSelectedImage(imgUrl, postImgUrlsRef.current);
        };

        const isVideoThumb = tnode.classes?.indexOf('video-thumbnail') >= 0;
        const isAnchored = tnode.parent?.tagName === 'a';

        // Inside a wave-image-grid, render images at half width with cover fit
        const isInGrid = !!tnode.parent?.parent?.classes?.includes('wave-image-grid');
        if (isInGrid) {
          const halfWidth = Math.floor((contentWidth - 2) / 2);
          return (
            <AutoHeightImage
              contentWidth={halfWidth}
              imgUrl={imgUrl}
              metadata={metadata}
              isAnchored={false}
              aspectRatio={4 / 3}
              lockWidth={true}
              onPress={_onPress}
              enableViewabilityTracker={enableViewabilityTracker}
            />
          );
        }

        if (isVideoThumb) {
          return <VideoThumb contentWidth={contentWidth} uri={imgUrl} />;
        } else {
          const maxImgWidth = getMaxImageWidth(tnode);
          return (
            <AutoHeightImage
              contentWidth={maxImgWidth}
              imgUrl={imgUrl}
              metadata={metadata}
              isAnchored={isAnchored}
              onPress={_onPress}
              enableViewabilityTracker={enableViewabilityTracker}
            />
          );
        }
      },
      [contentWidth, metadata, enableViewabilityTracker, setSelectedImage],
    );

    /**
     * the para renderer is designed to remove margins from para
     * if it's a direct child of li tag as the added margin causes
     * unique misalignment of bullet and content
     * @returns Default Renderer
     */
    const _paraRenderer = useCallback(
      ({ TDefaultRenderer, ...props }: CustomRendererProps<TNode>) => {
        const { tnode } = props;
        const isInsideLi = tnode.parent?.tagName === 'li';
        const isInsideGrid = tnode.parent?.classes?.includes('wave-image-grid');

        const handleLongPress = () => {
          const paragraphText = domNodeToHTMLString(tnode.domNode);
          if (handleParaSelection && !!paragraphText) {
            const rawText = postBodySummary(paragraphText, paragraphText.length, Platform.OS);
            handleParaSelection(rawText);
          }
        };

        const styleOverride = isInsideGrid || isInsideLi ? styles.pLi : styles.p;
        props.style = { ...props.style, ...styleOverride };
        const _onPress = props.onPress || handleOnContentPress;

        return (
          <TouchableOpacity onLongPress={handleLongPress} onPress={_onPress} activeOpacity={0.8}>
            <TDefaultRenderer {...props} />
          </TouchableOpacity>
        );
      },
      [handleParaSelection, handleOnContentPress],
    );

    // eslint-disable-next-line max-len
    // based on the number of columns a table have, sets scroll enabled or disable, also adjust table full width
    const _tableRenderer = useCallback(
      ({ InternalRenderer, ...props }: CustomRendererProps<TNode>) => {
        // recursive calculates the max number of table columns (th) in the table
        const getMaxThCount = (node: TNode) => {
          if (!node || !node.children) return 0;
          let max = 0;
          node.children.forEach((child) => {
            if (child.tagName === 'tr' && child.children) {
              const thCount = child.children.filter((c) => c.tagName === 'th').length;
              if (thCount > max) max = thCount;
            }
            // Recursively check for nested tr elements
            const childMax = getMaxThCount(child);
            if (childMax > max) max = childMax;
          });
          return max;
        };

        const maxColumns = getMaxThCount(props.tnode);

        const isScrollable = maxColumns > 3;
        const _tableWidth = isScrollable ? maxColumns * _minTableColWidth : contentWidth;
        props.style = { width: _tableWidth };

        return (
          <ScrollView horizontal={true} scrollEnabled={isScrollable}>
            <InternalRenderer {...props} />
          </ScrollView>
        );
      },
      [_minTableColWidth, contentWidth],
    );

    // iframe renderer for rendering iframes in body
    const _iframeRenderer = useCallback(
      function IframeRenderer(props) {
        const iframeProps = useHtmlIframeProps(props);

        if (isComment) {
          const _onPress = () => {
            console.log('iframe thumb Pressed:', iframeProps);
            if (handleVideoPress) {
              handleVideoPress(iframeProps.source.uri, _metadataThumbUrl);
            }
          };
          return (
            <VideoThumb contentWidth={contentWidth} uri={_metadataThumbUrl} onPress={_onPress} />
          );
        } else {
          const isSpeakEmbed = /3speak\.tv/i.test(iframeProps.source.uri || '');
          return (
            <View
              style={[styles.embeddedVideoWrapper, { width: contentWidth, maxWidth: contentWidth }]}
            >
              <VideoPlayer
                mode="uri"
                uri={iframeProps.source.uri}
                contentWidth={contentWidth}
                thumbnailUrl={isSpeakEmbed ? _metadataThumbUrl : undefined}
              />
            </View>
          );
        }
      },
      [isComment, handleVideoPress, contentWidth, _metadataThumbUrl],
    );

    const tagsStyles = useMemo(
      () => ({
        a: styles.a,
        img: styles.img,
        table: styles.table,
        tr: { ...styles.tr, width: contentWidth }, // center tag causes tr to have 0 width if not exclusivly set, contentWidth help avoid that
        th: { ...styles.th, minWidth: _minTableColWidth },
        td: { ...styles.td, minWidth: _minTableColWidth },
        div: { ...styles.div, maxWidth: contentWidth }, // makes sure width covers the available horizontal space for view and not exceed the contentWidth if parent bound id not defined
        iframe: {
          width: contentWidth,
          maxWidth: contentWidth,
          alignSelf: 'center',
          marginLeft: 'auto',
          marginRight: 'auto',
        },
        blockquote: styles.blockquote,
        code: styles.code,
        li: styles.li,
        h1: styles.h1,
        h2: styles.h2,
        h3: styles.h3,
        h4: styles.h4,
        h5: styles.h5,
        h6: styles.h6,
      }),
      [contentWidth],
    );

    const baseStyle = useMemo(() => ({ ...styles.baseStyle, width: contentWidth }), [contentWidth]);

    const classesStyles = useMemo(
      () => ({
        phishy: styles.phishy,
        'text-justify': styles.textJustify,
        'text-center': styles.textCenter,
        'align-center': { alignSelf: 'center' as const },
        'align-left': { alignSelf: 'flex-start' as const },
        'align-right': { alignSelf: 'flex-end' as const },
        'wave-image-grid': {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          gap: 2,
          borderRadius: 12,
          overflow: 'hidden' as const,
          marginTop: 4,
        },
      }),
      [],
    );

    const renderers = useMemo(
      () => ({
        img: _imageRenderer,
        a: _anchorRenderer,
        p: _paraRenderer,
        iframe: _iframeRenderer,
        table: _tableRenderer,
      }),
      [_imageRenderer, _anchorRenderer, _paraRenderer, _iframeRenderer, _tableRenderer],
    );

    const domVisitors = useMemo(
      () => ({
        onElement: _onElement,
      }),
      [_onElement],
    );

    const customHTMLElementModels = useMemo(
      () => ({
        iframe: iframeModel,
      }),
      [],
    );

    const renderersProps = useMemo(
      () => ({
        iframe: {
          scalesPageToFit: true,
        },
      }),
      [],
    );

    const _handleExtractedVideoPress = useCallback(() => {
      if (!extractedVideo?.embedSrc) {
        return;
      }
      if (handleVideoPress) {
        handleVideoPress(extractedVideo.embedSrc, extractedVideo.thumbUrl);
      }
    }, [extractedVideo, handleVideoPress]);

    return (
      <View>
        <RenderHTML
          source={{ html: processedBody }}
          contentWidth={contentWidth}
          baseStyle={baseStyle}
          classesStyles={classesStyles}
          tagsStyles={tagsStyles}
          domVisitors={domVisitors}
          renderers={renderers}
          onHTMLLoaded={onLoaded && onLoaded}
          defaultTextProps={{
            selectable: false,
          }}
          customHTMLElementModels={customHTMLElementModels}
          renderersProps={renderersProps}
          WebView={WebView}
          pressableHightlightColor="transparent"
        />
        {extractedVideo && (
          <VideoThumb
            contentWidth={contentWidth}
            uri={extractedVideo.thumbUrl}
            onPress={_handleExtractedVideoPress}
          />
        )}
      </View>
    );
  },
  (next, prev) =>
    next.body === prev.body &&
    next.metadata === prev.metadata &&
    next.contentWidth === prev.contentWidth &&
    next.isComment === prev.isComment &&
    next.enableViewabilityTracker === prev.enableViewabilityTracker,
);
