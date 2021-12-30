import { NativeModules } from 'react-native';
import RNRestart from 'react-native-restart';
import rtlDetect from 'rtl-detect';

export const languageRestart = async (prevLang, lang) => {
  if (prevLang != lang) {
    // if selected lang is RTL, switch the layout
    if (rtlDetect.isRtlLang(lang)) {
      await NativeModules.I18nManager.forceRTL(true);
    } else {
      await NativeModules.I18nManager.forceRTL(false);
    }
    // restart the app to take changes in UI
    RNRestart.Restart();
  }
};
