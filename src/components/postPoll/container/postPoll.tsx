import { Text, View } from 'react-native'
import React from 'react'
import { ContentType, PostMetadata } from '../../../providers/hive/hive.types';
import PollChoices from '../children/pollChoices';
import styles from '../styles/postPoll.styles';
import { getTimeFromNow } from '../../../utils/time';
import { pollQueries } from '../../../providers/queries';


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


    if (metadata.content_type !== ContentType.POLL) {
        return null;
    }

    const pollsQuery = pollQueries.useGetPollQuery(author, permlink, metadata)
    const votePollMutation = pollQueries.useVotePollMutation(pollsQuery.data);

    const _handleCastVote = (choiceNum:number) => {
        //TODO: make sure poll data is loaded before casting vote
        votePollMutation.mutate({choiceNum})
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
                loading={pollsQuery.isLoading} 
                handleCastVote={_handleCastVote}/>

        </View>
    )
}
