import { View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import styles from '../styles/engineHeader.styles';
import { claimRewards, fetchUnclaimedRewards } from '../../../providers/hive-engine/hiveEngine';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { TokenStatus } from '../../../providers/hive-engine/hiveEngine.types';
import { TokensSelectModal } from './tokensSelectModal';
import { showActionModal } from '../../../redux/actions/uiAction';
import { TextButton } from '../../../components';

export interface EngineHeaderProps {
    refreshing: boolean
}

export const EngineHeader = ({ refreshing }: EngineHeaderProps) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const currentAccount = useAppSelector(state => state.account.currentAccount);
    const pinHash = useAppSelector(state=>state.application.pin);

    const firstRenderRef = useRef(true);
    const tokensSelectRef = useRef(null);

    const [isClaiming, setIsClaiming] = useState(false);
    const [claimExpected, setClaimExpected] = useState(false);
    const [unclaimedEngineRewards, setUnclaimedEngineRewards] = useState<TokenStatus[]>([]);

    //side-effectsf
    useEffect(() => {
        if (refreshing || firstRenderRef.current) {
            _fetchUnclaimedRewards()
            firstRenderRef.current = false;
        }
    }, [refreshing]);

    useEffect(() => {
        if (!isClaiming && claimExpected) {
            setClaimExpected(false);
        }
    }, [isClaiming]);


    const _fetchUnclaimedRewards = async () => {
        const _engineRewards = await fetchUnclaimedRewards(currentAccount.username)
        setUnclaimedEngineRewards(_engineRewards)
    }


    const _claimRewards = async () => {
        try{
            setIsClaiming(true)
            await claimRewards(unclaimedEngineRewards.map(token=>token.symbol), currentAccount, pinHash);
            await _fetchUnclaimedRewards()
            setIsClaiming(false);
        } catch(err){
            setIsClaiming(false)
        }

    }



    return (
        <View style={styles.engineHeaderContainer}>

            <TextButton
                text={"Manage Engine Tokens"}
                textStyle={styles.engineBtnText}
                style={styles.engineBtnContainer}
                onPress={() => {
                    if (tokensSelectRef.current) {
                        tokensSelectRef.current.showModal();
                    }
                }}
            />
            <TextButton
                text={`Claim ${unclaimedEngineRewards.length} Rewards`}
                textStyle={styles.engineBtnText}
                style={styles.engineBtnContainer}
                onPress={() => {
                    dispatch(showActionModal({
                        title: "Claim Engine Tokens",
                        body: unclaimedEngineRewards.map(tokenStatus => `${tokenStatus.symbol}: ${tokenStatus.pendingRewards}`).join('\n'),
                        buttons: [
                            {
                                text: intl.formatMessage({ id: 'alert.cancel' }),
                                onPress: () => console.log('Cancel'),
                            },
                            {
                                text: intl.formatMessage({ id: 'alert.confirm' }),
                                onPress: _claimRewards,
                            },
                        ],
                    }))
                }}
            />
            <TokensSelectModal
                ref={tokensSelectRef}
            />
        </View>
    );
};
