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
    textAlign: 'left',
  },
  dropdownText: {
    fontSize: 14,
    paddingLeft: 16,
    paddingRight: 10,
    color: '$primaryDarkGray',
    flex: 1,
  },
  rowTextStyle: {
    fontSize: 12,
    color: '$primaryDarkGray',
    padding: 5,
    textAlign: 'left',
  },
  dropdownStyle: {
    marginTop: 4,
    minWidth: 192,
    width: 192,
    borderWidth: EStyleSheet.hairlineWidth,
    borderColor: '$primaryDarkGray',
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
    height: 'auto',
    width: 150,
    justifyContent: 'center',
  },
  textStyle: {
    color: '$primaryBlue',
  },
  textButton: {
    justifyContent: 'center',
  },
  iconBtn: {
    borderRadius: 0,
    width: 50,
  },
});
