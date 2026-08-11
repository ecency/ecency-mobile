import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import WebView from 'react-native-webview';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Operation, TransactionConfirmation } from '@ecency/sdk';
import { hsOptions } from '../../constants/hsOptions';
import styles from './hiveSignerModal.styles';
import { ModalHeader } from '../modalHeader';
import { useHiveAuth, HiveAuthStatus } from '../hiveAuthModal/hooks/useHiveAuth';
import { StatusContent } from '../hiveAuthModal/children/statusContent';
import AUTH_TYPE from '../../constants/authType';
import { useAppSelector } from '../../hooks';
import { selectCurrentAccount } from '../../redux/selectors';
import { parseHiveSignerSignResult } from '../../utils/hiveSignerCallback';

export const HiveSignerModal = ({ route, navigation }: any) => {
  const intl = useIntl();
  const hiveAuth = useHiveAuth();
  const currentAccount = useAppSelector(selectCurrentAccount);

  const { hiveuri, opsArray, onClose, onSuccess } = route.params || {};
  const successHandledRef = useRef(false);
  const closedDueToMissingUriRef = useRef(false);
  const broadcastStartedRef = useRef(false);

  // Stabilize route.params callbacks via refs to avoid effect re-triggers
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Determine if this is a HiveAuth operation
  const isHiveAuthOperation =
    currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH && Boolean(opsArray);

  // Handle HiveAuth broadcast
  useEffect(() => {
    if (isHiveAuthOperation && hiveAuth.status === HiveAuthStatus.INPUT) {
      // Guard against duplicate broadcast (React strict mode, fast re-renders)
      if (broadcastStartedRef.current) {
        return;
      }
      broadcastStartedRef.current = true;

      // Automatically trigger HiveAuth broadcast
      (async () => {
        try {
          const result = await hiveAuth.broadcast(opsArray as Operation[]);
          if (result) {
            successHandledRef.current = true;
            onSuccessRef.current?.();
            navigation.goBack();
          } else {
            closedDueToMissingUriRef.current = true;
            onCloseRef.current?.();
            navigation.goBack();
          }
        } catch (error) {
          // Mirror failure branch behavior
          closedDueToMissingUriRef.current = true;
          onCloseRef.current?.();
          navigation.goBack();
        }
      })();
    }
  }, [isHiveAuthOperation, hiveAuth.status]);

  // Handle missing hiveuri for HiveSigner operations
  useEffect(() => {
    if (!isHiveAuthOperation && !hiveuri && !closedDueToMissingUriRef.current) {
      closedDueToMissingUriRef.current = true;
      navigation.goBack();
      onCloseRef.current?.();
    }
  }, [isHiveAuthOperation, hiveuri, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // Don't call onClose if success was already handled or closed due to missing URI
      if (!successHandledRef.current && !closedDueToMissingUriRef.current) {
        onCloseRef.current?.();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const _onClose = () => {
    // Don't call onClose if success was already handled
    if (successHandledRef.current) {
      return;
    }
    hiveAuth.reset();
    navigation.goBack();
    // Note: onClose will be called by beforeRemove listener, no need to call it here
  };

  const _onNavigationStateChange = (navState: any) => {
    // HiveSigner redirects to a success URL after successful signing
    // Typically contains 'success' or returns to callback URL
    const { url } = navState;

    if (!url || successHandledRef.current) {
      return;
    }

    const result = parseHiveSignerSignResult(url, hsOptions.redirect_uri);

    if (result) {
      // Mark success as handled to prevent duplicate calls
      successHandledRef.current = true;
      // Transaction was successfully signed. Pass the confirmation through when the
      // callback carried one: the SDK gates recordActivity on the transaction id, so
      // without it the action earns nothing and never reaches quest progress.
      onSuccessRef.current?.(
        result.id
          ? ({
              id: result.id,
              block_num: result.blockNum,
              trx_num: result.trxNum,
              expired: false,
            } as unknown as TransactionConfirmation)
          : undefined,
      );
      navigation.goBack();
    }
  };

  const _safeAreaEdges = Platform.select({ ios: [], default: ['top'] });

  // Render HiveAuth status for HiveAuth operations
  if (isHiveAuthOperation) {
    return (
      <SafeAreaView style={styles.container} edges={_safeAreaEdges as any}>
        <ModalHeader
          title={intl.formatMessage({ id: 'hiveauth.title' })}
          isCloseButton={true}
          onClosePress={_onClose}
        />
        <View style={{ flex: 1, padding: 16 }}>
          <StatusContent status={hiveAuth.status} statusText={hiveAuth.statusText} />
        </View>
      </SafeAreaView>
    );
  }

  // Return null if hiveuri is missing for HiveSigner operations
  if (!hiveuri) {
    return null;
  }

  // Ask HiveSigner to hand the broadcast result back. Without a redirect_uri (or a
  // callback baked into the uri) it simply stops on its own success page, which is why
  // the signing path never had a transaction id to record the point activity with. The
  // loopback URI is the one already registered for this client and used by the OAuth
  // login flow: the WebView never actually loads it, it only reads the query params off
  // the navigation attempt.
  const _hsUri = `${hsOptions.base_url}${hiveuri.substring(7)}${
    hiveuri.includes('?') ? '&' : '?'
  }redirect_uri=${encodeURIComponent(hsOptions.redirect_uri)}`;

  // Render HiveSigner WebView for HiveSigner operations
  return (
    <SafeAreaView style={styles.container} edges={_safeAreaEdges as any}>
      <ModalHeader
        title={intl.formatMessage({ id: 'qr.confirmTransaction' })}
        isCloseButton={true}
        onClosePress={_onClose}
      />
      <WebView
        style={{ flex: 1 }}
        source={{ uri: _hsUri }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onNavigationStateChange={_onNavigationStateChange}
      />
    </SafeAreaView>
  );
};

export default HiveSignerModal;
