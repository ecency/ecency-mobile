import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import get from 'lodash/get';
import { BasicHeader, TextBoxWithCopy } from '../../components';
import { useAppSelector } from '../../hooks';
import { getDigitPinCode } from '../../providers/hive/dhive';
import AUTH_TYPE from '../../constants/authType';
import { ImportPrivateKeyModalModal } from './importPrivateKeyModal';

// styles
import styles from './backupKeysScreenStyles';

// utils
import { decryptKey } from '../../utils/crypto';

const BackupKeysScreen = () => {
  const intl = useIntl();
  const importKeyModalRef = useRef(null);
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
      case AUTH_TYPE.OWNER_KEY:
        !revealOwnerKey
          ? setOwnerKey(decryptKey(currentAccount?.local?.ownerKey, digitPinCode) || '')
          : setOwnerKey(publicKeys.ownerKey);
        setRevealOwnerKey(!revealOwnerKey);
        break;
      case AUTH_TYPE.ACTIVE_KEY:
        !revealActiveKey
          ? setActiveKey(decryptKey(currentAccount?.local?.activeKey, digitPinCode) || '')
          : setActiveKey(publicKeys.activeKey);
        setRevealActiveKey(!revealActiveKey);
        break;
      case AUTH_TYPE.POSTING_KEY:
        !revealPostingKey
          ? setPostingKey(decryptKey(currentAccount?.local?.postingKey, digitPinCode) || '')
          : setPostingKey(publicKeys.postingKey);
        setRevealPostingKey(!revealPostingKey);
        break;
      case AUTH_TYPE.MEMO_KEY:
        !revealMemoKey
          ? setMemoKey(decryptKey(currentAccount?.local?.memoKey, digitPinCode) || '')
          : setMemoKey(publicKeys.memoKey);
        setRevealMemoKey(!revealMemoKey);
        break;
      default:
    }
  };

  const _handleImportPrivate = () => {
    importKeyModalRef?.current?.showModal();
  };

  const _renderRevealBtn = (revealKey, keyType) => {
    const privateKey = get(currentAccount?.local, keyType, '');
    return (
      <TouchableOpacity
        style={styles.revealBtn}
        onPress={() => (!privateKey ? _handleImportPrivate() : _handleRevealKey(keyType))}
      >
        <Text style={styles.revealBtnText}>
          {intl.formatMessage({
            id: !privateKey
              ? 'settings.backup_keys_modal.import_key'
              : revealKey
              ? 'settings.backup_keys_modal.reveal_public'
              : 'settings.backup_keys_modal.reveal_private',
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  const _renderKey = (authType: string, key: string, keyType: string, revealKey: boolean) => (
    <View style={styles.inputsContainer}>
      <TextBoxWithCopy
        label={
          revealKey
            ? `${authType} (${intl.formatMessage({
                id: 'settings.backup_keys_modal.private',
              })})`
            : `${authType} (${intl.formatMessage({
                id: 'settings.backup_keys_modal.public',
              })})`
        }
        value={key}
        renderSecondButton={_renderRevealBtn(revealKey, keyType)}
      />
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
      {/* {currentAccount?.local?.authType === AUTH_TYPE.STEEM_CONNECT && _renderNoKeys()} */}
      {_renderKey(
        intl.formatMessage({
          id: 'settings.backup_keys_modal.owner_key',
        }),
        // decryptKey(currentAccount?.local?.ownerKey, digitPinCode) || '',
        ownerKey,
        AUTH_TYPE.OWNER_KEY,
        revealOwnerKey,
      )}
      {_renderKey(
        intl.formatMessage({
          id: 'settings.backup_keys_modal.active_key',
        }),
        // decryptKey(currentAccount?.local?.activeKey, digitPinCode) || '',
        activeKey,
        AUTH_TYPE.ACTIVE_KEY,
        revealActiveKey,
      )}
      {_renderKey(
        intl.formatMessage({
          id: 'settings.backup_keys_modal.posting_key',
        }),
        // decryptKey(currentAccount?.local?.postingKey, digitPinCode) || '',
        postingKey,
        AUTH_TYPE.POSTING_KEY,
        revealPostingKey,
      )}
      {_renderKey(
        intl.formatMessage({
          id: 'settings.backup_keys_modal.memo_key',
        }),
        // decryptKey(currentAccount?.local?.memoKey, digitPinCode) || '',
        memoKey,
        AUTH_TYPE.MEMO_KEY,
        revealMemoKey,
      )}
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
      <ImportPrivateKeyModalModal ref={importKeyModalRef} />
    </Fragment>
  );
};

export default gestureHandlerRootHOC(BackupKeysScreen);
