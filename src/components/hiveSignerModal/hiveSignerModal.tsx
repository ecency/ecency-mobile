import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import WebView from 'react-native-webview';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hsOptions } from '../../constants/hsOptions';
import styles from './hiveSignerModal.styles';
import { ModalHeader } from '../modalHeader';

// TODO: later handle other operations like opsArray and logging in
export const HiveSignerModal = ({ route, navigation }) => {
  const intl = useIntl();

  const { hiveuri, onClose, onSuccess } = route.params || {};
  const successHandledRef = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // Don't call onClose if success was already handled
      if (!successHandledRef.current) {
        onClose && onClose();
      }
    });

    return unsubscribe;
  }, [navigation, onClose]);

  const _onClose = () => {
    // Don't call onClose if success was already handled
    if (successHandledRef.current) {
      return;
    }
    navigation.goBack();
    onClose && onClose();
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
      onSuccess && onSuccess();
      navigation.goBack();
    }
  };
  if (!hiveuri) {
    navigation.goBack();
    onClose && onClose();
    return null;
  }
  const _hsUri = `${hsOptions.base_url}${hiveuri?.substring(7)}`;

  const _safeAreaEdges = Platform.select({ ios: [], default: ['top'] });

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
