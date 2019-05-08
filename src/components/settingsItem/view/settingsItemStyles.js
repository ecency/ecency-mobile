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
    fontSize: 12,
    color: '$primaryDarkGray',
    padding: 5,
  },
  dropdownStyle: {
    marginTop: 15,
    minWidth: 192,
    width: 192,
    maxHeight: '$deviceHeight - 200',
  },
  dropdownButtonStyle: {
    borderColor: '$primaryGray',
    borderWidth: 1,
    height: 44,
    width: 172,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  dropdown: {
    flexGrow: 1,
    width: 150,
  },
  textStyle: {
    color: '$primaryBlue',
  },
  textButton: {
    justifyContent: 'center',
  },
});
