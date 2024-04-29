import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ContentType, PostMetadata } from '../../providers/hive/hive.types';

interface PostPoll {
    author: string;
    permlink: string;
    metadata: PostMetadata;
}

export const PostPoll = ({
    author,
    permlink,
    metadata
}: PostPoll) => {

    if(metadata.content_type !== ContentType.POLL){
        return null;
    }

    return (
        <View>
            <Text>{author}</Text>
            <Text>{permlink}</Text>
            <Text>{JSON.stringify(metadata, null, '\t')}</Text>
        </View>
    )
}

const styles = StyleSheet.create({})