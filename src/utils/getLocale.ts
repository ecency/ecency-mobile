import { NativeModules, I18nManager, Platform } from 'react-native';

const getLocale = (): string => {
  let locale = '';

  if (Platform.OS === 'ios') {
    locale =
      NativeModules.SettingsManager.getConstants().settings.AppleLocale ||
      NativeModules.SettingsManager.getConstants().settings.AppleLanguages[0];
  } else {
    locale = I18nManager.localeIdentifier;
  }

  return locale;
};

export default getLocale;
