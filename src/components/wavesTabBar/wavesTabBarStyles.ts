import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';
import getWindowDimensions from '../../utils/getWindowDimensions';

const deviceWidth = getWindowDimensions().width;

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryBackgroundColor',
  } as ViewStyle,

  tabBarStyle: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    shadowColor: 'transparent',
    elevation: 0,
  } as ViewStyle,

  indicatorStyle: {
    backgroundColor: '$primaryBlue',
    height: 2,
  } as ViewStyle,

  tabStyle: {
    width: 'auto',
    minWidth: deviceWidth / 3 - 16,
    paddingHorizontal: 8,
    height: 40,
  } as ViewStyle,

  addButtonWrapper: {
    paddingHorizontal: 12,
    alignSelf: 'center',
  } as ViewStyle,

  addButtonIcon: {
    color: '$darkIconColor',
    textAlign: 'center',
  } as TextStyle,
});
