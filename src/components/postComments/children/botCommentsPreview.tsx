import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { CommentsModal, Icon, UserAvatar } from '../..';
import styles from '../styles/botCommentsPreview.styles';
import EStyleSheet from 'react-native-extended-stylesheet';

interface BotCommentsProps {
    comments: any[];
}

export const BotCommentsPreview = ({ comments }: BotCommentsProps) => {
    const commentsModalRef = useRef<typeof CommentsModal>();

    if (!comments?.length) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.labelWrapper}>
                <Text style={styles.label}>{"Bot Comments"}</Text>
                <Icon
                    iconType="AntDesign"
                    name='right'
                    size={14}
                    color={EStyleSheet.value('$primaryDarkText')}
                />
            </View>
            <TouchableOpacity
                onPress={() => {
                    if (commentsModalRef.current) {
                        commentsModalRef.current.show(comments);
                    }
                }}
            >
                <View style={styles.botAvatarsWrapper} >
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
