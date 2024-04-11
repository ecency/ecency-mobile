import React, { useEffect, useMemo, useState } from 'react';
import { injectIntl } from 'react-intl';
import { Text, TouchableOpacity, View } from 'react-native';
import { useKeysQuery, useRestoreChatByPin } from '@ecency/ns-query';
import styles from '../style/chatCredentialInfo.style';
import ChatDropdown from './chatDropdown';
import { Icon, SquareButton } from '../../../components';
import { ChatPinCode } from './chatPinCode';
import { useAppSelector } from '../../../hooks';
import CopyClipboardGroup from '../../../components/CopyClipboardGroup/CopyClipboardGroup';

const ChatCredentialInfo = ({ intl, onClose }) => {
  const { publicKey, privateKey, iv } = useKeysQuery();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [validationPin, setValidationPin] = useState('');

  const {
    mutateAsync: restoreByPin,
    isError: isRestoreFailed,
    isLoading: isRestoreLoading,
    isSuccess: isRestoreSuccess,
  } = useRestoreChatByPin();

  useEffect(() => {
    // Handle PIN on account restoring
    if (validationPin.length === 8) {
      restoreByPin(validationPin);
    }
  }, [validationPin]);

  useEffect(() => {
    setIsUnlocked(
      isRestoreSuccess && !isRestoreLoading && !!publicKey && !!privateKey && !isRestoreFailed,
    );
  }, [isRestoreSuccess, isRestoreLoading, publicKey, privateKey, isRestoreFailed]);

  const ecencyKey = useMemo(
    () =>
      Buffer.from(
        JSON.stringify({
          pub: publicKey,
          priv: privateKey,
          iv,
        }),
      ).toString('base64'),
    [publicKey, privateKey],
  );

  return (
    <View>
      <TouchableOpacity onPress={() => onClose?.()} style={styles.titleView}>
        <Icon style={styles.icon} name="keyboard-backspace" iconType="MaterialIcons" />
        <Text style={styles.title}>
          {intl.formatMessage({
            id: 'chat.manage-chat-key',
          })}
        </Text>
      </TouchableOpacity>
      <View style={styles.content}>
        {isUnlocked ? (
          <>
            <Text style={styles.contentText}>
              {intl.formatMessage({
                id: 'chat.chat-priv-key',
              })}
            </Text>
            <CopyClipboardGroup title="PIN" text={validationPin} />
            <CopyClipboardGroup
              title={intl.formatMessage({
                id: 'chat.ecency-key',
              })}
              text={ecencyKey}
            />
          </>
        ) : (
          <>
            <Text style={styles.contentText}>
              {intl.formatMessage({
                id: 'chat.unlock-the-section',
              })}
            </Text>
            <ChatPinCode setPin={setValidationPin} pin={validationPin} />
          </>
        )}
        <></>
      </View>
    </View>
  );
};

export default injectIntl(ChatCredentialInfo);
