import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useIntl } from 'react-intl';
import UserAvatar from '../../../userAvatar';
import styles from '../styles/writePostButton.styles';
import { useAppSelector } from '../../../../hooks';
import showLoginAlert from '../../../../utils/showLoginAlert';

interface WritePostButtonProps {
  placeholderId: string;
  onPress: () => void;
}

export const WritePostButton = ({ placeholderId: placeholder, onPress }: WritePostButtonProps) => {
  const intl = useIntl();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const _onPress = () => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity onPress={_onPress}>
      <View style={styles.container}>
        <UserAvatar username={currentAccount.username} />
        <View style={styles.inputContainer}>
          <Text style={styles.inputPlaceholder}>{intl.formatMessage({ id: placeholder })}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
