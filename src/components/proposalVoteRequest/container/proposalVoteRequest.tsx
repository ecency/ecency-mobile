import React, { useState } from 'react';
import { Image, Text, View } from "react-native";
import styles from "../styles/ProposalVoteRequest.styles";
import { TextButton } from "../../../components/buttons";
import { MainButton } from "../../../components/mainButton";
import { useDispatch } from "react-redux";
import { handleDeepLink, showActionModal } from "../../../redux/actions/uiAction";
import { ButtonTypes } from "../../../components/actionModal/container/actionModalContainer";
import { delay } from '../../../utils/editor';


const HIVE_VOTE_OPS = "hive://sign/op/WyJ1cGRhdGVfcHJvcG9zYWxfdm90ZXMiLHsidm90ZXIiOiAiX19zaWduZXIiLCJwcm9wb3NhbF9pZHMiOiBbMjgzXSwiYXBwcm92ZSI6dHJ1ZSwiZXh0ZW5zaW9ucyI6IFtdfV0."



export const ProposalVoteRequest = () => {

    const dispatch = useDispatch();

    const [voting, setVoting] = useState(false);
    const [voteCasted, setVoteCasted] = useState(false);

    const _voteAction = async () => {
        setVoting(true);
        // dispatch(handleDeepLink(HIVE_VOTE_OPS));
        await delay(800);

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