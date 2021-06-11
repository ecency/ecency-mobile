import React, {useMemo } from 'react';
import {Alert, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

import { SafeAreaView } from 'react-native-safe-area-context';
import { BasicHeader } from '../../components';
import {get} from 'lodash';

export interface WebBrowserParams {
    url:string;
}

interface Props {
  navigation:{
    state:{
      params:WebBrowserParams
    }
  }
}

const WebBrowser = (props:Props) => {

  const url = useMemo(() => get(props, 'navigation.state.params.url'), []);

  if(!url){
    Alert.alert("DEV: url parameter cannot be empty")
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar />
      <BasicHeader
        title="Ecency"
      />
      <WebView
        source={{
          uri: url,
        }}
      />
    </SafeAreaView>
  )
}


export default WebBrowser
