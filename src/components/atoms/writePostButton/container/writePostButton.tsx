import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useIntl } from 'react-intl';
import UserAvatar from '../../../userAvatar';
import styles from '../styles/writePostButton.styles';
import { useAppSelector } from '../../../../hooks';
import showLoginAlert from '../../../../utils/showLoginAlert';
import { selectCurrentAccountUsername, selectIsLoggedIn } from '../../../../redux/selectors';

interface WritePostButtonProps {
  placeholderId: string;
  onPress: () => void;
}

export const WritePostButton = ({ placeholderId: placeholder, onPress }: WritePostButtonProps) => {
  const intl = useIntl();

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const username = useAppSelector(selectCurrentAccountUsername);

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
        <UserAvatar username={username} />
        <View style={styles.inputContainer}>
          <Text style={styles.inputPlaceholder}>{intl.formatMessage({ id: placeholder })}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
