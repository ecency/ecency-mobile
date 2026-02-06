import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import WebView from 'react-native-webview';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Operation } from '@hiveio/dhive';
import { hsOptions } from '../../constants/hsOptions';
import styles from './hiveSignerModal.styles';
import { ModalHeader } from '../modalHeader';
import { useHiveAuth, HiveAuthStatus } from '../hiveAuthModal/hooks/useHiveAuth';
import { StatusContent } from '../hiveAuthModal/children/statusContent';
import AUTH_TYPE from '../../constants/authType';
import { useAppSelector } from '../../hooks';
import { selectCurrentAccount } from '../../redux/selectors';

export const HiveSignerModal = ({ route, navigation }) => {
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
          const success = await hiveAuth.broadcast(opsArray as Operation[]);
          if (success) {
            successHandledRef.current = true;
            onSuccessRef.current?.();
            navigation.goBack();
          } else {
            // Error already handled by useHiveAuth
            // Set flag to prevent duplicate onClose from beforeRemove listener
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
    onCloseRef.current?.();
  };

  const _onNavigationStateChange = (navState: any) => {
    // HiveSigner redirects to a success URL after successful signing
    // Typically contains 'success' or returns to callback URL
    const { url } = navState;

    if (!url || successHandledRef.current) {
      return;
    }

    // Parse URL robustly to detect success
    let isSuccess = false;
    try {
      if (url.includes('/sign/success')) {
        isSuccess = true;
      } else {
        const parsedUrl = new URL(url);
        const successParam = parsedUrl.searchParams.get('success');
        if (successParam === 'true') {
          isSuccess = true;
        }
      }
    } catch (error) {
      // If URL parsing fails, fall back to includes check
      if (url.includes('?success=true')) {
        isSuccess = true;
      }
    }

    if (isSuccess) {
      // Mark success as handled to prevent duplicate calls
      successHandledRef.current = true;
      // Transaction was successfully signed
      onSuccessRef.current?.();
      navigation.goBack();
    }
  };

  const _safeAreaEdges = Platform.select({ ios: [], default: ['top'] });

  // Render HiveAuth status for HiveAuth operations
  if (isHiveAuthOperation) {
    return (
      <SafeAreaView style={styles.container} edges={_safeAreaEdges}>
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

  const _hsUri = `${hsOptions.base_url}${hiveuri.substring(7)}`;

  // Render HiveSigner WebView for HiveSigner operations
  return (
    <SafeAreaView style={styles.container} edges={_safeAreaEdges}>
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
