import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  badge: {
    color: '$primaryLightGray',
    alignItems: 'center',
    fontSize: 10,
  },
  badgeWrapper: {
    position: 'absolute',
    right: 20,
    top: 13,
    backgroundColor: '$primaryRed',
    borderRadius: 20,
    borderColor: '$white',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    padding: 2,
    height: 20,
    // width: 20,
  },
});
