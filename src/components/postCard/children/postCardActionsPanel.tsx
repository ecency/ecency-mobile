import React from 'react';
import get from 'lodash/get';
import { TouchableOpacity, View } from 'react-native';

// Components
import { TextWithIcon } from '../../basicUIElements';

// Styles
import styles from './postCardStyles';
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

export const PostCardActionsPanel = ({ content, handleCardInteraction }: Props) => {
  const activeVotes = content?.active_votes || [];

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
    if (content.reblogs > 0) {
      handleCardInteraction(PostCardActionIds.NAVIGATE, {
        name: ROUTES.SCREENS.REBLOGS,
        params: {
          author: content.author,
          permlink: content.permlink,
          reblogs,
        },
      });
    }
  };

  return (
    <View style={styles.bodyFooter}>
      <View style={styles.leftFooterWrapper}>
        <UpvoteButton
          content={content}
          activeVotes={activeVotes}
          isShowPayoutValue={true}
          parentType={PostTypes.POST}
          onUpvotePress={(anchorRect, onVotingStart) =>
            handleCardInteraction(PostCardActionIds.UPVOTE, anchorRect, onVotingStart)
          }
          onPayoutDetailsPress={(anchorRect) =>
            handleCardInteraction(PostCardActionIds.PAYOUT_DETAILS, anchorRect)
          }
        />

        <TouchableOpacity style={styles.commentButton} onPress={_onVotersPress}>
          <TextWithIcon
            iconName="heart-outline"
            iconStyle={styles.commentIcon}
            iconType="MaterialCommunityIcons"
            isClickable
            text={activeVotes.length}
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
      </View>
    </View>
  );
};
