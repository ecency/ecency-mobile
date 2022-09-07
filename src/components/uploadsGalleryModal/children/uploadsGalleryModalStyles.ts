import { TextStyle, StyleSheet, ViewStyle, ImageStyle, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const thumbSize = 96;

export default EStyleSheet.create({
  modalStyle: {
    height: 112,
    borderTopWidth: Platform.select({
      android:1,
      ios:0
    }),
    borderBottomWidth: 1,
    borderColor: '$primaryLightBackground'
  },
  container: {
    flex: 1,
    width:'$deviceWidth',
  },
  floatingContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '$primaryBackgroundColor'
  } as ViewStyle,

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

  emptyText:{
    fontWeight: '700',
    flex: 1,
    fontSize: 16,
    color: '$primaryBlack',
    marginLeft:12,
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
    paddingVertical:8,
    height: thumbSize
  } as ViewStyle,

  selectButtonLabel:{
    fontSize: 16,   
    textAlignVertical:'top', 
    color: '$primaryBlack',
    marginBottom:4,
  } as TextStyle,

  addButton:{
    height:thumbSize,
    width:thumbSize/1.8,
    backgroundColor:'$primaryLightBackground',
    marginLeft:16,
    borderRadius:20,
  } as ViewStyle,
  

  itemIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$primaryRed',

  } as ViewStyle,

  checkContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20
  } as ViewStyle,

  checkStyle: {
    backgroundColor: '$white',
  } as ViewStyle,

  listEmptyFooter: {
    height: 80,
  } as ViewStyle,

  thumbPlaceholder:{
    height: thumbSize,
    width: thumbSize,
    backgroundColor:'$primaryLightBackground',
    marginLeft:8,
    borderRadius:20,
    justifyContent:'center',
    alignItems:'center'
  } as ViewStyle

})
