import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  dropdownIcon: {
    fontSize: 22,
    color: '$primaryDarkText',
    marginLeft: -10,
  },
  dropdown: {
    marginTop: 5,
    marginLeft: -2,
    paddingTop: 10,
    paddingBottom: 10,
    minWidth: '$deviceWidth / 2',
    borderColor: '$primaryWhiteLightBackground',
    borderRadius: 5,
    shadowOpacity: 0.3,
    shadowColor: '$shadowColor',
    backgroundColor: '$primaryLightBackground',
    maxHeight: '$deviceHeight / 2',
  },
});
