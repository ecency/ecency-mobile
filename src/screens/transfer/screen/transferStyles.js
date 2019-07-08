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
    fontWeight: 'bold',
  },
  stopButton: {
    width: '$deviceWidth / 3',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    fontWeight: 'bold',
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
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: '$primaryLightBackground',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.35,
    elevation: 3,
  },
  slider: {
    flex: 1,
    marginHorizontal: 30,
  },
  formButton: {
    padding: 12,
    borderRadius: 5,
    backgroundColor: '$primaryBlue',
    marginTop: 5,
  },
  formButtonText: {
    color: '$white',
    fontSize: 14,
  },
  amountText: {
    color: '$primaryBlue',
  },
  informationText: {
    alignSelf: 'center',
    color: '$iconColor',
    margin: 10,
  },
  spInformation: {
    backgroundColor: 'red',
    width: '$deviceWidth / 3',
    borderRadius: 5,
    margin: 5,
  },
  vestsInformation: {
    backgroundColor: 'gray',
    width: '$deviceWidth / 3',
    borderRadius: 5,
    margin: 5,
  },
  steemInformation: {
    backgroundColor: 'green',
    width: '$deviceWidth / 3',
    borderRadius: 5,
    margin: 5,
  },
  avatar: {
    marginBottom: 30,
  },
  destinationAccountsLists: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
  },
  iconButton: {
    borderColor: 'red',
    borderWidth: 1,
    width: 25,
    height: 25,
    borderRadius: 5,
  },
  crossIcon: {
    color: 'red',
  },
  informationView: {
    flexDirection: 'row',
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
  },
  incomingFundSteem: {
    color: 'green',
    fontSize: 20,
    marginVertical: 5,
  },
  incomingFundVests: {
    color: 'red',
    fontSize: 15,
    marginVertical: 5,
  },
  nextPowerDown: {
    marginVertical: 5,
  },
});
