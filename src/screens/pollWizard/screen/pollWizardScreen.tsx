import React from 'react';
import { View } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { PollsWizardContent } from '../../../components';
import styles from '../styles/pollWizardScreen.styles';
import { ModalHeader } from '../../../components';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';

const PollWizardScreen = ({ route }) => {
  const intl = useIntl();
  const navigation = useNavigation();
  const draftId = route.params?.draftId || DEFAULT_USER_DRAFT_ID;

  return (
    <View style={styles.container}>
      <ModalHeader
        title={intl.formatMessage({ id: 'post_poll.create_title' })}
        isCloseButton={true}
        onClosePress={() => {
          navigation.goBack();
        }}
      />
      <PollsWizardContent draftId={draftId} />
    </View>
  );
};

export default PollWizardScreen;
