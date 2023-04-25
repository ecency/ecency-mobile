import React, { Fragment } from 'react';

import { useIntl } from 'react-intl';
import { ScrollView, Text, View } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { BasicHeader, TextBoxWithCopy } from '../../components';
import { useAppSelector } from '../../hooks';
import { getDigitPinCode } from '../../providers/hive/dhive';
import AUTH_TYPE from '../../constants/authType';

// styles
import styles from './backupKeysScreenStyles';
import { decryptKey } from '../../utils/crypto';

const BackupKeysScreen = () => {
  const intl = useIntl();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);
  const digitPinCode = getDigitPinCode(pinCode);

  const _renderKey = (authType: string, key: string) => (
    <View style={styles.inputsContainer}>
      <TextBoxWithCopy label={authType} value={key} />
    </View>
  );

  const _renderNoKeys = () => (
    <View style={styles.noKeysContainer}>
      <Text style={styles.noKeysText}>
        {intl.formatMessage({
          id: 'settings.backup_keys_modal.no_keys',
        })}
      </Text>
    </View>
  );

  const _renderContent = (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {currentAccount?.local?.authType === AUTH_TYPE.STEEM_CONNECT && _renderNoKeys()}
      {currentAccount?.local?.ownerKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.owner_key',
            }),
            decryptKey(currentAccount?.local?.ownerKey, digitPinCode) || '',
          )
        : null}
      {currentAccount?.local?.activeKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.active_key',
            }),
            decryptKey(currentAccount?.local?.activeKey, digitPinCode) || '',
          )
        : null}
      {currentAccount?.local?.postingKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.posting_key',
            }),
            decryptKey(currentAccount?.local?.postingKey, digitPinCode) || '',
          )
        : null}
      {currentAccount?.local?.memoKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.memo_key',
            }),
            decryptKey(currentAccount?.local?.memoKey, digitPinCode) || '',
          )
        : null}
    </ScrollView>
  );

  return (
    <Fragment>
      <BasicHeader
        backIconName="close"
        title={intl.formatMessage({
          id: 'settings.backup_private_keys',
        })}
      />
      <View style={styles.mainContainer}>{_renderContent}</View>
    </Fragment>
  );
};

export default gestureHandlerRootHOC(BackupKeysScreen);
