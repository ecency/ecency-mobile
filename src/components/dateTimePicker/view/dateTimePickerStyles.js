import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  btnConfirm: {
    color: '$iconColor',
  },
  btnTextCancel: {
    color: '$iconColor',
  },
  datePicker: {
    marginTop: 42,
    borderTopColor: '$borderColor',
    borderTopWidth: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  dateText: {
    color: '$primaryDarkText',
  },
  btnText: {
    position: 'absolute',
    top: 0,
    height: 42,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerCon: {
    backgroundColor: '$primaryBackgroundColor',
  },
  scheduleIcon: {
    color: '$iconColor',
  },
  iconButton: {
    marginRight: 24,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  picker: {
    width: 50,
  },
});
