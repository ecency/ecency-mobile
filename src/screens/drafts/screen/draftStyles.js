import EStyleSheet from 'react-native-extended-stylesheet';

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
});
