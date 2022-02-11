import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 35,
  },
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
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: 40,
    height: 40,
  },
  dropdownText: {
    fontSize: 10,
    color: '$primaryDarkText',
    padding: 5,
    borderColor: '$borderColor',
  },
  dropdownTextHighlight: {
    backgroundColor: '$primaryBlue',
    width: '$deviceWidth / 3',
  },
  button: {
    marginLeft: 25,
  },
  buttonText: {
    fontSize: 10,
    alignSelf: 'center',
    color: '$primaryDarkText',
    fontWeight: 'bold',
  },
  rowWrapper: {
    height: 35,
    justifyContent: 'center',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    width: '$deviceWidth / 2',
    padding: 5,
  },
  dropdownRow: {
    marginLeft: 30,
    justifyContent: 'center',
  },
  highlightedRow: {
    borderRadius: 20,
    height: 35,
    backgroundColor: '$primaryBlue',
    alignSelf: 'flex-start',
    paddingLeft: 11,
    paddingRight: 11,
    marginLeft: 20,
  },
  highlightedRowText: {
    color: '$primaryBackgroundColor',
    fontWeight: 'bold',
  },
  rowText: {
    fontSize: 10,
    color: '$primaryDarkGray',
    textAlign: 'left',
  },
  childrenWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
