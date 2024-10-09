import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { CommentsModal, UserAvatar } from '../..';


interface BotCommentsProps {
    comments: any[]
}

export const BotCommentsPreview = ({ comments }:BotCommentsProps) => {

    const commentsModalRef = useRef<typeof CommentsModal>();

    return (
        <View style={{ flexDirection: 'row', padding: 12, paddingTop: 16, alignItems: 'center' }}>

            {comments.map((comment) => {
                return (
                    <TouchableOpacity onPress={() => {
                        if (commentsModalRef.current) {
                            commentsModalRef.current.show(comments)
                        }
                    }} >
                        <View style={{
                            padding: 4,
                            borderRadius: 24,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <UserAvatar
                                username={comment.author}
                                noAction

                            />
                            <View style={{
                                backgroundColor: EStyleSheet.value('$primaryLightBackground'),
                                padding: 4,

                                marginLeft: -8,
                                borderTopRightRadius: 24,
                                borderBottomRightRadius: 24,
                                zIndex: -1
                            }}>
                                <Text style={{ marginHorizontal: 8, color: "white" }} >{comment.author}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )
            })}

            <CommentsModal ref={commentsModalRef} />
        </View>
    )
}