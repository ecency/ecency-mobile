import React from 'react';
import get from 'lodash/get';
import { TouchableOpacity, View } from 'react-native';


// Components
import { TextWithIcon } from '../../basicUIElements';

// Styles
import styles from '../children/postCardStyles';
import { UpvoteButton } from '../children/upvoteButton';
import { PostTypes } from '../../../constants/postTypes';
import { PostCardActionIds } from '../container/postCard';
import ROUTES from '../../../constants/routeNames';

interface Props {
    content: any;
    reblogs: any[];
    handleCardInteraction: (id: PostCardActionIds, payload?: any) => void;
}


export const PostCardActionsPanel = ({
    content,
    reblogs,
    handleCardInteraction
}: Props) => {

    const activeVotes = content?.active_votes || [];

    const _onVotersPress = () => {
        handleCardInteraction(PostCardActionIds.NAVIGATE, {
            name: ROUTES.SCREENS.VOTERS,
            params: {
                content: content,
            },
            key: content.permlink,
        });
    }


    const _onReblogsPress = () => {
        if (reblogs?.length) {
            handleCardInteraction(PostCardActionIds.NAVIGATE, {
                name: ROUTES.SCREENS.REBLOGS,
                params: {
                    reblogs: reblogs,
                }
            });
        }
    }

    return (
        <View style={styles.bodyFooter}>
            <View style={styles.leftFooterWrapper}>
                <UpvoteButton
                    isVoting={false}
                    content={content}
                    activeVotes={activeVotes}
                    isShowPayoutValue={true}
                    parentType={PostTypes.POST}
                    onUpvotePress={(anchorRect) => handleCardInteraction(PostCardActionIds.UPVOTE, anchorRect)}
                    onPayoutDetailsPress={(anchorRect) => handleCardInteraction(PostCardActionIds.PAYOUT_DETAILS, anchorRect)}
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
                    text={get(reblogs, 'length', 0)}
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

    )
}