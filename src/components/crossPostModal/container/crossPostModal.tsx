import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import styles from '../styles/crossPostModal.styles';
import { useDispatch, useSelector } from 'react-redux';
import { FormInput, MainButton, Modal, SelectCommunityModalContainer, TextButton } from '../../../components';
import { useIntl } from 'react-intl';
import { hideCrossPostModal } from '../../../redux/actions/uiAction';
import { useCrossPostMutation } from '../../../providers/queries/postQueries/reblogQueries';
import RootNavigation from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';


export const CrossPostModal = () => {
    const intl = useIntl();
    const dispatch = useDispatch();

    const sheetModalRef = useRef<ActionSheet>();
    const crossPostMutation = useCrossPostMutation();

    const currentAccount = useSelector((state) => state.account.currentAccount);
    const crossPostModalVisible = useSelector((state) => state.ui.crossPostModalVisible);
    const crossPostModalData = useSelector((state) => state.ui.crossPostModalData);

    const [message, setMessage] = useState('');
    const [selectedCommunityId, setSelectedCommunityId] = useState('');
    const [selectedCommunityName, setSelectedCommunityName] = useState('');
    const [isCommunitiesListModalOpen, setIsCommunitiesListModalOpen] = useState(false);


    useEffect(() => {
        if (crossPostModalVisible) {
            sheetModalRef.current?.show();
        }
    }, [crossPostModalVisible]);


    const _onClose = () => {
        sheetModalRef.current?.hide();
        dispatch(hideCrossPostModal());
        setMessage('');
        setSelectedCommunityId('');
        setSelectedCommunityName('');
        setIsCommunitiesListModalOpen(false);
    };

    const handleCrossPost = async () => {
        if (selectedCommunityId && crossPostModalData) {
            console.log('Cross posting to:', selectedCommunityId, 'with message:', message);
            try {
                const response = await crossPostMutation.mutateAsync({
                    post: crossPostModalData,
                    communityId: selectedCommunityId,
                    message: message,
                })
                console.log('Cross post response:', response);
                _onClose();
                RootNavigation.navigate({
                    name: ROUTES.SCREENS.COMMUNITY,
                    params: {
                        tag: selectedCommunityId,
                        filter: "created"
                    },
                });
            }
            catch (error) {
                console.error('Cross post error:', error);
            }
        }
    };


    const _renderCommunityModal = () => {
        return (
            <Modal
                isOpen={isCommunitiesListModalOpen}
                presentationStyle="formSheet"
                animationType="slide"
                style={styles.communityModal}
            >
                <SelectCommunityModalContainer
                    currentAccount={currentAccount}
                    showSubscribedOnly={true}
                    onPressCommunity={(data) => {
                        setSelectedCommunityId(data.name);
                        setSelectedCommunityName(data.title);
                        setIsCommunitiesListModalOpen(false);
                    }}

                    onCloseModal={() => {
                        setIsCommunitiesListModalOpen(false);
                    }}
                />
            </Modal>
        );
    };


    const _renderActionPanel = () => {
        return (
            <View style={styles.actionPanel}>
                <MainButton
                    text={intl.formatMessage({ id: 'quick_reply.publish' })}
                    onPress={handleCrossPost}
                    style={styles.btnMain}
                    isDisable={!selectedCommunityId}
                    isLoading={crossPostMutation.isLoading}

                />
                <TextButton
                    style={styles.btnClose}
                    onPress={_onClose}
                    text={intl.formatMessage({
                        id: 'quick_reply.close',
                    })}
                />
            </View>
        )
    }


    const _renderContent = () => {
        return (
            <View style={styles.modalContent}>
                <Text style={styles.title}>{intl.formatMessage({ id: 'cross_post.title' })}</Text>
                <FormInput
                    isValid={true}
                    placeholder={"Select Community"}
                    isEditable={false}
                    value={selectedCommunityName}
                    wrapperStyle={styles.inputWrapper}
                    inputStyle={styles.input}

                    onPress={() => {
                        setIsCommunitiesListModalOpen(true);
                    }}
                />
                <FormInput
                    isValid={true}
                    onChange={setMessage}
                    placeholder={intl.formatMessage({
                        id: 'cross_post.message_placeholder',
                    })}
                    isEditable
                    value={message}
                    wrapperStyle={styles.inputWrapper}
                    inputStyle={styles.input}
                />


                <Text style={styles.description}>{intl.formatMessage({ id: 'cross_post.description' })}</Text>
                {_renderActionPanel()}
                {_renderCommunityModal()}
            </View>
        )
    }


    return (
        <ActionSheet
            ref={sheetModalRef}
            gestureEnabled={false}
            containerStyle={styles.sheetContent}
            indicatorStyle={styles.sheetIndicator}
            onClose={_onClose}>
            {_renderContent()}
        </ActionSheet>
    );
};