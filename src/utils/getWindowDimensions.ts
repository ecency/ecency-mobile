import { Dimensions } from 'react-native';
import {getOrientation, getInitialOrientation} from 'react-native-orientation-locker';
import { orientations } from '../redux/constants/orientationsConstants';


const getWindowDimensions = () => {
  const orientation = getOrientation ? getOrientation() : getInitialOrientation();
  const isDeviceRotated = orientation !== orientations.PORTRAIT;

  const width = isDeviceRotated
    ? Dimensions.get('window').height
    : Dimensions.get('screen').width;
  const height = isDeviceRotated
    ? Dimensions.get('window').width
    : Dimensions.get('screen').height;

  return {
    width,
    height
  }
} 

export default getWindowDimensions;
