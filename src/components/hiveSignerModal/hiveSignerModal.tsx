import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import WebView from 'react-native-webview';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hsOptions } from '../../constants/hsOptions';
import styles from './hiveSignerModal.styles';
import { ModalHeader } from '../modalHeader';

// TODO: later handle other operations liek opsArray and logging in
export const HiveSignerModal = ({ route, navigation }) => {
  const intl = useIntl();

  const { hiveuri, onClose, onSuccess } = route.params || {};

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      onClose && onClose();
    });

    return unsubscribe;
  }, [navigation, onClose]);

  const _onClose = () => {
    navigation.goBack();
    onClose && onClose();
  };

  const _onNavigationStateChange = (navState: any) => {
    // HiveSigner redirects to a success URL after successful signing
    // Typically contains 'success' or returns to callback URL
    const { url } = navState;

    if (url && (url.includes('/sign/success') || url.includes('?success=true'))) {
      // Transaction was successfully signed
      navigation.goBack();
      onSuccess && onSuccess();
    }
  };

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
