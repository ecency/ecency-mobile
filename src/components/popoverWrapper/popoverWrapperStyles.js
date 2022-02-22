import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  popoverDetails: {
    flexDirection: 'row',
    width: '$deviceWidth / 2',
    borderRadius: 12,
    backgroundColor: '$primaryBackgroundColor',
  },
  arrow: {
    borderTopColor: '$primaryBackgroundColor',
  },
  popoverWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  overlay: {},
  popoverText: {
    color: '$primaryDarkText',
    textAlign: 'center',
  },
});
