import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  icon: {
    color: '$iconColor',
    marginRight: 2.7,
    fontSize: 25,
  },
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    height: '90%',
  },
  dropdownItem: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryDarkText',
  },
  indicator: {
    backgroundColor: '$iconColor',
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 40,
    height: '100%',
    paddingHorizontal: 16,
  },
  translatedTextContainer: {
    marginTop: 12,
    flex: 1,
  },
  translatedText: {
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    fontSize: 16,
    marginVertical: 12,
  },
  languageSelectorRow: {
    flexDirection: 'row',
    height: 60,
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
  languageDropdownStyle: {
    // marginTop: 15,
    // minWidth: 200,
    // width: 300,
    maxHeight: '$deviceHeight/2',
    borderRadius: 8,
    backgroundColor: '$primaryBackgroundColor',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  labelText: {
    color: '$primaryDarkGray',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
    marginRight: 8,
    // borderWidth:1,
    // width: 50,
  },
  toText: {
    marginLeft: 12,
  },
  dropdownBtnStyle: {
    borderColor: '$primaryGray',
    borderWidth: 1,
    height: 40,
    // width: 100,
    flex: 1,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: '$primaryBackgroundColor',
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownBtnTextStyle: {
    fontSize: 14,
    paddingLeft: 16,
    paddingHorizontal: 14,
    color: '$primaryDarkGray',
    flex: 1,
  },
  dropdownRowTextStyle: {
    color: '$primaryDarkGray',
    fontSize: 14,
  },
  dropdownSelectedRowStyle: {
    backgroundColor: '$primaryBlue',
  },
  dropdownSelectedRowTextStyle: {
    color: 'white',
    fontWeight: 'bold',
  },
});
