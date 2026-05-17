import { Alert } from 'react-native';

interface Params {
  intl: any;
  url: string;
  onConfirm: () => void;
}

/**
 * Warns the user before opening an untrusted post link inside the in-app
 * Explore dApp browser, which can access their Hive wallet for signing.
 * The full, raw URL is appended to the message body (outside formatMessage so
 * a URL containing `{`/`}` cannot break ICU parsing).
 */
const showExploreLinkWarning = ({ intl, url, onConfirm }: Params) =>
  Alert.alert(
    intl.formatMessage({ id: 'post.link_explore_warning_title' }),
    `${intl.formatMessage({ id: 'post.link_explore_warning_desc' })}\n\n${url}`,
    [
      {
        text: intl.formatMessage({ id: 'alert.cancel' }),
        style: 'cancel',
      },
      {
        text: intl.formatMessage({ id: 'alert.continue' }),
        onPress: onConfirm,
      },
    ],
  );

export default showExploreLinkWarning;
