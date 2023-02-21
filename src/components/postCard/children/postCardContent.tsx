import React from 'react';

import { TouchableOpacity, Text, View } from 'react-native';


// Utils
import FastImage from 'react-native-fast-image';


// Components

// Styles
import styles from '../children/postCardStyles';
import { PostCardActionIds } from '../container/postCardContainer';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import ROUTES from '../../../constants/routeNames';

const dim = getWindowDimensions();
const DEFAULT_IMAGE =
  'https://images.ecency.com/DQmT8R33geccEjJfzZEdsRHpP3VE8pu3peRCnQa1qukU4KR/no_image_3x.png';
const NSFW_IMAGE =
  'https://images.ecency.com/DQmZ1jW4p7o5GyoqWyCib1fSLE2ftbewsMCt2GvbmT9kmoY/nsfw_3x.png';


interface Props {
  content: any,
  isHideImage: boolean,
  thumbHeight: number,
  nsfw: string;
  setThumbHeight: (postPath: string, height: number) => void;
  handleCardInteraction: (id: PostCardActionIds, payload?: any) => void;
}


export const PostCardContent = ({ content, isHideImage, thumbHeight, nsfw, setThumbHeight, handleCardInteraction }: Props) => {

  // const [calcImgHeight, setCalcImgHeight] = useState(thumbHeight || 300);
  const calcImgHeight = 300;
  

  const _onPress = () => {
    handleCardInteraction(PostCardActionIds.NAVIGATE, {
      name: ROUTES.SCREENS.POST,
      params: {
        content: content,
        author: content.author,
        permlink: content.permlink,
      }
    })
  }


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
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.hiddenImages}
        onPress={_onPress}
      >
        {!isHideImage && (
          <FastImage
            source={{ uri: images.image }}
            style={[
              styles.thumbnail,
              {
                width: dim.width - 18,
                height: Math.min(calcImgHeight, dim.height),
              },
            ]}
            resizeMode={
              calcImgHeight < dim.height
                ? FastImage.resizeMode.contain
                : FastImage.resizeMode.cover
            }
            onLoad={(evt) => {
              if (!thumbHeight) {
                const height =
                  (evt.nativeEvent.height / evt.nativeEvent.width) * (dim.width - 18);

                //TODO: put back imgHeight state sets before PR
                // setCalcImgHeight(height);
                // setThumbHeight(content.author + content.permlink, height);
              }
            }}
          />
        )}

        <View style={[styles.postDescripton]}>
          <Text numberOfLines={1} style={styles.title}>{content.title}</Text>
          {
            //TODO: remove numberOfLines prop before PR
          }
          <Text numberOfLines={1} style={styles.summary}>{content.summary}</Text>
        </View>

      </TouchableOpacity>
    </View>
  )
}