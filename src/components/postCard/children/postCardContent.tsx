import React, { useMemo, useRef } from 'react';
import { TouchableOpacity, Text, View, useWindowDimensions } from 'react-native';
// import { InView } from 'react-native-intersection-observer';
// Utils
import { useIntl } from 'react-intl';
import { proxifyImageSrc } from '@ecency/render-helper';

// Components

// Styles
import { Image as ExpoImage } from 'expo-image';
import { useLayoutState } from '@shopify/flash-list';
import styles from '../styles/postCard.styles';
import { PostCardActionIds } from '../container/postCard';
import ROUTES from '../../../constants/routeNames';
import { ContentType, MutedReason } from '../../../providers/hive/hive.types';
import { isCommunity } from '../../../utils/communityValidation';
import { useImageReveal } from '../../../hooks/useImageReveal';
import { useMutedReveal } from '../../../hooks/useMutedReveal';
import { HiddenImagePlaceholder } from '../../hiddenImagePlaceholder';

// i.ecency.com: same imagehoster backend as images.ecency.com on an
// SNI-resilient hostname. These constants render directly (they do not pass
// through proxifyImageSrc), so they must use the new host. See vision PR #791.
const DEFAULT_IMAGE =
  'https://i.ecency.com/DQmT8R33geccEjJfzZEdsRHpP3VE8pu3peRCnQa1qukU4KR/no_image_3x.png';
const NSFW_IMAGE =
  'https://i.ecency.com/DQmZ1jW4p7o5GyoqWyCib1fSLE2ftbewsMCt2GvbmT9kmoY/nsfw_3x.png';
const DEFAULT_IMAGE_RATIO = 16 / 9;

const getSafeImageRatio = (ratio?: number) =>
  typeof ratio === 'number' && Number.isFinite(ratio) && ratio > 0 ? ratio : DEFAULT_IMAGE_RATIO;

const getStableContentKey = (content?: any) => {
  const stableId =
    content?.id ?? content?._id ?? content?.uuid ?? content?.commentKey ?? content?.post_id;

  if (stableId !== undefined && stableId !== null && `${stableId}` !== '') {
    return `id:${stableId}`;
  }

  return [
    content?.author || content?.root_author || content?.parent_author || 'unknown-author',
    content?.permlink || content?.root_permlink || content?.parent_permlink || 'missing-permlink',
    content?.created || content?.createdAt || content?.created_at,
    content?.url,
    content?.title,
    content?.thumbnail || content?.image,
  ]
    .filter(Boolean)
    .join(':');
};

interface Props {
  content: any;
  nsfw: string;
  handleCardInteraction: (id: PostCardActionIds, payload?: any) => void;
}

const PostCardContentComponent = ({ content, nsfw, handleCardInteraction }: Props) => {
  const intl = useIntl();
  const dim = useWindowDimensions();
  const imgRef = useRef<ExpoImage>(null);
  // const isInViewRef = useRef(false);

  const contentKey = getStableContentKey(content);
  const initialImageRatio = getSafeImageRatio(content?.thumbRatio);
  const imgWidth = dim.width - 18;
  const [imageLayout, setImageLayout] = useLayoutState({
    contentKey,
    ratio: initialImageRatio,
  });
  // FlashList can recycle a cell with the previous post's layout state.
  // Discriminate by post key and fall back until this image reports its ratio.
  const imageRatio = imageLayout.contentKey === contentKey ? imageLayout.ratio : initialImageRatio;
  const imgHeight = imgWidth / imageRatio;
  // const [autoplay, setAutoplay] = useState(false);
  // const [isAnimated, setIsAnimated] = useState(false);

  const resizeMode = useMemo(() => {
    return imgHeight < dim.height ? 'contain' : 'cover';
  }, [dim.height, imgHeight]);

  // featured text can be used to add more labels in future by just inserting text as array item
  const _isPollPost =
    content?.json_metadata?.content_type === ContentType.POLL && !!content?.json_metadata?.question;

  const _isMuted = content?.isMuted;
  const _isCommunityPost = isCommunity(content?.community);

  // Matches web: muted content is never blanked out, the card body is only dimmed
  // behind a hint the user can tap to clear.
  const { isDimmed, reveal: revealMuted } = useMutedReveal(
    !!_isMuted,
    content?.author,
    content?.permlink,
  );

  // State the reason that actually fired. Posts cached by an older app version carry
  // isMuted without a reason, so those fall back to the generic moderation message.
  const _mutedText = useMemo(() => {
    if (!_isMuted) {
      return '';
    }
    switch (content?.mutedReason) {
      case MutedReason.LOW_REPUTATION:
        return intl.formatMessage({ id: 'post.muted_low_reputation' });
      case MutedReason.DOWNVOTED:
        return intl.formatMessage({ id: 'post.muted_downvoted' });
      default:
        return _isCommunityPost
          ? intl.formatMessage({ id: 'post.community_muted' })
          : intl.formatMessage({ id: 'post.muted' });
    }
  }, [_isMuted, content?.mutedReason, _isCommunityPost, intl]);

  const _featuredText = useMemo(
    () =>
      [
        content?.is_promoted && intl.formatMessage({ id: 'post.promoted' }),
        _isPollPost && intl.formatMessage({ id: 'post.poll' }),
      ]
        .filter((i) => !!i)
        .join(' | '),
    [content?.is_promoted, _isPollPost, intl],
  );

  const _onPress = () => {
    handleCardInteraction(PostCardActionIds.NAVIGATE, {
      name: ROUTES.SCREENS.POST,
      params: {
        content,
        author: content.author,
        permlink: content.permlink,
      },
      key: `${content.author}/${content.permlink}`,
    });
  };

  // Muted posts keep their real thumbnail (the card dims instead), so only the
  // nsfw setting can swap the image out here.
  const images = useMemo(() => {
    let imgs = { image: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE };
    if (content.thumbnail) {
      if (nsfw !== '0' && content.nsfw) {
        imgs = { image: NSFW_IMAGE, thumbnail: NSFW_IMAGE };
      } else {
        imgs = { image: content.image, thumbnail: content.thumbnail };
      }
    }
    return imgs;
  }, [content.thumbnail, content.nsfw, content.image, nsfw]);

  const original = content?.json_metadata?.image?.[0];
  const isGif = useMemo(() => /\.gif$/i.test(original), [original]);
  const imageUri = useMemo(() => {
    if (isGif) {
      return proxifyImageSrc(original, Math.round(imgWidth), 0, 'match');
    }
    return images.image;
  }, [isGif, original, images.image, imgWidth]);

  // Key the reveal on the source image rather than imageUri: the GIF branch stamps
  // the viewport width into the proxy url, so rotating the device would otherwise
  // re-hide an image the user had already loaded.
  const { isHidden, reveal } = useImageReveal(original || imageUri);

  // DEFAULT_IMAGE and NSFW_IMAGE are empty-state and moderation graphics, not post
  // content. There is nothing for the user to "load", so offer no placeholder for
  // them (and do not fetch them either while the setting is off).
  const hasContentImage = imageUri !== DEFAULT_IMAGE && imageUri !== NSFW_IMAGE;

  // const _toggleGif = (inView: boolean) => {
  //   if (Platform.OS === 'ios') {
  //     setAutoplay(inView);
  //   } else {
  //     imgRef.current?.[inView ? 'startAnimating' : 'stopAnimating']();
  //   }
  // };

  return (
    <View style={styles.postBodyWrapper}>
      {isDimmed && (
        <TouchableOpacity
          activeOpacity={0.7}
          accessibilityRole="button"
          style={styles.mutedHint}
          onPress={revealMuted}
        >
          <View style={styles.mutedHintBadge}>
            <Text style={styles.mutedHintBadgeText}>!</Text>
          </View>
          <Text style={styles.mutedHintText}>
            {_mutedText}{' '}
            <Text style={styles.mutedHintAction}>
              {intl.formatMessage({ id: 'post.muted_reveal' })}
            </Text>
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity activeOpacity={0.8} style={styles.hiddenImages} onPress={_onPress}>
        <View style={isDimmed ? styles.dimmedContent : undefined}>
          {isHidden ? (
            hasContentImage && (
              <View style={styles.imageWrapper}>
                <HiddenImagePlaceholder
                  width={imgWidth}
                  height={Math.min(imgHeight, dim.height)}
                  onPress={reveal}
                />
              </View>
            )
          ) : (
            <View style={styles.imageWrapper}>
              <ExpoImage
                ref={imgRef}
                pointerEvents="none"
                source={{ uri: imageUri }}
                style={[
                  styles.thumbnail,
                  {
                    width: imgWidth,
                    height: Math.min(imgHeight, dim.height),
                  },
                ]}
                contentFit={resizeMode}
                autoplay={true}
                onLoad={(evt) => {
                  const loadedRatio = evt.source.width / evt.source.height;

                  if (!Number.isFinite(loadedRatio) || loadedRatio <= 0) {
                    return;
                  }

                  // Keep the cached value width-independent so orientation changes
                  // recalculate height from the current viewport instead of reusing
                  // a previous landscape/portrait pixel height.
                  if (
                    imageLayout.contentKey === contentKey &&
                    Math.abs(loadedRatio - imageRatio) < 0.01
                  ) {
                    return;
                  }

                  setImageLayout({
                    contentKey,
                    ratio: loadedRatio,
                  });
                }}
              />
              {isGif && (
                <View style={styles.gifBadge}>
                  <Text style={styles.gifBadgeText}>GIF</Text>
                </View>
              )}
            </View>
          )}

          <View style={[styles.postDescripton]}>
            {!!_featuredText && <Text style={styles.promotedText}>{_featuredText}</Text>}
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.summary}>{content.summary}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Memoize to prevent re-renders when content hasn't changed
export const PostCardContent = React.memo(PostCardContentComponent, (prevProps, nextProps) => {
  return (
    prevProps.content === nextProps.content &&
    prevProps.nsfw === nextProps.nsfw &&
    prevProps.handleCardInteraction === nextProps.handleCardInteraction
  );
});
