import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  badge: {
    color: '$primaryLightGray',
    alignItems: 'center',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeWrapper: {
    position: 'absolute',
    right: 10,
    top: 13,
    backgroundColor: '$primaryRed',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    padding: 2,
    height: 20,
    minWidth: 20,
    borderRadius: 20 / 2,
  },
});
