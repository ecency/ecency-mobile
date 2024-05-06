import { View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { ContentType, PostMetadata } from '../../../providers/hive/hive.types';
import { PollChoices, PollHeader } from '../children';
import styles from '../styles/postPoll.styles';
import { getTimeFromNow } from '../../../utils/time';
import { pollQueries } from '../../../providers/queries';
import { useAppSelector } from '../../../hooks';
import { MainButton, PopoverWrapper, TextButton, Tooltip } from '../..';


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

    const currentAccount = useAppSelector(state => state.account.currentAccount)

    const [selection, setSelection] = useState(0);


    const pollsQuery = pollQueries.useGetPollQuery(author, permlink, metadata)
    const votePollMutation = pollQueries.useVotePollMutation(pollsQuery.data);

    const userVote = useMemo(() => {
        if (pollsQuery.data) {
            return pollsQuery.data.poll_voters.find(voter => voter.name === currentAccount.username)
        }
    }, [pollsQuery.data?.poll_voters, currentAccount.username])



    const _handleCastVote = () => {
        //TODO: make sure poll data is loaded before casting vote
        votePollMutation.mutate({ choiceNum:selection })
        setSelection(0);
    }


    const _handleChoiceSelect = (choiceNum:number) => {
        setSelection(choiceNum)
    }


    const _actionPanel = (
        <View style={styles.actionPanel}>
            <MainButton
                style={styles.voteButton}
                iconName="chart"
                iconType="SimpleLineIcons"
                iconColor="white"
                iconStyle={{ fontSize: 16 }}
                onPress={_handleCastVote}
                text={"Vote"}
                isDisable={!selection}
                
            />
            <TextButton
                text={"View Votes"}
                onPress={()=>{throw new Error("Implement view votes")}}
                textStyle={styles.viewVotesBtn} />
        </View>

    )


    return (
        <View style={styles.container}>
            <PollHeader
                endTime={metadata.end_time}
                question={metadata.question} />

            <PollChoices
                metadata={metadata}
                choices={pollsQuery.data?.poll_choices}
                userVote={userVote}
                loading={pollsQuery.isLoading}
                handleCastVote={_handleChoiceSelect} />

            {_actionPanel}

        </View>
    )
}
