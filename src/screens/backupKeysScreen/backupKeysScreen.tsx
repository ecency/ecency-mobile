import React, { Fragment, useState } from 'react';

import { useIntl } from 'react-intl';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { BasicHeader, TextBoxWithCopy } from '../../components';
import { useAppSelector } from '../../hooks';
import { getDigitPinCode } from '../../providers/hive/dhive';
import AUTH_TYPE from '../../constants/authType';

// styles
import styles from './backupKeysScreenStyles';
import { decryptKey } from '../../utils/crypto';
import authType from '../../constants/authType';
import { useEffect } from 'react';
import get from 'lodash/get';

const BackupKeysScreen = () => {
  const intl = useIntl();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);
  const digitPinCode = getDigitPinCode(pinCode);

  const [ownerKey, setOwnerKey] = useState('');
  const [activeKey, setActiveKey] = useState('');
  const [postingKey, setPostingKey] = useState('');
  const [memoKey, setMemoKey] = useState('');
  const [revealOwnerKey, setRevealOwnerKey] = useState(false);
  const [revealActiveKey, setRevealActiveKey] = useState(false);
  const [revealPostingKey, setRevealPostingKey] = useState(false);
  const [revealMemoKey, setRevealMemoKey] = useState(false);

  const publicKeys = {
    activeKey: get(currentAccount, 'active.key_auths', []).map((x) => x[0])[0],
    memoKey: get(currentAccount, 'memo_key', ''),
    ownerKey: get(currentAccount, 'owner.key_auths', []).map((x) => x[0])[0],
    postingKey: get(currentAccount, 'posting.key_auths', []).map((x) => x[0])[0],
  };

  useEffect(() => {
    setOwnerKey(publicKeys.ownerKey);
    setActiveKey(publicKeys.activeKey);
    setPostingKey(publicKeys.postingKey);
    setMemoKey(publicKeys.memoKey);
  }, [currentAccount]);

  const _handleRevealKey = (keyType: string) => {
    switch (keyType) {
      case authType.OWNER_KEY:
        !revealOwnerKey
          ? setOwnerKey(decryptKey(currentAccount?.local?.ownerKey, digitPinCode) || '')
          : setOwnerKey(publicKeys.ownerKey);
        setRevealOwnerKey(!revealOwnerKey);
        break;
      case authType.ACTIVE_KEY:
        !revealActiveKey
          ? setActiveKey(decryptKey(currentAccount?.local?.activeKey, digitPinCode) || '')
          : setActiveKey(publicKeys.activeKey);
        setRevealActiveKey(!revealActiveKey);
        break;
      case authType.POSTING_KEY:
        !revealPostingKey
          ? setPostingKey(decryptKey(currentAccount?.local?.postingKey, digitPinCode) || '')
          : setPostingKey(publicKeys.postingKey);
        setRevealPostingKey(!revealPostingKey);
        break;
      case authType.MEMO_KEY:
        !revealMemoKey
          ? setMemoKey(decryptKey(currentAccount?.local?.memoKey, digitPinCode) || '')
          : setMemoKey(publicKeys.memoKey);
        setRevealMemoKey(!revealMemoKey);
        break;
      default:
    }
  };

  const _renderKey = (authType: string, key: string, keyType: string, revealKey: boolean) => (
    <View style={styles.inputsContainer}>
      <TextBoxWithCopy label={authType} value={key} />
      <TouchableOpacity style={styles.revealBtn} onPress={() => _handleRevealKey(keyType)}>
        <Text style={styles.revealBtnText}>
          {intl.formatMessage({
            id: revealKey
              ? 'settings.backup_keys_modal.reveal_public'
              : 'settings.backup_keys_modal.reveal_private',
          })}
        </Text>
      </TouchableOpacity>
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
            // decryptKey(currentAccount?.local?.ownerKey, digitPinCode) || '',
            ownerKey,
            authType.OWNER_KEY,
            revealOwnerKey,
          )
        : null}
      {currentAccount?.local?.activeKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.active_key',
            }),
            // decryptKey(currentAccount?.local?.activeKey, digitPinCode) || '',
            activeKey,
            authType.ACTIVE_KEY,
            revealActiveKey,
          )
        : null}
      {currentAccount?.local?.postingKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.posting_key',
            }),
            // decryptKey(currentAccount?.local?.postingKey, digitPinCode) || '',
            postingKey,
            authType.POSTING_KEY,
            revealPostingKey,
          )
        : null}
      {currentAccount?.local?.memoKey
        ? _renderKey(
            intl.formatMessage({
              id: 'settings.backup_keys_modal.memo_key',
            }),
            // decryptKey(currentAccount?.local?.memoKey, digitPinCode) || '',
            memoKey,
            authType.MEMO_KEY,
            revealMemoKey,
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
