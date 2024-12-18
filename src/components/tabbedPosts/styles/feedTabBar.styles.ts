import EStyleSheet from 'react-native-extended-stylesheet';
import { ViewStyle } from 'react-native';
import getWindowDimensions from '../../../utils/getWindowDimensions';

const deviceWidth = getWindowDimensions().width;

export default EStyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '$primaryLightBackground',
    shadowOpacity: 0.3,
    shadowColor: '$shadowColor',
    elevation: 0.1,
    shadowOffset: {
      height: 1,
    },
    zIndex: 99,
  },

  indicatorStyle: {
    backgroundColor: 'transparent',
  },
  tabStyle: {
    width: 'auto',
    minWidth: deviceWidth / 3 - 12,
    paddingHorizontal: 0,
    height: 38,
    paddingTop: 0,
  },
  tabBarStyle: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
    shadowColor: 'transparent',
  } as ViewStyle,

  dropdownWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginRight: 8,
    flex: 1,
  },
  filterBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightIconWrapper: {
    paddingRight: 12,
    paddingLeft: 8,
    width: 44,
    alignSelf: 'center',
  } as ViewStyle,
  rightIcon: {
    color: '$darkIconColor',
    textAlign: 'center',
  },
  rightIconPlaceholder: {
    marginRight: 8,
  },
});
