import React, { useState } from 'react';
import { Image, Text, View } from "react-native";
import styles from "../styles/ProposalVoteRequest.styles";
import { TextButton } from "../../../components/buttons";
import { MainButton } from "../../../components/mainButton";
import { useDispatch, useSelector } from "react-redux";
import { showActionModal } from "../../../redux/actions/uiAction";
import { ButtonTypes } from "../../../components/actionModal/container/actionModalContainer";
import { voteProposal } from '../../../providers/hive/dhive';
import { useProposalVotedQuery } from '../../../providers/queries';

const ECENCY_PROPOSAL_ID = 283;

export const ProposalVoteRequest = () => {

    const dispatch = useDispatch();

    const proposalVotedQuery = useProposalVotedQuery(ECENCY_PROPOSAL_ID);

    const isLoggedIn = useSelector(state => state.application.isLoggedIn);
    const pinHash = useSelector(state => state.application.pin);
    const currentAccount = useSelector(state => state.account.currentAccount);

    const [voting, setVoting] = useState(false);
    const [voteCasted, setVoteCasted] = useState(false);

    //assess if user should be promopted to vote proposal
    if(!isLoggedIn || proposalVotedQuery.data){
        return null;
    }

    const _voteAction = async () => {
        setVoting(true);
        await voteProposal(currentAccount, pinHash, ECENCY_PROPOSAL_ID)
        setVoting(false);
        setVoteCasted(true);
    }


    const _remindLater = () => {
        dispatch(showActionModal({
            title: "Dismiss Vote Request",
            buttons: [
                {
                    text: "Forever",
                    type: ButtonTypes.CANCEL,
                    onPress: () => {
                        console.log('Ignore');
                    },
                },
                {
                    text: "Remind Later",
                    onPress: () => {
                        console.log('remind later');
                    },
                },
            ],
        }))
    };


    const _actionPanel = () => {
        return (
            <View style={styles.actionPanel}>
                <MainButton
                    onPress={_voteAction}
                    style={{ height: 40 }}
                    textStyle={styles.voteBtnTitle}
                    text={"Cast My Vote"}
                    isLoading={voting}

                />
                <TextButton
                    onPress={_remindLater}
                    style={{ marginLeft: 8 }}
                    text={"Dismiss"}
                />
            </View>
        );
    }

    const title = voteCasted ? "We are grateful!" : "Enjoying Ecency!";
    const body = voteCasted ? "Your support means everything to us" : "Support proposal by voting, be part of our continuous efforts to improve experience on Ecency."

    return (
        <View style={styles.container}>
            <View style={styles.content} >
                <View style={{ flex: 1 }}>
                    <Text style={styles.title} >
                        {title}
                    </Text>

                    <Text style={styles.description} >
                        {body}
                    </Text>
                </View>

                <Image
                    resizeMode="contain"
                    style={{ width: 56, marginHorizontal: 12 }}
                    source={require('../../../assets/ecency_logo_transparent.png')}
                />

            </View>
            {!voteCasted && _actionPanel()}
        </View>
    )
};