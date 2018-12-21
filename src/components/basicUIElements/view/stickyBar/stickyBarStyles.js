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
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1.5,
    },
    elevation: 3,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
  },
});
