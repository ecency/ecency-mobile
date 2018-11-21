import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '$primaryDarkGray',
    fontSize: 14,
    fontWeight: 'bold',
    flexGrow: 1,
  },
  dropdownText: {
    fontSize: 14,
    paddingLeft: 16,
    paddingHorizontal: 14,
    color: '$primaryDarkGray',
  },
  rowTextStyle: {
    fontSize: 14,
    color: '$primaryDarkGray',
    padding: 5,
  },
  dropdownStyle: {
    marginRight: -35,
    marginTop: 15,
  },
  dropdownButtonStyle: {
    backgroundColor: '$primaryGray',
    height: 44,
    width: 172,
    borderRadius: 8,
  },
  dropdown: {
    flexGrow: 1,
  },
  textStyle: {
    color: '$primaryBlue',
  },
  textButton: {
    justifyContent: 'center',
  },
});
