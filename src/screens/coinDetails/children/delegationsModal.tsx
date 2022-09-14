import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import AccountListContainer from '../../../containers/accountListContainer'
import { useIntl } from 'react-intl'
import { FlatList } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import ROUTES from '../../../constants/routeNames'
import { StackNavigationProp } from '@react-navigation/stack'
import styles from './children.styles';
import { BasicHeader, Modal, UserListItem } from '../../../components'
import { useAppSelector } from '../../../hooks'
import { getVestingDelegations } from '../../../providers/hive/dhive'
import { Alert, RefreshControl } from 'react-native'
import { getTimeFromNow } from '../../../utils/time'
import { getReceivedVestingShares } from '../../../providers/ecency/ecency'
import { vestsToHp } from '../../../utils/conversions'


export enum MODES {
    DELEGATEED = 'delegated',
    RECEIVED = 'receieved',
}

interface DelegationItem {
    username: string;
    vestingShares: string;
}

export const DelegationsModal = forwardRef(({ }, ref) => {
    const intl = useIntl();
    const navigation = useNavigation<StackNavigationProp<any>>();

    const currentAccount = useAppSelector(state => state.account.currentAccount);
    const globalProps = useAppSelector(state => state.account.globalProps);
    const isDarkTheme = useAppSelector(state => state.application.isDarkTheme);

    const [delegations, setDelegations] = useState<DelegationItem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState<MODES>(MODES.DELEGATEED);
    const [isLoading, setIsLoading] = useState(false);

    useImperativeHandle(ref, () => ({
        showModal: (_mode: MODES) => {
            setShowModal(true)
            setMode(_mode)
        }
    }))

    useEffect(() => {
        if (showModal) {
            _getDelegations()
        }
    }, [mode, showModal])


    const _getDelegations = async () => {

        try {
            setIsLoading(true);
            let response: DelegationItem[] = [];
            switch (mode) {
                case MODES.DELEGATEED:
                    response = (await getVestingDelegations(currentAccount.username)).map((item) => ({
                        username: item.delegatee,
                        vestingShares: item.vesting_shares
                    } as DelegationItem))
                    break;
                case MODES.RECEIVED:
                    response = (await getReceivedVestingShares(currentAccount.username)).map((item) => ({
                        username: item.delegator,
                        vestingShares: item.vesting_shares
                    }))
                    break;
            }
            setDelegations(response);
            setIsLoading(false);
        } catch (err) {
            console.warn("Failed to get delegations", err)
            setIsLoading(false);
        }

    }


    const _handleOnUserPress = (username) => {
        navigation.navigate({
            name: ROUTES.SCREENS.PROFILE,
            params: {
                username,
            },
            key: username
        });
    };



    const _renderItem = ({ item, index }: { item: DelegationItem, index: number }) => {
        const value = vestsToHp(item.vestingShares, globalProps.hivePerMVests)

        return (
            <UserListItem
                index={index}
                username={item.username}
                isHasRightItem
                isRightColor={item.is_down_vote}
                rightText={value}
                isLoggedIn
                handleOnPress={() => _handleOnUserPress(item.username)}
                isClickable
                subRightText={item.vestingShares}
            />
        );
    }


    const _renderContent = () => {
        return (
            <AccountListContainer data={delegations}>
                {({ data, filterResult, filterIndex, handleOnVotersDropdownSelect, handleSearch }) => (
                    <>
                        <BasicHeader
                            backIconName="close"
                            isModalHeader={true}
                            handleOnPressBackButton={() => { }}
                            title={`${'Delgations'} (${data && data.length})`}
                            isHasSearch
                            handleOnSearch={(text) => handleSearch(text, 'delagator')}
                        />
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.delegator}
                            removeClippedSubviews={false}
                            renderItem={_renderItem}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isLoading}
                                    onRefresh={_getDelegations}
                                    progressBackgroundColor="#357CE6"
                                    tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                                    titleColor="#fff"
                                    colors={['#fff']}
                                />
                            }
                        />
                    </>
                )}

            </AccountListContainer>
        )
    }

    return (
        <Modal
            isOpen={showModal}
            handleOnModalClose={() => setShowModal(false)}
            isFullScreen
            isCloseButton
            presentationStyle="formSheet"
            title={"Delegations"}
            animationType="slide"
            style={styles.delegationsModal}
        >
            {_renderContent()}
        </Modal>
    )
})