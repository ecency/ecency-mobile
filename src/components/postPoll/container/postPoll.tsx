import React, { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import { ContentType, PollPreferredInterpretation, PostMetadata } from '../../../providers/hive/hive.types';
import { PollChoices, PollHeader } from '../children';
import styles from '../styles/postPoll.styles';
import { pollQueries } from '../../../providers/queries';
import { useAppSelector } from '../../../hooks';
import { MainButton, TextButton } from '../..';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../constants/routeNames';
import { useIntl } from 'react-intl';
import { getDaysPassedSince } from '../../../utils/time';


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
    const isLoggedIn = useAppSelector(state => state.application.isLoggedIn);

    const [selection, setSelection] = useState(0);
    const [mode, setMode] = useState(PollModes.LOADING)
    const [interpretation, setInterpretation] = useState(metadata.preferred_interpretation || PollPreferredInterpretation.NUMBER_OF_VOTES);

    const _isModeSelect = mode === PollModes.SELECT;
    const _isInterpretationToken = interpretation === PollPreferredInterpretation.TOKENS;
    const _isPollAuthor = author === currentAccount?.username;

    const pollsQuery = pollQueries.useGetPollQuery(author, permlink, metadata)
    const votePollMutation = pollQueries.useVotePollMutation(pollsQuery.data);
    const _accAgeLimit = pollsQuery.data?.filter_account_age_days || metadata.filters?.account_age || 0;


    const userVote = useMemo(() => {
        if (pollsQuery.data) {
            return pollsQuery.data.poll_voters.find(voter => voter.name === currentAccount.username)
        }
    }, [pollsQuery.data?.poll_voters, currentAccount.username])

    const _expired = useMemo(
        () => new Date(metadata.end_time * 1000).getTime() < new Date().getTime(),
        [metadata]);


    const _hideVoters = useMemo(() => metadata.hide_votes && !_isPollAuthor, [metadata, _isPollAuthor]);
    const _voteDisabled = useMemo(() => {

        const _ageLimitApllies = currentAccount && _accAgeLimit
            ? getDaysPassedSince(currentAccount.created) < _accAgeLimit : false;

        const _noVoteChange = metadata.vote_change !== undefined
            ? !metadata.vote_change && !!userVote
            : false;

        return _expired || !isLoggedIn || _noVoteChange || _ageLimitApllies
    }, [metadata, userVote]);




    useEffect(() => {
        if (pollsQuery.isSuccess) {
            setMode(!!userVote || _expired ? PollModes.RESULT : PollModes.SELECT);
            setInterpretation(pollsQuery.data?.preferred_interpretation || PollPreferredInterpretation.NUMBER_OF_VOTES)
        }
    }, [pollsQuery.isLoading, userVote])


    const _handleCastVote = () => {
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
        if (!_voters) {
            return;
        }

        const _filteredVoters = _voters
            .filter(item => item.choice_num === choiceNum)
            .map(voter => ({ account: voter.name }))

        navigation.navigate(ROUTES.MODALS.ACCOUNT_LIST, {
            title: intl.formatMessage({ id: 'post_poll.voters' }),
            users: _filteredVoters,
        });

    }


    const _switchInterpretation = () => {
        setInterpretation(_isInterpretationToken
            ? PollPreferredInterpretation.NUMBER_OF_VOTES
            : PollPreferredInterpretation.TOKENS
        )
    }

    const _authorPanel = _isPollAuthor && (
        <View style={styles.authorPanel}>
            <TextButton
                text={intl.formatMessage({
                    id: _isModeSelect ? "post_poll.view_stats" : "post_poll.hide_stats"
                })}
                onPress={_handleModeToggle}
                textStyle={styles.viewVotesBtn} />

            {!_isModeSelect && (
                <TextButton
                    text={intl.formatMessage({
                        id: _isInterpretationToken ? "post_poll.interpret_vote" : "post_poll.interpret_token"
                    })}
                    textStyle={styles.viewVotesBtn}
                    onPress={_switchInterpretation} />
            )}

        </View>
    )

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

        </View>
    )


    return (
        <View style={styles.container}>
            <PollHeader
                metadata={metadata}
                expired={_expired} />

            <PollChoices
                metadata={metadata}
                choices={pollsQuery.data?.poll_choices}
                userVote={userVote}
                voteDisabled={_voteDisabled}
                loading={pollsQuery.isLoading}
                mode={mode}
                selection={selection}
                hideVoters={_hideVoters}
                interpretationToken={interpretation === PollPreferredInterpretation.TOKENS}
                handleChoiceSelect={_handleChoiceSelect}
                handleVotersPress={_handleVotersPress} />

            {_authorPanel}
            {_actionPanel}

        </View>
    )
}
