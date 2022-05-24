import EStyleSheet from 'react-native-extended-stylesheet';
import { getBottomSpace } from 'react-native-iphone-x-helper';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  container:{
    flex:1,
  },
  modalContainer: {
    // paddingVertical: 4,
    paddingBottom:getBottomSpace()
  },


  cancelButton: {
    marginRight: 10,
  },
  modalHeader: {
    paddingHorizontal: 12,
    paddingVertical:8,
  },
  titleBtnTxt: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '$primaryBlack',
  },
  summaryStyle:{
    fontSize:16,
    paddingHorizontal:16,
    color: '$primaryBlack',
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical:8,
    height:120,

  },
  textInput: {
    color: '$primaryBlack',
    fontSize: 16,
    flexGrow: 1,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal:16,
  },
  commentBtn: {
    width: 100,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replySection: {
    paddingTop: 10,
    paddingBottom: 0,
  },
  
  accountTile: {
    height: 60,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarAndNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:16,
    paddingTop:12,
    paddingBottom:8,
  },
  nameContainer: {
    marginLeft: 2,
  },
  name: {
    marginLeft: 4,
    color: '$primaryDarkGray',
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '$primaryBackgroundColor',
  },
  titleText: {
    color: '$primaryBlack',
    fontWeight: 'bold',
    fontSize: 10,
  },
});
