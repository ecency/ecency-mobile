import React, { useCallback, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { injectIntl } from 'react-intl';
import ActionSheet from 'react-native-actions-sheet';
import { useJoinChat } from '@ecency/ns-query';
import { SquareButton } from '../../../components';
import styles from '../style/chatAddNewAccount.style.ts';
import { ChatPinCode } from './chatPinCode';
import modalStyles from '../style/chatModal.style';

const ChatAddNewAccount = ({ intl }) => {
  const bottomSheetModalRef = useRef();
  const [pin, setPin] = useState('');

  const { mutateAsync: joinChat } = useJoinChat();

  const onPressCreateAccount = useCallback(() => {
    if (pin.length !== 8) {
      return;
    }

    joinChat({ pin });
  }, [pin]);

  return (
    <>
      <ActionSheet
        ref={bottomSheetModalRef}
        gestureEnabled={true}
        hideUnderlay
        containerStyle={modalStyles.sheetContent}
        indicatorStyle={modalStyles.sheetIndicator}
        onClose={() => bottomSheetModalRef.current?.hide()}
      >
        <View style={modalStyles.modal}>
          <Text style={modalStyles.title}>
            {intl.formatMessage({ id: 'chat.create-new-account' })}
          </Text>
          <Text style={modalStyles.subTitle}>
            {intl.formatMessage({ id: 'chat.create-description' })}
          </Text>
          <View style={modalStyles.alertView}>
            <Text style={modalStyles.alertText}>
              {intl.formatMessage({ id: 'chat.create-pin-description' })}
            </Text>
          </View>
          <ChatPinCode pin={pin} setPin={setPin} />
          <View style={styles.buttonsWrapper}>
            <SquareButton
              text={intl.formatMessage({ id: 'alert.cancel' })}
              onPress={() => bottomSheetModalRef.current?.hide()}
              style={styles.squareButton}
              textStyle={styles.actionText}
            />
            <SquareButton
              text={intl.formatMessage({ id: 'chat.create-an-account' })}
              onPress={onPressCreateAccount}
              style={[styles.squareButton, styles.squareButtonInversion]}
              textStyle={[styles.actionText, styles.actionTextInversion]}
            />
          </View>
        </View>
      </ActionSheet>
      <SquareButton
        text={intl.formatMessage({ id: 'chat.create-new-account' })}
        onPress={() => bottomSheetModalRef.current?.show()}
        style={[styles.squareButton, styles.squareButtonInversion]}
        textStyle={[styles.actionText, styles.actionTextInversion]}
      />
    </>
  );
};

export default injectIntl(ChatAddNewAccount);
