import { View } from 'react-native'
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { ContentType, PostMetadata } from '../../../providers/hive/hive.types';
import { PollChoices, PollHeader, PollVotersModal } from '../children';
import styles from '../styles/postPoll.styles';
import { pollQueries } from '../../../providers/queries';
import { useAppSelector } from '../../../hooks';
import { MainButton, TextButton } from '../..';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../constants/routeNames';
import { useIntl } from 'react-intl';
import { title } from 'process';


export enum PollModes {
    LOADING = 0,
    SELECT = 1,
    RESULT = 2,
}

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

    const intl = useIntl();
    const navigation = useNavigation();


    const currentAccount = useAppSelector(state => state.account.currentAccount)

    const [selection, setSelection] = useState(0);

    const pollsQuery = pollQueries.useGetPollQuery(author, permlink, metadata)
    const votePollMutation = pollQueries.useVotePollMutation(pollsQuery.data);

    const userVote = useMemo(() => {
        if (pollsQuery.data) {
            return pollsQuery.data.poll_voters.find(voter => voter.name === currentAccount.username)
        }
    }, [pollsQuery.data?.poll_voters, currentAccount.username])

    const _hideVotes = useMemo(() => metadata.hide_votes && !!userVote, [metadata, userVote]);
    const _voteDisabled = useMemo(() => metadata.vote_change !== undefined
        ? !metadata.vote_change && !!userVote
        : false, [metadata, userVote]);

    const [mode, setMode] = useState(PollModes.LOADING)

    const _isModeSelect = mode === PollModes.SELECT;


    useEffect(() => {
        if (pollsQuery.isSuccess) {
            setMode(!!userVote ? PollModes.RESULT : PollModes.SELECT);
        }
    }, [pollsQuery.isLoading, userVote])


    const _handleCastVote = () => {
        //TODO: make sure poll data is loaded before casting vote
        votePollMutation.mutate({ choiceNum: selection })
        setSelection(0);
    }


    const _handleChoiceSelect = (choiceNum: number) => {
        setSelection(choiceNum)
    }

    const _handleModeToggle = () => {
        setMode(_isModeSelect ? PollModes.RESULT : PollModes.SELECT);
    }

    const _handleVotersPress = (choiceNum: number) => {
        const _voters = pollsQuery.data?.poll_voters;
        if(!_voters){
            return;
        }

        const _filteredVoters = _voters
            .filter(item => item.choice_num === choiceNum)
            .map(voter => ({account:voter.name}))

        navigation.navigate(ROUTES.MODALS.ACCOUNT_LIST, {
            title: intl.formatMessage({id:'post_poll.voters'}),
            users: _filteredVoters,
        });
       
    }



    const _actionPanel = !_voteDisabled && (
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
            {!_hideVotes && (
                <TextButton
                    text={_isModeSelect ? "View Stats" : "Hide Stats"}
                    onPress={_handleModeToggle}
                    textStyle={styles.viewVotesBtn} />
            )}

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
                voteDisabled={_voteDisabled}
                loading={pollsQuery.isLoading}
                mode={mode}
                selection={selection}
                handleChoiceSelect={_handleChoiceSelect}
                handleVotersPress={_handleVotersPress} />

            {_actionPanel}

        </View>
    )
}
