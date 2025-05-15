import React, { useMemo } from 'react';
import get from 'lodash/get';
import { View } from 'react-native';

// Components
import { IntlShape } from 'react-intl';
import { PostHeaderDescription } from '../../postElements';
import { TextWithIcon } from '../../basicUIElements';
import { Icon } from '../../icon';

// Styles
import styles from '../styles/children.styles';
import { IconButton } from '../..';
import { getTimeFromNow } from '../../../utils/time';
import { PostCardActionIds } from '../container/postCard';
import { ContentType } from '../../../providers/hive/hive.types';
import CrossPostLabel from './crossPostLabel';

interface Props {
  intl: IntlShape;
  content: any;
  isHideImage: boolean;
  pageType?: 'main' | 'community' | 'profile' | 'ownProfile';
  handleCardInteraction: (id: PostCardActionIds, payload?: any) => void;
}

export const PostCardHeader = ({
  intl,
  content,
  pageType,
  isHideImage,
  handleCardInteraction,
}: Props) => {
  const rebloggedBy = get(content, 'reblogged_by[0]', null);
  const dateString = useMemo(() => getTimeFromNow(content?.created), [content]);
  const _isPollPost =
    content?.json_metadata?.content_type === ContentType.POLL && !!content?.json_metadata?.question;

  const _handleOnTagPress = (navParams) => {
    handleCardInteraction(PostCardActionIds.NAVIGATE, navParams);
  };

  // handle pinned status
  const _isPinned =
    pageType === 'community'
      ? content?.stats?.is_pinned
      : pageType === 'profile' || pageType === 'ownProfile'
      ? content?.stats?.is_pinned_blog
      : false;

  return (
    <>
      {!!rebloggedBy && (
        <TextWithIcon
          wrapperStyle={styles.reblogWrapper}
          text={`${intl.formatMessage({ id: 'post.reblogged' })} ${rebloggedBy}`}
          iconType="MaterialIcons"
          iconName="repeat"
          iconSize={16}
          textStyle={styles.repostText}
          isClickable={true}
          onPress={() => handleCardInteraction(PostCardActionIds.USER, rebloggedBy)}
        />
      )}

      <CrossPostLabel
        crosspostMeta={content?.crosspostMeta}
        handleCardInteraction={handleCardInteraction}
      />

      <View style={styles.bodyHeader}>
        <PostHeaderDescription
          date={dateString}
          isHideImage={isHideImage}
          name={get(content, 'author')}
          profileOnPress={() => handleCardInteraction(PostCardActionIds.USER, content.author)}
          handleOnTagPress={_handleOnTagPress}
          reputation={get(content, 'author_reputation')}
          size={50}
          content={content}
          rebloggedBy={rebloggedBy}
          isPromoted={get(content, 'is_promoted')}
        />

        <View style={styles.headerIconsWrapper}>
          {_isPollPost && (
            <Icon style={styles.pollPostIcon} size={16} name="chart" iconType="SimpleLineIcons" />
          )}
          {_isPinned && (
            <Icon
              style={styles.pushPinIcon}
              size={20}
              name="pin"
              iconType="MaterialCommunityIcons"
            />
          )}
        </View>

        <View style={styles.dropdownWrapper}>
          <IconButton
            style={styles.optionsIconContainer}
            iconStyle={styles.optionsIcon}
            iconType="MaterialCommunityIcons"
            name="dots-vertical"
            onPress={() => handleCardInteraction(PostCardActionIds.OPTIONS)}
            size={24}
          />
        </View>
      </View>
    </>
  );
};
