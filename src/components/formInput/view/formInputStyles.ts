import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 16,
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 2,
    backgroundColor: '$primaryWhiteLightBackground',
  },
  firstImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    top: 15,
    marginLeft: 8,
  },
  textInput: {
    flex: 1,
    flexDirection: 'row',
  },
  icon: {
    flex: 0.15,
    fontSize: 25,
    top: 18,
    left: 8,
    color: '$iconColor',
  },
  infoIconContainer: {
    right: 0,
    flex: 0.15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 25,
    color: 'red',
  },
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
