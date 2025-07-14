import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import ROUTES from '../../../constants/routeNames';
import styles from './children.styles';
import { BasicHeader, Modal, UserListItem } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { walletQueries } from '../../../providers/queries';
import { RecurrentTransfer } from 'providers/hive/hive.types';
import { Alert } from 'react-native';


interface RecurrentTransfersModalProps {
    assetId: string;
}

export const RecurrentTransfersModal = forwardRef(({ assetId }: RecurrentTransfersModalProps, ref) => {
    const intl = useIntl();
    const navigation = useNavigation<StackNavigationProp<any>>();

    const recurringActivitiesQuery = walletQueries.useRecurringActivitesQuery(assetId);
    const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);

    const [showModal, setShowModal] = useState(false);


    useImperativeHandle(ref, () => ({
        showModal: () => {
            setShowModal(true);
            recurringActivitiesQuery?.refetch();
        },
    }));


    const _handleOnUserPress = (username: string) => {
        navigation.navigate({
            name: ROUTES.SCREENS.PROFILE,
            params: {
                username,
            },
            key: username,
        });
        setShowModal(false);
    };

    const _handleOnPressUpdate = (username: string) => {

        Alert.alert("handle update press");
        // if (mode === MODES.DELEGATEED) {
        //     console.log('delegate HP!');
        //     navigation.navigate({
        //         name: ROUTES.SCREENS.TRANSFER,
        //         params: {
        //             transferType: 'delegate',
        //             fundType: 'HIVE_POWER',
        //             referredUsername: username,
        //         },
        //     });
        //     setShowModal(false);
        // }
    };

    const title = intl.formatMessage({ id: `wallet.recurrent_transfer` });

    const _renderItem = ({ item, index }: { item: RecurrentTransfer; index: number }) => {
        const value = item.amount;
        const timeString = new Date(item.trigger_date).toDateString();
        const subRightText = intl.formatMessage({ id: 'wallet.tap_update' });

        return (
            <UserListItem
                key={item.to}
                index={index}
                username={item.to}
                description={timeString}
                isHasRightItem
                rightText={value}
                subRightText={subRightText}
                isLoggedIn
                handleOnPress={() => _handleOnUserPress(item.to)}
                onPressRightText={() => _handleOnPressUpdate(item.to)}
                isClickable
            />
        );
    };

    const _renderContent = () => {
        const data = recurringActivitiesQuery?.data
        return (
            <>
                <BasicHeader
                    backIconName="close"
                    isModalHeader={true}
                    title={`${title} (${data && data.length})`}
                    handleOnPressClose={() => setShowModal(false)}
                />
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.delegator}
                    removeClippedSubviews={false}
                    renderItem={_renderItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={recurringActivitiesQuery?.isLoading || false}
                            onRefresh={recurringActivitiesQuery?.refetch}
                            progressBackgroundColor="#357CE6"
                            tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                            titleColor="#fff"
                            colors={['#fff']}
                        />
                    }
                />
            </>

        );
    };

    return (
        <Modal
            isOpen={showModal}
            handleOnModalClose={() => setShowModal(false)}
            isFullScreen
            isCloseButton
            presentationStyle="formSheet"
            animationType="slide"
            style={styles.delegationsModal}
        >
            {_renderContent()}
        </Modal>
    );
});
