import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ImageStyle } from 'react-native-fast-image';

export default EStyleSheet.create({
  hiveEngineWrapper: {
    position: 'absolute',
    top: -6,
    right: 4,
    borderRadius: 10,
    padding: 1,
    backgroundColor: '$pureWhite',
  } as ViewStyle,
  hiveEngineLogo: {
    height: 14,
    width: 14,
  } as ImageStyle,
  logo: {
    height: 30,
    width: 30,
  } as ImageStyle,
});
