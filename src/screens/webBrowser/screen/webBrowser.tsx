import React, { useMemo, useState } from 'react';
import { Alert, ActivityIndicator, Share, View, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

import { SafeAreaView } from 'react-native-safe-area-context';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import styles from './webBrowserStyles';
import { BasicHeader } from '../../../components';

export interface WebBrowserParams {
  url: string;
}

interface Props {
  navigation: {
    goBack: () => void;
  };
  route: {
    params: WebBrowserParams;
  };
}

const WebBrowser = ({ navigation, route }: Props) => {
  const url = useMemo(() => route.params?.url, []);
  const intl = useIntl();

  const [isLoading, setIsLoading] = useState(true);

  if (!url) {
    Alert.alert('DEV: url parameter cannot be empty');
    navigation.goBack();
    return null;
  }

  const urlObj = new URL(url);
  const title = `${urlObj.host || urlObj.hostname}...`;

  const _handleRightIconPress = () => {
    Share.share({
      message: url,
    });
  };

  const _handleBrowserIconPress = () => {
    Linking.openURL(url);
  };

  const _onError = () => {
    Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader
        title={title}
        backIconName="close"
        rightIconName="share"
        iconType="MaterialIcons"
        rightIconBtnStyle={styles.rightIconContainer}
        handleRightIconPress={_handleRightIconPress}
        handleBrowserIconPress={_handleBrowserIconPress}
        isHasBrowserIcon
      />

      <View style={styles.container}>
        <WebView
          style={styles.webView}
          onLoadEnd={() => {
            setIsLoading(false);
          }}
          onError={_onError}
          source={{
            uri: url,
          }}
        />
        {isLoading && (
          <ActivityIndicator
            style={styles.loading}
            color={EStyleSheet.value('$primaryDarkGray')}
            size="large"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default gestureHandlerRootHOC(WebBrowser);
