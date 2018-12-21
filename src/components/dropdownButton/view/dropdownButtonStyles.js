import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 35,
  },
  // dropdownText: {
  //   fontSize: 9,
  //   color: '$primaryDarkGray',
  //   marginLeft: 25,
  // },
  dropdownIcon: {
    fontSize: 22,
    color: '$primaryDarkGray',
    marginLeft: -10,
  },
  dropdown: {
    marginTop: 5,
    marginLeft: -2,
    paddingTop: 10,
    paddingBottom: 10,
    minWidth: '$deviceWidth / 2',
    borderColor: '$primaryGrayBackground',
    borderRadius: 5,
    shadowOpacity: 0.3,
    shadowColor: '$shadowColor',
    backgroundColor: '$primaryBackgroundColor',
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
    color: '$primaryDarkGray',
    padding: 5,
    borderColor: '#e7e7e7',
  },
  dropdownTextHighlight: {
    backgroundColor: '#387be5',
    width: '$deviceWidth / 3',
  },
  button: {
    marginLeft: 25,
  },
  buttonText: {
    fontSize: 10,
    alignSelf: 'center',
    color: '$primaryDarkGray',
    fontWeight: 'bold',
  },
  rowWrapper: {
    height: 35,
    justifyContent: 'center',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    width: '$deviceWidth / 2.5',
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
  },
});
