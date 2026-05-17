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
import { ContentType } from '../../../providers/hive/hive.types';
import { isCommunity } from '../../../utils/communityValidation';

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
  isHideImage: boolean;
  nsfw: string;
  handleCardInteraction: (id: PostCardActionIds, payload?: any) => void;
}

const PostCardContentComponent = ({ content, isHideImage, nsfw, handleCardInteraction }: Props) => {
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

  const _mutedText = useMemo(
    () =>
      _isMuted
        ? _isCommunityPost
          ? intl.formatMessage({ id: 'post.community_muted' })
          : intl.formatMessage({ id: 'post.muted' })
        : '',
    [_isMuted, _isCommunityPost, intl],
  );

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

  const images = useMemo(() => {
    let imgs = { image: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE };
    if (!_isMuted && content.thumbnail) {
      if (nsfw !== '0' && content.nsfw) {
        imgs = { image: NSFW_IMAGE, thumbnail: NSFW_IMAGE };
      } else {
        imgs = { image: content.image, thumbnail: content.thumbnail };
      }
    }
    return imgs;
  }, [_isMuted, content.thumbnail, content.nsfw, content.image, nsfw]);

  const original = content?.json_metadata?.image?.[0];
  const isGif = useMemo(() => /\.gif$/i.test(original), [original]);
  const imageUri = useMemo(() => {
    if (isGif) {
      return proxifyImageSrc(original, Math.round(imgWidth), 0, 'match');
    }
    return images.image;
  }, [isGif, original, images.image, imgWidth]);

  // const _toggleGif = (inView: boolean) => {
  //   if (Platform.OS === 'ios') {
  //     setAutoplay(inView);
  //   } else {
  //     imgRef.current?.[inView ? 'startAnimating' : 'stopAnimating']();
  //   }
  // };

  return (
    <View style={styles.postBodyWrapper}>
      <TouchableOpacity activeOpacity={0.8} style={styles.hiddenImages} onPress={_onPress}>
        {!isHideImage && (
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
          {_isMuted ? (
            <Text style={styles.promotedText}>{_mutedText}</Text>
          ) : (
            <>
              {!!_featuredText && <Text style={styles.promotedText}>{_featuredText}</Text>}
              <Text style={styles.title}>{content.title}</Text>
              <Text style={styles.summary}>{content.summary}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Memoize to prevent re-renders when content hasn't changed
export const PostCardContent = React.memo(PostCardContentComponent, (prevProps, nextProps) => {
  return (
    prevProps.content === nextProps.content &&
    prevProps.isHideImage === nextProps.isHideImage &&
    prevProps.nsfw === nextProps.nsfw &&
    prevProps.handleCardInteraction === nextProps.handleCardInteraction
  );
});
