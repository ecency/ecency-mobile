import React, { useEffect, useMemo, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { FormattedMessage, injectIntl } from 'react-intl';
import { useKeysQuery, useRestoreChatByPin } from '@ecency/ns-query';
import styles from '../style/chatWelcome.style.ts';
import { ChatPinCode } from './chatPinCode.jsx';
import { OrDivider } from '../../../components';
import ChatsImport from './chatsImport.jsx';
import ChatAddNewAccount from './chatAddNewAccount.jsx';

const ChatWelcome = () => {
  const { publicKey } = useKeysQuery();

  const [pin, setPin] = useState('');

  const isAlreadyRegisteredInChats = useMemo(() => !!publicKey, [publicKey]);

  const {
    mutateAsync: restoreByPin,
    isError: isRestoreFailed,
    isLoading: isRestoreLoading,
  } = useRestoreChatByPin();

  useEffect(() => {
    // Handle PIN on account restoring
    if (pin.length === 8) {
      restoreByPin(pin);
    }
  }, [pin]);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        <FormattedMessage id="chat.welcome.title" />
      </Text>
      <View style={styles.subTextWrapper}>
        <Text style={styles.subText}>
          <FormattedMessage id="chat.welcome.already-joined-title" />
        </Text>
        <Text style={styles.subText}>
          <FormattedMessage id="chat.welcome.already-joined-hint" />
        </Text>
      </View>
      <ChatPinCode
        setPin={setPin}
        pin={pin}
        editable={!isRestoreLoading}
        errorMessage={isRestoreFailed ? 'chat.welcome.pin-failed' : ''}
      />
      <OrDivider containerStyle={{ paddingVertical: 30 }} />

      <View style={styles.buttonsWrapper}>
        <ChatsImport />
        <ChatAddNewAccount />
      </View>
    </View>
  );
};

export default injectIntl(ChatWelcome);
