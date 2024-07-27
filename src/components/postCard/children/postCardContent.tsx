import React, { useMemo, useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
// Utils
import { Image as ExpoImage } from 'expo-image';
import { useIntl } from 'react-intl';

// Components

// Styles
import styles from './postCardStyles';
import { PostCardActionIds } from '../container/postCard';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import ROUTES from '../../../constants/routeNames';
import { ContentType } from '../../../providers/hive/hive.types';

const dim = getWindowDimensions();
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
  const imgWidth = dim.width - 18;
  const [calcImgHeight, setCalcImgHeight] = useState(imageRatio ? imgWidth / imageRatio : 300);

  const resizeMode = useMemo(() => {
    return calcImgHeight < dim.height ? 'contain' : 'cover';
  }, [dim.height]);

  // featured text can be used to add more labels in future by just inserting text as array item
  const _isPollPost =
    content?.json_metadata?.content_type === ContentType.POLL && !!content?.json_metadata?.question;

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
  if (content.thumbnail) {
    if (nsfw !== '0' && content.nsfw) {
      images = { image: NSFW_IMAGE, thumbnail: NSFW_IMAGE };
    } else {
      images = { image: content.image, thumbnail: content.thumbnail };
    }
  } else {
    images = { image: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE };
  }

  return (
    <View style={styles.postBodyWrapper}>
      <TouchableOpacity activeOpacity={0.8} style={styles.hiddenImages} onPress={_onPress}>
        {!isHideImage && (
          <ExpoImage
            source={{ uri: images.image }}
            style={[
              styles.thumbnail,
              {
                width: imgWidth,
                height: Math.min(calcImgHeight, dim.height),
              },
            ]}
            contentFit={resizeMode}
            onLoad={(evt) => {
              if (!imageRatio) {
                const _imgRatio = evt.source.width / evt.source.height;
                const height = imgWidth / _imgRatio;
                setCalcImgHeight(height);
                setImageRatio(content.author + content.permlink, _imgRatio);
              }
            }}
          />
        )}

        <View style={[styles.postDescripton]}>
          {!!_featuredText && <Text style={styles.promotedText}>{_featuredText}</Text>}
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.summary}>{content.summary}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
