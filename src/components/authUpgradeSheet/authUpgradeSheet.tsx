import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useAppSelector } from '../../hooks';
import { selectCurrentAccount } from '../../redux/selectors';
import { MainButton } from '../mainButton';
import { Icon } from '../icon';
import { getPrivateKeys } from '../../providers/hive/auth';
import { setTempActiveKey } from '../../providers/sdk/mobilePlatformAdapter';

const AuthUpgradeSheet: React.FC<SheetProps<'auth_upgrade'>> = ({ sheetId, payload }) => {
  const intl = useIntl();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const resolvedRef = useRef(false);

  // Keep a ref to the current payload so _resolve always calls the latest callback.
  // This prevents stale onClose events from resolving a newer invocation's promise.
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  // Reset state when the sheet is shown with a new payload (component stays mounted
  // across invocations because react-native-actions-sheet reuses registered sheets).
  useEffect(() => {
    resolvedRef.current = false;
    setKeyInput('');
    setError('');
    setIsValidating(false);
  }, [payload]);

  const _resolve = (method: 'key' | 'hivesigner' | 'hiveauth' | false) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    payloadRef.current?.onMethodSelected?.(method);
    ActionSheet.hide(sheetId);
  };

  const _handleSignWithKey = async () => {
    if (!keyInput.trim()) {
      setError(intl.formatMessage({ id: 'auth_upgrade.invalid_key' }));
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const username = payload?.username || currentAccount?.name || currentAccount?.username || '';

      // getPrivateKeys: tries WIF first, then falls back to master password derivation
      const privateKeys = getPrivateKeys(username, keyInput.trim());

      if (!privateKeys?.activeKey) {
        setError(intl.formatMessage({ id: 'auth_upgrade.invalid_key' }));
        setIsValidating(false);
        return;
      }

      // Validate against account's active key authority
      const derivedPubKey = privateKeys.activeKey.createPublic().toString();
      const accountActiveKeys = currentAccount?.active?.key_auths;

      if (!accountActiveKeys) {
        setError(intl.formatMessage({ id: 'auth_upgrade.key_mismatch' }));
        setIsValidating(false);
        return;
      }

      const isMatch = accountActiveKeys.some((auth: any) => auth[0] === derivedPubKey);

      if (!isMatch) {
        setError(intl.formatMessage({ id: 'auth_upgrade.key_mismatch' }));
        setIsValidating(false);
        return;
      }

      // Store the WIF for the adapter's getActiveKey to pick up
      setTempActiveKey(privateKeys.activeKey.toString());
      _resolve('key');
    } catch (e) {
      setError(intl.formatMessage({ id: 'auth_upgrade.invalid_key' }));
    } finally {
      setIsValidating(false);
    }
  };

  const _handleHiveSigner = () => {
    _resolve('hivesigner');
  };

  const _handleHiveAuth = () => {
    _resolve('hiveauth');
  };

  const _handleClose = () => {
    _resolve(false);
  };

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled={!isValidating}
      closeOnTouchBackdrop={!isValidating}
      onClose={_handleClose}
      containerStyle={styles.sheetContainer}
    >
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Icon
            iconType="MaterialCommunityIcons"
            name="shield-key"
            size={48}
            color={EStyleSheet.value('$primaryBlue')}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{intl.formatMessage({ id: 'auth_upgrade.title' })}</Text>

        {/* Description */}
        <Text style={styles.description}>
          {intl.formatMessage(
            { id: 'auth_upgrade.description' },
            { authority: payload?.requiredAuthority || 'active' },
          )}
        </Text>

        {/* Key Input */}
        <View style={styles.keyInputContainer}>
          <TextInput
            style={styles.keyInput}
            placeholder={intl.formatMessage({ id: 'auth_upgrade.key_placeholder' })}
            placeholderTextColor={EStyleSheet.value('$primaryDarkGray')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={keyInput}
            onChangeText={(text) => {
              setKeyInput(text);
              setError('');
            }}
            editable={!isValidating}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Sign Button */}
        <MainButton
          onPress={_handleSignWithKey}
          isLoading={isValidating}
          isDisable={isValidating || !keyInput.trim()}
          text={intl.formatMessage({ id: 'auth_upgrade.sign_button' })}
          style={styles.signButton}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{intl.formatMessage({ id: 'auth_upgrade.or' })}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* HiveSigner */}
        <MainButton
          onPress={_handleHiveSigner}
          isDisable={isValidating}
          text={intl.formatMessage({ id: 'auth_upgrade.hivesigner_button' })}
          style={styles.altButton}
          textStyle={styles.altButtonText}
        />

        {/* HiveAuth / Keychain */}
        <MainButton
          onPress={_handleHiveAuth}
          isDisable={isValidating}
          text={intl.formatMessage({ id: 'auth_upgrade.hiveauth_button' })}
          style={styles.altButton}
          textStyle={styles.altButtonText}
        />

        {/* Cancel */}
        <MainButton
          onPress={_handleClose}
          isDisable={isValidating}
          text={intl.formatMessage({ id: 'auth_upgrade.cancel' })}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
      </View>
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  sheetContainer: {
    paddingHorizontal: 0,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '$primaryBlack',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '$primaryDarkGray',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  keyInputContainer: {
    marginBottom: 12,
  },
  keyInput: {
    borderWidth: 1,
    borderColor: '$primaryLightGray',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '$primaryBlack',
    backgroundColor: '$primaryLightBackground',
  },
  errorText: {
    color: '$primaryRed',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  signButton: {
    marginBottom: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '$primaryLightGray',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '$primaryDarkGray',
  },
  altButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '$primaryBlue',
    marginBottom: 10,
  },
  altButtonText: {
    color: '$primaryBlue',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '$primaryLightGray',
    marginBottom: 0,
    marginTop: 2,
  },
  cancelButtonText: {
    color: '$primaryDarkGray',
  },
});

export default AuthUpgradeSheet;
