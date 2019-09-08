import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    width: '$deviceWidth',
    height: 50,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    elevation: 3,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
  },
});
