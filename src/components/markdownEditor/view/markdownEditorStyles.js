import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '$primaryBackgroundColor',
  },
  textWrapper: {
    flex: 1,
    fontSize: 12,
    paddingTop: 16,
    paddingBottom: 0, // On android side, textinput has default padding
    paddingHorizontal: 16,
    color: '$primaryBlack',
    fontFamily: '$editorFont',
    textAlignVertical: 'top',
  },
  previewContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  inlinePadding: {
    padding: 8,
  },
  leftButtonsWrapper: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '$deviceWidth / 2',
  },
  rightButtonsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editorButton: {
    color: '$primaryDarkGray',
    marginRight: 15,
    height: 24,
  },
  dropdownStyle: {
    marginRight: 8,
  },
  rightIcons: {
    marginRight: 20,
  },
  dropdownIconStyle: {
    color: '$primaryDarkGray',
  },
  icon: {
    color: '$editorButtonColor',
  },
  clearButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 56,
    backgroundColor: '$primaryBlue',
  },
  clearIcon: {
    color: '$primaryLightGray',
  },
});
