import React, { useMemo } from 'react';
import get from 'lodash/get';
import { View } from 'react-native';

// Components
import { PostHeaderDescription } from '../../postElements';
import { TextWithIcon } from '../../basicUIElements';
import { Icon } from '../../icon';

// Styles
import styles from './postCardStyles';
import { IconButton } from '../..';
import { getTimeFromNow } from '../../../utils/time';
import { IntlShape } from 'react-intl';
import { PostCardActionIds } from '../container/postCard';


interface Props {
  intl:IntlShape;
  content: any;
  isHideImage: boolean;
  handleCardInteraction: (id: PostCardActionIds, payload?: any) => void
}

export const PostCardHeader = ( {intl, content, isHideImage, handleCardInteraction }: Props) => {

  const rebloggedBy = get(content, 'reblogged_by[0]', null);
  const dateString = useMemo(() => getTimeFromNow(content?.created), [content])

  const _handleOnTagPress = (navParams) => {
    handleCardInteraction(PostCardActionIds.NAVIGATE, navParams)
  }

  return (
    <>
      {!!rebloggedBy && (
        <TextWithIcon
          wrapperStyle={styles.reblogWrapper}
          text={`${intl.formatMessage({ id: 'post.reblogged' })} ${rebloggedBy}`}
          iconType="MaterialIcons"
          iconName="repeat"
          iconSize={16}
          textStyle={styles.reblogText}
          isClickable={true}
          onPress={() => handleCardInteraction(PostCardActionIds.USER, rebloggedBy)}
        />
      )}

      <View style={styles.bodyHeader}>
        <PostHeaderDescription
          date={dateString}
          isHideImage={isHideImage}
          name={get(content, 'author')}
          profileOnPress={() => handleCardInteraction(PostCardActionIds.USER, content.author)}
          handleOnTagPress = {_handleOnTagPress}
          reputation={get(content, 'author_reputation')}
          size={50}
          content={content}
          rebloggedBy={rebloggedBy}
          isPromoted={get(content, 'is_promoted')}
        />
        {(content?.stats?.is_pinned || content?.stats?.is_pinned_blog) && (
          <Icon style={styles.pushPinIcon} size={20} name="pin" iconType="MaterialCommunityIcons" />
        )}
        <View style={styles.dropdownWrapper}>
          <IconButton
            style={styles.optionsIconContainer}
            iconStyle={styles.optionsIcon}
            iconType="MaterialCommunityIcons"
            name="dots-vertical"
            onPress={() => handleCardInteraction(PostCardActionIds.OPTIONS)}
            size={28}
          />
        </View>
      </View>
    </>
  )
}