import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    justifyContent: 'center',
  },
  topContent: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContent: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContent: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    padding: 10,
    color: '$primaryBlack',
    width: 172,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    padding: 10,
    color: '$primaryBlack',
    width: 172,
    height: 75,
  },
  description: {
    color: '$iconColor',
  },
  button: {
    width: '$deviceWidth / 3',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
  icon: {
    fontSize: 40,
    color: '$iconColor',
    marginHorizontal: 20,
  },
  rowTextStyle: {
    fontSize: 12,
    color: '$primaryDarkGray',
    padding: 5,
  },
  dropdownText: {
    fontSize: 14,
    paddingLeft: 16,
    paddingHorizontal: 14,
    color: '$primaryDarkGray',
  },
  dropdownStyle: {
    marginTop: 15,
    minWidth: 192,
    width: 192,
    maxHeight: '$deviceHeight - 200',
  },
  dropdownButtonStyle: {
    borderColor: '$borderColor',
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
});
