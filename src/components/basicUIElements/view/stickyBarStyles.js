import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '$white',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '$deviceWidth',
    height: 50,
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1.5,
    },
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
  },
});
