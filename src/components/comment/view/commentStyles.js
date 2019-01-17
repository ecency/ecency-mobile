import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  leftIcon: {
    color: '$iconColor',
  },
  leftButton: {
    marginLeft: 10,
  },
  rightButton: {
    flexGrow: 1,
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 10,
    backgroundColor: '$iconColor',
    height: 15,
    width: 25,
  },
  moreIcon: {
    color: '$white',
    marginTop: -1,
  },
  bodyWrapper: {
    marginTop: -10,
  },
  footerWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
});
