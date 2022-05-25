import { Dimensions } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import { orientations } from '../redux/constants/orientationsConstants';

const isDeviceRotated = Orientation.getInitialOrientation() !== orientations.PORTRAIT;
const deviceWidth = isDeviceRotated
  ? Dimensions.get('window').height
  : Dimensions.get('screen').width;
const deviceHeight = isDeviceRotated
  ? Dimensions.get('window').width
  : Dimensions.get('screen').height;

export const WINDOW_DIMENSIONS = { deviceWidth, deviceHeight };
