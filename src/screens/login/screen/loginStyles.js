import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryLightBackground',
  },
  tabView: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  tabbar: {
    alignSelf: 'center',
    height: 40,
    backgroundColor: '$primaryBackgroundColor',
  },
  tabbarItem: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
    height: '$deviceHeight / 1.95',
  },
  mainButtonWrapper: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    flexDirection: 'row',
  },
  footerButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 45,
    left: '$deviceWidth / 2.3',
  },
});
