import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAppSelector } from "../../../hooks";
import { PulseAnimation } from "../../animations";

import { isVoted as isVotedFunc, isDownVoted as isDownVotedFunc } from '../../../utils/postParser';

import Icon from "../../icon";
import styles from './children.styles';
import { TextButton } from "../../buttons";
import { FormattedCurrency } from "../../formatedElements";

interface UpvoteButtonProps {
    content:any,
    isVoting:boolean,
    activeVotes:any[],
    isShowPayoutValue?:boolean,
    boldPayout?:boolean
}

export const UpvoteButton = ({
    content,
    isVoting,
    activeVotes,
    isShowPayoutValue,
    boldPayout
}:UpvoteButtonProps) => {

    const currentAccount = useAppSelector((state => state.account.currentAccount));


    const [isVoted, setIsVoted] = useState(null);
    const [isDownVoted, setIsDownVoted] = useState(null);



    useEffect(() => {
        let _isMounted = true;

        const _calculateVoteStatus = async () => {

            //TODO: do this heavy lifting during parsing or react-query/cache response
            const _isVoted = await isVotedFunc(activeVotes, currentAccount?.name);
            const _isDownVoted = await isDownVotedFunc(activeVotes, currentAccount?.name);

            if (_isMounted) {
                setIsVoted(_isVoted && parseInt(_isVoted, 10) / 10000);
                setIsDownVoted(_isDownVoted && (parseInt(_isDownVoted, 10) / 10000) * -1);
            }
        };

        _calculateVoteStatus();
        return () => { _isMounted = false };
    }, [activeVotes]);



    const _onPress = () => {
        Alert.alert("upvote icon press")
    }


    const isDeclinedPayout = content?.is_declined_payout;
    const totalPayout = content?.total_payout;
    const maxPayout = content?.max_payout;

    const payoutLimitHit = totalPayout >= maxPayout;
    const _shownPayout = payoutLimitHit && maxPayout > 0 ? maxPayout : totalPayout;

    const buttonRef = useRef(null);


    let iconName = 'upcircleo';
    const iconType = 'AntDesign';
    let downVoteIconName = 'downcircleo';
  
    if (isVoted) {
      iconName = 'upcircle';
    }
  
    if (isDownVoted) {
      downVoteIconName = 'downcircle';
    }



    return (
        <View style={styles.container}>
            <TouchableOpacity
                ref={buttonRef}
                onPress={_onPress}
                style={styles.upvoteButton}
                disabled={!currentAccount}
            >
                <Fragment>
                    {isVoting ? (
                        <View style={{ width: 19 }}>
                            <PulseAnimation
                                color="#357ce6"
                                numPulses={1}
                                diameter={20}
                                speed={100}
                                duration={1500}
                                isShow={!isVoting}
                            />
                        </View>
                    ) : (
                        <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 5 }}>
                            <Icon
                                style={[styles.upvoteIcon, isDownVoted && { color: '#ec8b88' }]}
                                active={!currentAccount}
                                iconType={iconType}
                                name={isDownVoted ? downVoteIconName : iconName}
                            />
                        </View>
                    )}
                </Fragment>
            </TouchableOpacity>
            <View style={styles.payoutTextButton}>
                {isShowPayoutValue && (
                    <TextButton
                        style={styles.payoutTextButton}
                        textStyle={[
                            styles.payoutValue,
                            isDeclinedPayout && styles.declinedPayout,
                            boldPayout && styles.boldText,
                        ]}
                        text={<FormattedCurrency value={_shownPayout || '0.000'} />}
                        onPress={() => {
                           Alert.alert("show payout details")
                        }}
                    />
                )}
            </View>
        </View>

    )
}
