import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import WebView from 'react-native-webview';
import { hsOptions } from '../../constants/hsOptions';
import { View } from 'react-native';
import styles from './hiveSignerModal.styles';
import { ModalHeader } from '../../components/modalHeader';

//TODO: later handle other operations liek opsArray and logging in
export const HiveSignerModal = ({ route, navigation }) => {
  const intl = useIntl();

  const { hiveuri, onClose } = route.params || {};

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      onClose && onClose();
    });

    return unsubscribe;
  }, [navigation, onClose]);


  const _onClose = () => {
    navigation.goBack();
    onClose && onClose();
  };

  const _hsUri = `${hsOptions.base_url}${hiveuri?.substring(7)}`


  return (
    <View style={styles.container}>
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
      />
    </View>
  );
};

export default HiveSignerModal;
