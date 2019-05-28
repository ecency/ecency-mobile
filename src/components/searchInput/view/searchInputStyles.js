import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  inputWrapper: {
    marginTop: 20,
    backgroundColor: '$primaryLightBackground',
    flexDirection: 'row',
    height: 44,
    borderRadius: 8,
    padding: 5,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  icon: {
    alignSelf: 'center',
    color: '$iconColor',
    marginLeft: 16,
  },
  input: {
    color: '$primaryDarkGray',
    fontSize: 14,
    flexGrow: 1,
    padding: 7,
    maxWidth: '$deviceWidth - 100',
  },
  closeIconButton: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    justifyContent: 'center',
    alignSelf: 'center',
    marginRight: 16,
  },
  closeIcon: {
    color: '$iconColor',
    fontSize: 22,
  },
});
