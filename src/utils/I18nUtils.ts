import { Alert, NativeModules } from 'react-native';
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

    Alert.alert(
      'Restart Ecency?',
      'Press Ok to restart the ecency for changes to take immediate effect. Press Cancel for not restarting it. ',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => RNRestart.Restart() },
      ],
    );
  }
};
