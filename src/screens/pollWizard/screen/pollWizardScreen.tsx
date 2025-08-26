import React from 'react';
import { Platform } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { Edges, SafeAreaView } from 'react-native-safe-area-context';
import { PollsWizardContent } from '../../../components';
import styles from '../styles/pollWizardScreen.styles';
import { ModalHeader } from '../../../components';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';

const PollWizardScreen = ({ route }) => {
  const intl = useIntl();
  const navigation = useNavigation();
  const draftId = route.params?.draftId || DEFAULT_USER_DRAFT_ID;

  const _closeModal = () => {
    navigation.goBack();
  };

  // for modals, iOS has its own safe area handling
  const _safeAreaEdges: Edges = Platform.select({ ios: [], default: ['top'] });

  return (
    <SafeAreaView style={styles.container} edges={_safeAreaEdges}>
      <ModalHeader
        title={intl.formatMessage({ id: 'post_poll.create_title' })}
        isCloseButton={true}
        onClosePress={_closeModal}
      />
      <PollsWizardContent draftId={draftId} onClose={_closeModal} />
    </SafeAreaView>
  );
};

export default PollWizardScreen;
