import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
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
  const intl = useIntl();
  // A failed load of the hosted page (network error, or a 404 while the web
  // route is still deploying) is handled locally with a manual retry. It must
  // NOT call onError — that remounts the WebView in the parent and would refetch
  // the same failing URL in a tight loop. Only the Turnstile *challenge* errors
  // (delivered over the bridge) go through onError for a fresh challenge.
  const [loadFailed, setLoadFailed] = useState(false);

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

  if (loadFailed) {
    return (
      <View style={[styles.container, styles.center, { height }]}>
        <Text style={styles.errorText}>
          {intl.formatMessage({
            id: 'dapp_browser.page_load_failed',
            defaultMessage: 'Failed to load the page',
          })}
        </Text>
        <TouchableOpacity onPress={() => setLoadFailed(false)}>
          <Text style={styles.retryText}>
            {intl.formatMessage({ id: 'dapp_browser.retry', defaultMessage: 'Retry' })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        onError={() => setLoadFailed(true)}
        onHttpError={() => setLoadFailed(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  center: { alignItems: 'center', justifyContent: 'center' },
  webview: { backgroundColor: 'transparent' },
  errorText: { fontSize: 13, color: '#788187', marginBottom: 6 },
  retryText: { fontSize: 14, color: '#357ce6', fontWeight: '600' },
});

export default TurnstileWebView;
