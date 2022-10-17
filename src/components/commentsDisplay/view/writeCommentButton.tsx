import { View, Text } from 'react-native';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View as AnimatedView } from 'react-native-animatable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useIntl } from 'react-intl';
import UserAvatar from '../../userAvatar';
import styles from './WriteCommentButtonStyles';
import { useAppSelector } from '../../../hooks';
import showLoginAlert from '../../../utils/showLoginAlert';

interface WriteCommentButton {
  onPress: () => void;
}

export const WriteCommentButton = forwardRef(({ onPress }, ref) => {
  const intl = useIntl();

  const animatedContainer = useRef<AnimatedView>();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  useImperativeHandle(ref, () => ({
    bounce: () => {
      console.log('bouncing');
      if (animatedContainer.current) {
        animatedContainer.current.swing(1000);
      }
    },
  }));

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
    <AnimatedView ref={animatedContainer}>
      <TouchableOpacity onPress={_onPress}>
        <View style={styles.container}>
          <UserAvatar username={currentAccount.username} />
          <View style={styles.inputContainer}>
            <Text style={styles.inputPlaceholder}>
              {intl.formatMessage({ id: 'quick_reply.placeholder' })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedView>
  );
});
