import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { injectIntl } from 'react-intl';
import { useImportChatByKeys, useRestoreChatByPin } from '@ecency/ns-query';
import ActionSheet from 'react-native-actions-sheet';
import { SquareButton } from '../../../components';
import styles from './chatsImport.style.tsx';
import { TextInputV2 } from '../../../components/textInput/V2/textInputV2.tsx';
import { ChatPinCode } from './chatPinCode';

export const ChatsImport = ({ intl }) => {
  const bottomSheetModalRef = useRef();

  const [ecencyChatKey, setEcencyChatKey] = useState('');
  const [pin, setPin] = useState('');
  const { mutateAsync: importChatByKey } = useImportChatByKeys();

  const onPressImportChatKey = useCallback(() => {
    if (pin.length !== 8 || !ecencyChatKey.length) {
      return;
    }

    importChatByKey({ ecencyChatKey, pin });
  }, [ecencyChatKey]);

  return (
    <>
      <ActionSheet
        ref={bottomSheetModalRef}
        gestureEnabled={true}
        hideUnderlay
        containerStyle={styles.sheetContent}
        indicatorStyle={styles.sheetIndicator}
        onClose={() => bottomSheetModalRef.current?.hide()}
      >
        <View style={styles.modal}>
          <Text style={styles.title}>{intl.formatMessage({ id: 'chat.import.title' })}</Text>
          <Text style={styles.subTitle}>
            {intl.formatMessage({ id: 'chat.import.description' })}
          </Text>
          <TextInputV2
            onChange={setEcencyChatKey}
            placeholder={intl.formatMessage({ id: 'chat.key' })}
          />
          <View style={styles.alertView}>
            <Text style={styles.alertText}>
              {intl.formatMessage({ id: 'chat.create-pin-description' })}
            </Text>
          </View>
          <ChatPinCode setPin={setPin} pin={pin} />
          <View style={styles.buttonsWrapper}>
            <SquareButton
              text={intl.formatMessage({ id: 'alert.cancel' })}
              onPress={() => bottomSheetModalRef.current?.hide()}
              style={styles.squareButton}
              textStyle={styles.actionText}
            />
            <SquareButton
              text={intl.formatMessage({ id: 'chat.import.button' })}
              onPress={onPressImportChatKey}
              style={[styles.squareButton, styles.squareButtonInversion]}
              textStyle={[styles.actionText, styles.actionTextInversion]}
            />
          </View>
        </View>
      </ActionSheet>
      <SquareButton
        text={intl.formatMessage({ id: 'chat.import.button' })}
        onPress={() => bottomSheetModalRef.current?.show()}
        style={styles.squareButton}
        textStyle={styles.actionText}
      />
    </>
  );
};

export default injectIntl(ChatsImport);
