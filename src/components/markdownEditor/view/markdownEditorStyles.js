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
    paddingVertical: 16,
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
    marginRight: 16,
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
});
