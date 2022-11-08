import { Platform } from 'react-native';

export default () => {
  return Platform.OS === 'android' && (Platform.Version === 26 || Platform.Version === 27);
};
