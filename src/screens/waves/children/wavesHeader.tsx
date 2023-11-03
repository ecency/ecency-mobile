import React from 'react';
import { View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { WritePostButton } from '../../../components/atoms';
import { showReplyModal } from '../../../redux/actions/uiAction';
import styles from '../styles/children.styles';

export const WavesHeader = () => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const _onPress = () => {
    dispatch(showReplyModal({ mode: 'wave' }));
  };

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{intl.formatMessage({ id: 'post.ecency_waves' })}</Text>
      <WritePostButton placeholderId="quick_reply.placeholder_wave" onPress={_onPress} />
    </View>
  );
};

export default WavesHeader;
