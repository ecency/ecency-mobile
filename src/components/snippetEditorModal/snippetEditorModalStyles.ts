import { TextStyle, StyleSheet, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  modalStyle: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 8,
  },
  container: {
    flexGrow: 1,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  inputContainer: {
    flex: 1,
  } as ViewStyle,
  titleInput: {
    color: '$primaryBlack',
    fontWeight: 'bold',
    fontSize: 18,
    textAlignVertical: 'top',
    paddingVertical: 0,
    backgroundColor: '$primaryBackgroundColor',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '$primaryDarkGray',
  } as TextStyle,
  bodyWrapper: {
    fontSize: 16,
    paddingTop: 16,
    paddingBottom: 0, // On android side, textinput has default padding
    color: '$primaryBlack',
    textAlignVertical: 'top',
    backgroundColor: '$primaryBackgroundColor',
  },
  btnText: {
    color: '$pureWhite',
  } as TextStyle,
  saveButton: {
    backgroundColor: '$primaryBlue',
    width: 150,
    paddingVertical: 16,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  closeButton: {
    marginRight: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  actionPanel: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
});
