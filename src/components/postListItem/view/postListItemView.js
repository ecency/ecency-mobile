import React, { useRef, useState, useEffect, Fragment } from 'react';
import ActionSheet from 'react-native-actionsheet';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { injectIntl } from 'react-intl';
import ImageSize from 'react-native-image-size';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Components
import { PostHeaderDescription } from '../../postElements';
import { IconButton } from '../../iconButton';
import ProgressiveImage from '../../progressiveImage';

// Styles
import styles from './postListItemStyles';

// Defaults
const DEFAULT_IMAGE =
  'https://images.ecency.com/DQmT8R33geccEjJfzZEdsRHpP3VE8pu3peRCnQa1qukU4KR/no_image_3x.png';

const dim = Dimensions.get('window');

const PostListItemView = ({
  title,
  summary,
  mainTag,
  username,
  reputation,
  created,
  image,
  thumbnail,
  handleOnPressItem,
  handleOnRemoveItem,
  id,
  intl,
  isFormatedDate,
}) => {
  const actionSheet = useRef(null);
  const [calcImgHeight, setCalcImgHeight] = useState(300);
  // Component Life Cycles
  useEffect(() => {
    let _isMounted = false;
    if (image) {
      if (!_isMounted) {
        ImageSize.getSize(thumbnail.uri).then((size) => {
          setCalcImgHeight((size.height / size.width) * dim.width);
        });
      }
    }
    return () => {
      _isMounted = true;
    };
  }, []);
  // Component Functions

  return (
    <Fragment>
      <View style={styles.container}>
        <View style={styles.header}>
          <PostHeaderDescription
            date={isFormatedDate ? created : getTimeFromNow(created, true)}
            name={username}
            reputation={reputation}
            size={36}
            tag={mainTag}
          />
          <IconButton
            backgroundColor="transparent"
            name="delete"
            iconType="MaterialIcons"
            size={20}
            onPress={() => actionSheet.current.show()}
            style={[styles.rightItem]}
            color="#c1c5c7"
          />
        </View>
        <View style={styles.body}>
          <TouchableOpacity onPress={() => handleOnPressItem(id)}>
            <ProgressiveImage
              source={image}
              thumbnailSource={thumbnail}
              style={[
                styles.thumbnail,
                { width: dim.width - 16, height: Math.min(calcImgHeight, dim.height) },
              ]}
            />
            <View style={[styles.postDescripton]}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.summary}>{summary}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ActionSheet
        ref={actionSheet}
        options={[
          intl.formatMessage({ id: 'alert.delete' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'alert.remove_alert' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          if (index === 0) {
            handleOnRemoveItem(id);
          }
        }}
      />
    </Fragment>
  );
};

export default injectIntl(PostListItemView);
