import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Public Cloudflare Turnstile sitekey (Managed mode). The token is verified
// server-side in onboard; the secret never reaches the client. The widget runs in a
// WebView whose origin is forced to ecency.com via baseUrl so the sitekey's hostname
// check passes (it is enabled for ecency.com only). The token is bridged out via
// window.ReactNativeWebView.postMessage.
const TURNSTILE_SITEKEY = '0x4AAAAAADe6jH7FIi9dBzgR';
const BASE_URL = 'https://ecency.com';

const buildHtml = (sitekey: string) => `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <style>
      html, body { margin: 0; padding: 0; background: transparent; }
      .wrap { display: flex; justify-content: center; padding: 4px 0; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div
        class="cf-turnstile"
        data-sitekey="${sitekey}"
        data-callback="onVerify"
        data-expired-callback="onExpire"
        data-error-callback="onExpire"
      ></div>
    </div>
    <script>
      function post(type, token) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, token: token }));
        }
      }
      window.onVerify = function (token) {
        post('verify', token);
      };
      window.onExpire = function () {
        post('expire');
      };
    </script>
  </body>
</html>`;

interface Props {
  onVerify: (token: string) => void;
  onExpire: () => void;
  height?: number;
}

const TurnstileWebView = ({ onVerify, onExpire, height = 76 }: Props) => {
  const html = useMemo(() => buildHtml(TURNSTILE_SITEKEY), []);

  const _onMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'verify' && data.token) {
        onVerify(data.token);
      } else if (data.type === 'expire') {
        onExpire();
      }
    } catch (_err) {
      // ignore malformed bridge messages
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        source={{ html, baseUrl: BASE_URL }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        androidLayerType="software"
        style={styles.webview}
        onMessage={_onMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  webview: { backgroundColor: 'transparent' },
});

export default TurnstileWebView;
