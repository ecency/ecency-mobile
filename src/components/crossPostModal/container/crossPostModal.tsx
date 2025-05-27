import React, { useState } from 'react';
import { View, Text } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { SheetNames } from '../../../navigation/sheets';
import styles from '../styles/crossPostModal.styles';
import { FormInput, MainButton, Modal, SelectCommunityModalContainer, TextButton } from '../..';
import { repostQueries } from '../../../providers/queries';
import RootNavigation from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';

export const CrossPostModal = ({ payload }: SheetProps<SheetNames.CROSS_POST>) => {
  const intl = useIntl();

  const postContent = payload?.postContent || {};

  const crossPostMutation = repostQueries.useCrossPostMutation();

  const currentAccount = useSelector((state) => state.account.currentAccount);

  const [message, setMessage] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [selectedCommunityName, setSelectedCommunityName] = useState('');
  const [isCommunitiesListModalOpen, setIsCommunitiesListModalOpen] = useState(false);

  const _onClose = () => {
    SheetManager.hide(SheetNames.CROSS_POST);
    setMessage('');
    setSelectedCommunityId('');
    setSelectedCommunityName('');
    setIsCommunitiesListModalOpen(false);
  };

  const handleCrossPost = async () => {
    if (selectedCommunityId && postContent) {
      console.log('Cross posting to:', selectedCommunityId, 'with message:', message);
      try {
        const response = await crossPostMutation.mutateAsync({
          post: postContent,
          communityId: selectedCommunityId,
          message,
        });
        console.log('Cross post response:', response);
        _onClose();
        RootNavigation.navigate({
          name: ROUTES.SCREENS.COMMUNITY,
          params: {
            tag: selectedCommunityId,
            filter: 'created',
          },
        });
      } catch (error) {
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
    );
  };

  const _renderContent = () => {
    return (
      <View style={styles.modalContent}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'cross_post.title' })}</Text>
        <FormInput
          isValid={true}
          placeholder="Select Community"
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

        <Text style={styles.description}>
          {intl.formatMessage({ id: 'cross_post.description' })}
        </Text>
        {_renderActionPanel()}
        {_renderCommunityModal()}
      </View>
    );
  };

  return (
    <ActionSheet
      gestureEnabled={false}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.sheetIndicator}
      onClose={_onClose}
    >
      {_renderContent()}
    </ActionSheet>
  );
};
