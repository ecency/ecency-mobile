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

// Cloudflare's Managed challenge renders in a challenges.cloudflare.com iframe and runs its
// verification compute in nested SUB-frames across several schemes: about:srcdoc / about:blank
// and, on iOS, often blob: / data:. react-native-webview gates EVERY frame against
// originWhitelist, and the previous narrow list (['https://*', 'about:']) plus a handler that
// returned true only for https/about CANCELLED the challenge's blob:/data: frames, so it never
// issued a token and the widget stayed blank. about: alone was not enough.
//
// Fix: pass every frame to the handler (originWhitelist ['*']) and gate by SCHEME. Sub-frames
// are always allowed so the challenge's about:/blob:/data: frames load; a top-level navigation
// is allowed only over https, which still blocks a compromised page from steering the WebView
// to a top-level file:/javascript: navigation.
// The gate is https, NOT our origin, on purpose: iOS reports isTopFrame=false for sub-frames,
// but Android does NOT report isTopFrame and ALSO routes the challenge's https iframe
// (challenges.cloudflare.com) through this handler -- an origin-only check would block that
// frame and break Turnstile on Android.
const _shouldStartLoad = (req: { url: string; isTopFrame?: boolean }) =>
  req.isTopFrame === false || req.url.startsWith('https://');

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
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={_shouldStartLoad}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        scrollEnabled={false}
        androidLayerType="software"
        // Make the widget inspectable via Safari Web Inspector in dev builds only,
        // so a future challenge issue can be diagnosed on-device without shipping
        // an inspectable WebView to release/TestFlight.
        webviewDebuggingEnabled={__DEV__}
        style={styles.webview}
        onMessage={_onMessage}
        onError={() => setLoadFailed(true)}
        onHttpError={() => setLoadFailed(true)}
        // iOS kills the web content process under memory pressure, leaving a
        // permanently blank widget — surface the retry UI instead.
        onContentProcessDidTerminate={() => setLoadFailed(true)}
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
