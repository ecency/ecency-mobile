import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  tabView: {
    alignSelf: 'center',
    backgroundColor: '$primaryBackgroundColor',
  },
  tabbar: {
    alignSelf: 'center',
    height: 40,
    backgroundColor: '$primaryBackgroundColor',
    shadowOpacity: 0.2,
    shadowColor: '$shadowColor',
    shadowOffset: { height: 4 },
    zIndex: 99,
    borderBottomColor: '$shadowColor',
    borderBottomWidth: 0.1,
  },
  tabbarItem: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    minWidth: '$deviceWidth',
  },
  tabs: {
    flex: 1,
  },
});
