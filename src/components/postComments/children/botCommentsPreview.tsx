import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { CommentsModal, Icon, UserAvatar } from '../..';
import styles from '../styles/botCommentsPreview.styles';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../constants/routeNames';

interface BotCommentsProps {
    comments: any[];
}

export const BotCommentsPreview = ({ comments }: BotCommentsProps) => {
    const intl = useIntl();
    const navigation = useNavigation();

    const commentsModalRef = useRef<typeof CommentsModal>();

    if (!comments?.length) {
        return null;
    }

    const _onPress = () => {
        navigation.navigate({
            name: ROUTES.MODALS.BOT_COMMENTS,
            params: {
                comments
            }
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.labelWrapper}>
                <Text style={styles.label}>
                    {intl.formatMessage({ id: 'comments.bot_comments' })}
                </Text>
                <Icon
                    iconType="AntDesign"
                    name="right"
                    size={14}
                    color={EStyleSheet.value('$primaryDarkText')}
                />
            </View>
            <TouchableOpacity
                onPress={_onPress}
            >
                <View style={styles.botAvatarsWrapper}>
                    {comments.map((comment) => {
                        return (
                            <View style={styles.item}>
                                <UserAvatar username={comment.author} noAction />
                            </View>
                        );
                    })}
                </View>
            </TouchableOpacity>

            <CommentsModal ref={commentsModalRef} />
        </View>
    );
};
