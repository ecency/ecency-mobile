import { Dimensions } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import { orientations } from '../redux/constants/orientationsConstants';
import isAndroidTablet from './isAndroidTablet';

/**
 *
 * @returns {
 *  width: width of window based on app orientation ;
 *  height: height of window baed on app orientation ;
 *  nativeWidth: width based on device orientation ;
 *  nativeHeight: height based on deivce orientation ;
 * }
 *
 */
const getWindowDimensions = () => {
  const { getInitialOrientation } = Orientation;
  const orientation = getInitialOrientation();
  const isDeviceRotated = orientation !== orientations.PORTRAIT;

  const nativeDimensions = Dimensions.get('window');

  const width = isDeviceRotated ? nativeDimensions.height : nativeDimensions.width;
  const height = isDeviceRotated ? nativeDimensions.width : nativeDimensions.height;

  if (isAndroidTablet()) {
    // return default dimension if device is android tablet.
    // There is an issue on certain android tablets in locking orientation which is handled separatly and used default dimensions
    return {
      width: nativeDimensions.width,
      height: nativeDimensions.height,
      nativeWidth: nativeDimensions.width,
      nativeHeight: nativeDimensions.height,
    };
  }
  return {
    width,
    height,
    nativeWidth: nativeDimensions.width,
    nativeHeight: nativeDimensions.height,
  };
};

export default getWindowDimensions;
