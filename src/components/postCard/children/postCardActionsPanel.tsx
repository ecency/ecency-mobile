import React from 'react';
import get from 'lodash/get';
import { TouchableOpacity, View } from 'react-native';

// Components
import { TextWithIcon } from '../../basicUIElements';

// Styles
import styles from '../styles/postCard.styles';
import { UpvoteButton } from './upvoteButton';
import { PostTypes } from '../../../constants/postTypes';
import { PostCardActionIds } from '../container/postCard';
import ROUTES from '../../../constants/routeNames';

interface Props {
  content: any;
  handleCardInteraction: (
    id: PostCardActionIds,
    payload?: any,
    onCallback?: (data: any) => void,
  ) => void;
}

const PostCardActionsPanelComponent = ({ content, handleCardInteraction }: Props) => {
  const _onVotersPress = () => {
    handleCardInteraction(PostCardActionIds.NAVIGATE, {
      name: ROUTES.SCREENS.VOTERS,
      params: {
        content,
      },
      key: content.permlink,
    });
  };

  const _onReblogsPress = () => {
    const { author, permlink } = content;

    handleCardInteraction(PostCardActionIds.NAVIGATE, {
      name: ROUTES.SCREENS.REBLOGS,
      params: {
        author,
        permlink,
      },
    });
  };

  const _onTipPress = () => {
    handleCardInteraction(PostCardActionIds.TIP);
  };

  return (
    <View style={styles.bodyFooter}>
      <View style={styles.leftFooterWrapper}>
        <UpvoteButton
          content={content}
          isShowPayoutValue={true}
          parentType={PostTypes.POST}
          onUpvotePress={(sourceRef, onVotingStart) =>
            handleCardInteraction(PostCardActionIds.UPVOTE, sourceRef, onVotingStart)
          }
          onPayoutDetailsPress={(sourceRef) =>
            handleCardInteraction(PostCardActionIds.PAYOUT_DETAILS, sourceRef)
          }
        />

        <TouchableOpacity style={styles.commentButton} onPress={_onVotersPress}>
          <TextWithIcon
            iconName="heart-outline"
            iconStyle={styles.commentIcon}
            iconType="MaterialCommunityIcons"
            isClickable
            text={content.stats?.total_votes || 0}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.rightFooterWrapper}>
        <TextWithIcon
          iconName="repeat"
          iconStyle={styles.commentIcon}
          iconType="MaterialIcons"
          isClickable
          text={content.reblogs || ''}
          onPress={_onReblogsPress}
        />
        <TextWithIcon
          iconName="comment-outline"
          iconStyle={styles.commentIcon}
          iconType="MaterialCommunityIcons"
          isClickable
          text={get(content, 'children', 0)}
          onPress={() => handleCardInteraction(PostCardActionIds.REPLY)}
        />
        <TextWithIcon
          iconName="gift-outline"
          iconStyle={styles.commentIcon}
          iconType="MaterialCommunityIcons"
          isClickable
          onPress={_onTipPress}
        />
      </View>
    </View>
  );
};

// Memoize to prevent re-renders when content hasn't changed
export const PostCardActionsPanel = React.memo(
  PostCardActionsPanelComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.content === nextProps.content &&
      prevProps.handleCardInteraction === nextProps.handleCardInteraction
    );
  },
);
