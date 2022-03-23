import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  modalStyle: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 16,
  },
  container: {
    // flex: 1,
    // justifyContent: 'space-between',
    paddingVertical: 8,
  },
  bodyWrapper: {
    flex: 3,
    paddingHorizontal: 16,
  },
  floatingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '$primaryBackgroundColor',
  } as ViewStyle,
  insertBtn: {
    marginLeft: 16,
    width: 170,
  },
  inputsContainer: {
    paddingHorizontal: 16,
  },
  inputLabel: {
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '$primaryBlack',
    marginVertical: 8,
    height: 50,
  },
  validText: {
    color: '$primaryRed',
    marginVertical: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  optionBtnSelected: {
    maxWidth: 75,
    borderWidth: 1,
    borderColor: '$primaryBlue',
    backgroundColor: '$primaryBlue',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  optionBtnTextSelected: {
    textAlign: 'center',
    color: '$white',
    textTransform: "uppercase",
  },
  optionBtn: {
    maxWidth: 75,
    borderWidth: 1,
    borderColor: '$primaryBlue',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  optionBtnText: {
    textAlign: 'center',
    color: '$primaryBlue',
    textTransform: "uppercase",
  },
  previewContainer: {
    
  },
  previewText:{
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'left',
    paddingLeft: 16,
    marginVertical: 8,
  },
  previewWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$modalBackground',
    minHeight: 70,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  preview:{
    flex: 1,
  }
});
