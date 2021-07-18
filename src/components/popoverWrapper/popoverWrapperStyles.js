import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  popoverDetails: {
    flexDirection: 'row',
    width: '$deviceWidth / 2',
    borderRadius: 20,
    padding: 16,

    backgroundColor: '$primaryBackgroundColor',
  },
  arrow: {
    borderTopColor: '$primaryBackgroundColor',
  },
  popoverWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlay: {},
  popoverText: {
    color: '$primaryDarkText',
    textAlign: 'center',
  },
});
