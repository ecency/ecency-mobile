import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '$white',
  },
  textWrapper: {
    flex: 1,
    flexDirection: 'column',
    fontSize: 12,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  inlinePadding: {
    padding: 8,
  },
  editorButtons: {
    flexDirection: 'row',
    backgroundColor: '$white',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1.5,
    },
  },
  leftButtonsWrapper: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '$deviceWidth / 1.85',
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
});
