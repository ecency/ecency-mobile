import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export default () => {
  return Platform.OS === 'android' && DeviceInfo.isTablet();
};
