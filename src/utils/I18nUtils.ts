import { Alert, NativeModules } from 'react-native';
import RNRestart from 'react-native-restart';
import rtlDetect from 'rtl-detect';

export const isRTL = () => NativeModules.I18nManager.isRTL;

export const languageRestart = (prevLang, lang, intl) => {
  if (prevLang != lang) {
    // if selected lang is RTL, switch the layout
    if (rtlDetect.isRtlLang(lang)) {
      NativeModules.I18nManager.forceRTL(true);
    } else {
      NativeModules.I18nManager.forceRTL(false);
    }

    // if any prevLang or curr Lang is of different layout, alert user and restart
    if (rtlDetect.isRtlLang(prevLang) !== rtlDetect.isRtlLang(lang)) {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.restart_ecency',
        }),
        intl.formatMessage({
          id: 'alert.restart_ecency_desc',
        }),
        [
          {
            text: intl.formatMessage({
              id: 'alert.cancel',
            }),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: intl.formatMessage({
              id: 'alert.confirm',
            }),
            onPress: () => RNRestart.Restart(),
          },
        ],
      );
    }
  }
};
