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
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
  } as ViewStyle,

  indicatorStyle: {
    backgroundColor: '$primaryBlue',
    height: 2,
  } as ViewStyle,

  // Only applied when scrolling (3+ tabs); the two base tabs are left to flex
  // evenly across the full width.
  tabStyleScroll: {
    width: 'auto',
    minWidth: deviceWidth / 3 - 16,
    paddingHorizontal: 12,
    height: 44,
  } as ViewStyle,

  addButtonWrapper: {
    paddingHorizontal: 14,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  addButtonIcon: {
    // Matches the main feed's "+" exactly (Ionicons "add" via iconType
    // "MaterialIcon", $darkIconColor) for cross-tab-bar consistency.
    color: '$darkIconColor',
    textAlign: 'center',
  } as TextStyle,
});
