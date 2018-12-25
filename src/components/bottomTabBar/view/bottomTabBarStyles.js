import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    height: 56,
    width: '$deviceWidth',
    backgroundColor: '$primaryBackgroundColor',
    borderTopWidth: 0.1,
    shadowOpacity: 0.1,
    elevation: 10,
  },
  safeArea: {
    backgroundColor: '$primaryBackgroundColor',
  },
});
