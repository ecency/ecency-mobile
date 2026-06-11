import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// The Turnstile widget is served from a real ecency.com page instead of being
// injected as an inline HTML string. A hosted top-level load gives the widget a
// genuine first-party origin (the sitekey is enabled for ecency.com only) and a
// normal storage partition, both of which the Cloudflare Managed challenge needs
// to complete. An inline-HTML WebView (loadHTMLString + faked baseUrl) stalls on
// the "Verifying…" spinner forever on iOS. The hosted page bridges the resulting
// token back via window.ReactNativeWebView.postMessage.
const TURNSTILE_EMBED_URL = 'https://ecency.com/embed/turnstile';

interface Props {
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError?: () => void;
  height?: number;
}

const TurnstileWebView = ({ onVerify, onExpire, onError, height = 76 }: Props) => {
  const _onMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'verify' && data.token) {
        onVerify(data.token);
      } else if (data.type === 'expire') {
        onExpire();
      } else if (data.type === 'error') {
        onError?.();
      }
    } catch (_err) {
      // ignore malformed bridge messages
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        source={{ uri: TURNSTILE_EMBED_URL }}
        originWhitelist={['https://*']}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        scrollEnabled={false}
        androidLayerType="software"
        style={styles.webview}
        onMessage={_onMessage}
        onError={() => onError?.()}
        onHttpError={() => onError?.()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  webview: { backgroundColor: 'transparent' },
});

export default TurnstileWebView;
