import React, { useMemo, useRef, useState } from 'react';
import { TouchableOpacity, Text, View, useWindowDimensions, Platform } from 'react-native';
import { InView } from 'react-native-intersection-observer';
// Utils
import { useIntl } from 'react-intl';
import { proxifyImageSrc } from '@ecency/render-helper';

// Components

// Styles
import { Image as ExpoImage } from 'expo-image';
import styles from '../styles/postCard.styles';
import { PostCardActionIds } from '../container/postCard';
import ROUTES from '../../../constants/routeNames';
import { ContentType } from '../../../providers/hive/hive.types';
import { isCommunity } from '../../../utils/communityValidation';

const DEFAULT_IMAGE =
  'https://images.ecency.com/DQmT8R33geccEjJfzZEdsRHpP3VE8pu3peRCnQa1qukU4KR/no_image_3x.png';
const NSFW_IMAGE =
  'https://images.ecency.com/DQmZ1jW4p7o5GyoqWyCib1fSLE2ftbewsMCt2GvbmT9kmoY/nsfw_3x.png';

interface Props {
  content: any;
  isHideImage: boolean;
  imageRatio: number;
  nsfw: string;
  setImageRatio: (postPath: string, height: number) => void;
  handleCardInteraction: (id: PostCardActionIds, payload?: any) => void;
}

export const PostCardContent = ({
  content,
  isHideImage,
  imageRatio,
  nsfw,
  setImageRatio,
  handleCardInteraction,
}: Props) => {
  const intl = useIntl();
  const dim = useWindowDimensions();
  const imgRef = useRef<ExpoImage>(null);
  const isInViewRef = useRef(false);

  const imgWidth = dim.width - 18;
  const [calcImgHeight, setCalcImgHeight] = useState(imageRatio ? imgWidth / imageRatio : 300);
  const [autoplay, setAutoplay] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  const resizeMode = useMemo(() => {
    return calcImgHeight < dim.height ? 'contain' : 'cover';
  }, [dim.height]);

  // featured text can be used to add more labels in future by just inserting text as array item
  const _isPollPost =
    content?.json_metadata?.content_type === ContentType.POLL && !!content?.json_metadata?.question;

  const _isMuted =
    content?.stats?.gray || content?.author_reputation < 25 || content?.net_rshares < 0;
  const _isCommunityPost = isCommunity(content?.community);

  const _mutedText = _isMuted
    ? _isCommunityPost
      ? intl.formatMessage({ id: 'post.community_muted' })
      : intl.formatMessage({ id: 'post.muted' })
    : '';

  const _featuredText = [
    content?.is_promoted && intl.formatMessage({ id: 'post.promoted' }),
    _isPollPost && intl.formatMessage({ id: 'post.poll' }),
  ]
    .filter((i) => !!i)
    .join(' | ');

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

  let images = { image: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE };
  if (!_isMuted && content.thumbnail) {
    if (nsfw !== '0' && content.nsfw) {
      images = { image: NSFW_IMAGE, thumbnail: NSFW_IMAGE };
    } else {
      images = { image: content.image, thumbnail: content.thumbnail };
    }
  } else {
    images = { image: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE };
  }

  const original = content?.json_metadata?.image?.[0];
  const isGif = useMemo(() => /\.gif$/i.test(original), [original]);
  const imageUri = useMemo(() => {
    if (isGif) {
      // use webp to preserve animation while still serving through proxy
      return proxifyImageSrc(original, Math.round(imgWidth), 0, 'webp');
    }
    return images.image;
  }, [isGif, original, images.image, imgWidth]);

  const _toggleGif = (inView: boolean) => {
    if (Platform.OS === 'ios') {
      setAutoplay(inView);
    } else {
      imgRef.current?.[inView ? 'startAnimating' : 'stopAnimating']();
    }
  };

  const _onInViewChange = (inView: boolean) => {
    isInViewRef.current = inView;
    if (isAnimated) {
      _toggleGif(inView);
    }
  };

  return (
    <View style={styles.postBodyWrapper}>
      <TouchableOpacity activeOpacity={0.8} style={styles.hiddenImages} onPress={_onPress}>
        {!isHideImage && (
          <InView onChange={_onInViewChange}>
            <View style={styles.imageWrapper}>
              <ExpoImage
                ref={imgRef}
                pointerEvents="none"
                source={{ uri: imageUri }}
                style={[
                  styles.thumbnail,
                  {
                    width: imgWidth,
                    height: Math.min(calcImgHeight, dim.height),
                  },
                ]}
                contentFit={resizeMode}
                autoplay={autoplay}
                onLoad={(evt) => {
                  const animated = evt.source.isAnimated;
                  setIsAnimated(animated);
                  if (animated) {
                    _toggleGif(isInViewRef.current);
                  }
                  if (!imageRatio) {
                    const _imgRatio = evt.source.width / evt.source.height;
                    const height = imgWidth / _imgRatio;
                    setCalcImgHeight(height);
                    setImageRatio(content.author + content.permlink, _imgRatio);
                  }
                }}
              />
              {isGif && (
                <View style={styles.gifBadge}>
                  <Text style={styles.gifBadgeText}>GIF</Text>
                </View>
              )}
            </View>
          </InView>
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
