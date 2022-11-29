import { View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import styles from '../styles/engineHeader.styles';
import { fetchUnclaimedRewards } from '../../../providers/hive-engine/hiveEngine';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { TokenStatus } from '../../../providers/hive-engine/hiveEngine.types';
import { TokensSelectModal } from './tokensSelectModal';
import { showActionModal } from '../../../redux/actions/uiAction';
import { TextButton } from '../../../components';
import { claimRewards } from '../../../providers/hive-engine/hiveEngineActions';

export interface EngineHeaderProps {
    refreshing: boolean
}

export const EngineHeader = ({ refreshing }: EngineHeaderProps) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const currentAccount = useAppSelector(state => state.account.currentAccount);
    const pinHash = useAppSelector(state => state.application.pin);

    const firstRenderRef = useRef(true);
    const tokensSelectRef = useRef(null);

    const [isClaiming, setIsClaiming] = useState(false);
    const [claimExpected, setClaimExpected] = useState(false);
    const [pendingRewards, setPendingRewards] = useState<TokenStatus[]>([]);

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
        setPendingRewards(_engineRewards)
    }


    const _claimRewards = async () => {
        try {
            setIsClaiming(true)
            await claimRewards(pendingRewards.map(token => token.symbol), currentAccount, pinHash);
            setPendingRewards([]);
            setIsClaiming(false);
        } catch (err) {
            setIsClaiming(false)
        }
    }


    const _claimRewardsPress = async () => {
        dispatch(showActionModal({
            title: "Claim Engine Tokens",
            body: pendingRewards.map(tokenStatus => `${tokenStatus.symbol}: ${tokenStatus.pendingRewards}`).join('\n'),
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
    }




    const _hasUnclaimedRewards = pendingRewards.length > 0;

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
            {_hasUnclaimedRewards && (
                <TextButton
                    text={`Claim ${pendingRewards.length} Rewards`}
                    textStyle={styles.engineBtnText}
                    style={styles.engineBtnContainer}
                    onPress={_claimRewardsPress}
                />
            )}

            <TokensSelectModal
                ref={tokensSelectRef}
            />
        </View>
    );
};
