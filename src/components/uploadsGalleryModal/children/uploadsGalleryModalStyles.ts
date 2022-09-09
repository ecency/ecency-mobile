import { TextStyle, StyleSheet, ViewStyle, ImageStyle, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const thumbSize = 96;

export default EStyleSheet.create({
  modalStyle: {
    height: 112,
    borderTopWidth: Platform.select({
      android: 1,
      ios: 0
    }),
    borderBottomWidth: 1,
    borderColor: '$primaryLightBackground'
  },
  container: {
    flex: 1,
    width: '$deviceWidth',
  },


  mediaItem: {
    marginLeft: 8,
    height: thumbSize,
    width: thumbSize,
    borderRadius: 16,
    backgroundColor: '$primaryLightGray'
  } as ImageStyle,

  inputContainer: {
    flex: 1
  } as ViewStyle,
  titleInput: {
    color: '$primaryBlack',
    fontWeight: 'bold',
    fontSize: 18,
    textAlignVertical: 'top',
    paddingVertical: 0,
    backgroundColor: '$primaryBackgroundColor',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '$primaryDarkGray'
  } as TextStyle,

  title: {
    fontWeight: '700',
    flex: 1,
    fontSize: 16,
    color: '$primaryBlack',
  } as TextStyle,

  emptyText: {
    fontWeight: '700',
    flex: 1,
    fontSize: 16,
    color: '$primaryBlack',
    marginLeft: 12,
  },

  btnText: {
    color: '$pureWhite'
  } as TextStyle,
  saveButton: {

    backgroundColor: '$primaryBlue',
    width: 150,
    paddingVertical: 16,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center'
  } as ViewStyle,
  closeButton: {
    marginRight: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  } as ViewStyle,
  actionPanel: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16
  } as ViewStyle,

  itemIcon: {
    color: '$white',
  } as ViewStyle,

  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
    marginRight: 2,
  } as ViewStyle,

  selectButtonsContainer: {
    justifyContent: 'space-around',
    flex: 1,
    paddingVertical: 8,
    height: thumbSize
  } as ViewStyle,

  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
  } as ViewStyle,

  selectBtnPlus: {
    marginRight: -8,
    marginTop: -16,
    zIndex: 2,
    borderRadius: 12,
    backgroundColor: "$primaryBlack"
  } as ViewStyle,

  selectButtonLabel: {
    fontSize: 16,
    textAlignVertical: 'top',
    color: '$primaryBlack',
    marginLeft: 4
  } as TextStyle,

  uploadsBtnContainer: {
    height: thumbSize,
    width: thumbSize / 1.8,
    backgroundColor: '$primaryLightBackground',
    marginLeft: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  } as ViewStyle,

  uploadsActionBtn: {
    height: thumbSize / 1.8,
    width: thumbSize / 1.8,
    borderRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  } as ViewStyle,


  itemIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$primaryRed',

  } as ViewStyle,

  minusContainer: {
    position: 'absolute',
    top: 8,
    left: 16,
    backgroundColor: '$primaryRed',
    borderRadius: 16,
    padding: 2,
  } as ViewStyle,

  counterContainer: {
    position: 'absolute',
    top: 8,
    left: 16,
    backgroundColor: '$iconColor',
    borderRadius: 16,
    padding: 2,
    height: 24,
    width: 24,
    justifyContent:'center',
    alignItems:'center'
  } as ViewStyle,

  counterText:{
    color:'$pureWhite',
    fontSize:16
  } as TextStyle,
  


  checkStyle: {
    backgroundColor: '$white',
  } as ViewStyle,

  listEmptyFooter: {
    height: 80,
  } as ViewStyle,

  thumbPlaceholder: {
    height: thumbSize,
    width: thumbSize,
    backgroundColor: '$primaryLightBackground',
    marginLeft: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  } as ViewStyle

})
