import { Text, View } from 'react-native'
import React from 'react'
import { ContentType, PostMetadata } from '../../../providers/hive/hive.types';
import PollChoices from '../children/pollChoices';
import styles from '../styles/postPoll.styles';
import { getTimeFromNow } from '../../../utils/time';
import { useQuery } from '@tanstack/react-query';
import { getPollData } from '../../../providers/polls/polls';
import { Poll } from '../../../providers/polls/polls.types';


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

    const pollsQuery = useQuery<Poll>(['5678hretg.kjklj', 'raalsdf'], () => getPollData(author, permlink))

    if (metadata.content_type !== ContentType.POLL) {
        return null;
    }

    const { end_time, question, choices: metaChoices } = metadata;
    const formattedEndTime = 'Expires ' + getTimeFromNow(new Date(end_time * 1000))
    return (
        <View style={styles.container}>
            <View style={styles.headerWrapper}>
                <Text style={styles.question}>{question}</Text>
                <Text>{formattedEndTime}</Text>
            </View>

            <PollChoices
                metaChoices={metaChoices}
                choices={pollsQuery.data?.poll_choices}
                loading={pollsQuery.isLoading} />

        </View>
    )
}
