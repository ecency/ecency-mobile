import { Platform, StatusBar } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

export default EStyleSheet.create({
  tabbar: {
    alignSelf: 'center',
    backgroundColor: '$primaryBackgroundColor',
    shadowOpacity: 0.2,
    shadowColor: '$shadowColor',
    shadowOffset: { height: 4 },
    zIndex: 99,
  },
  tabbarItem: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: Platform.select({ ios: getStatusBarHeight() + 4, android: StatusBar.currentHeight + 4 }),
    justifyContent: 'center',
  },

  deleteButton: {
    height: 44,
    width: 54,
    borderRadius: 0,
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '$primaryRed',
  },
});
