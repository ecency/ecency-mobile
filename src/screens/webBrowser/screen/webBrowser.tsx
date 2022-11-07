import React, { useMemo } from 'react';
import { Alert, StatusBar, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

import { SafeAreaView } from 'react-native-safe-area-context';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import styles from './webBrowserStyles';
import { IconButton } from '../../../components';

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

  if (!url) {
    Alert.alert('DEV: url parameter cannot be empty');
  }

  const _onBackPress = () => {
    navigation.goBack();
  };

  const _renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>ECENCY</Text>
        </View>
        <IconButton
          iconStyle={styles.backIcon}
          iconType="MaterialIcons"
          name="arrow-back"
          onPress={_onBackPress}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {_renderHeader()}
      <WebView
        source={{
          uri: url,
        }}
      />
    </SafeAreaView>
  );
};

export default gestureHandlerRootHOC(WebBrowser);
