import EStyleSheet from 'react-native-extended-stylesheet';
import { isRTL } from '../../utils/I18nUtils';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    justifyContent: 'center',
  },
  balanceText: {
    fontSize: 14,
    color: '$primaryDarkGray',
    alignSelf: 'center',
    marginLeft: 20,
    marginBottom: 10,
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
    zIndex: -1,
  },
  input: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '$primaryBlack',
    width: 172,
  },
  autocomplete: {
    borderWidth: 0,
    borderColor: '$borderColor',
    borderRadius: 8,
    padding: 2,
    // color: '$primaryBlack',
    width: 172,
    marginRight: 33,
  },
  autocompleteLineContainer: {
    flexDirection: 'row',
    zIndex: 999,
  },
  autocompleteLabelText: {
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'left',
  },
  autocompleteListContainer: {
    backgroundColor: '$primaryWhiteLightBackground',
    width: 172,
    zIndex: 999,
  },
  autocompleteItemText: {
    color: '$primaryBlack',
    padding: 3,
  },
  autocompleteList: {
    zIndex: 999,
    backgroundColor: '$primaryWhiteLightBackground',
  },
  autocompleteLabelContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    color: '$primaryBlack',
    maxWidth: '$deviceWidth / 2.9',
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
    paddingLeft: 12,
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
    width: 130,
  },
  slider: {
    flex: 1,
    marginHorizontal: 30,
  },
  amountText: {
    color: '$primaryBlue',
  },
  iconButton: {
    borderColor: 'red',
    borderWidth: 1,
    width: 25,
    height: 25,
    borderRadius: 5,
  },
  total: {
    marginVertical: 15,
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  price: {
    fontSize: 22,
    color: '$primaryBlue',
    fontWeight: 'bold',
  },
  esteem: {
    fontSize: 15,
    color: '$primaryBlue',
  },
  quickButtons: {
    width: 55,
    height: 55,
    justifyContent: 'center',
  },
  quickButtonsWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  infoWrapper: {
    backgroundColor: '$primaryLightBackground',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 8,
    marginTop: 40,
  },
  infoIcon: {
    color: '$primaryDarkGray',
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
    color: '$primaryDarkGray',
  },
});
