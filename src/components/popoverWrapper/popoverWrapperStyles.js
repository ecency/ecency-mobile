import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  popoverDetails: {
    flexDirection: 'row',
    height: 130,
    width: '$deviceWidth / 2',
    borderRadius: 20,
    paddingHorizontal: 26,
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
  },
});
