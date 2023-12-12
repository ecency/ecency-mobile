import { ImageStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: 'transparent',
    paddingBottom:12,
    zIndez:999
  },
  sheetIndicator:{
    backgroundColor: 'transparent'
  },

  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },

  modalContainer: {
    marginHorizontal:16,
    borderRadius: 16,
    backgroundColor: '$primaryBackgroundColor',
    borderWidth:EStyleSheet.hairlineWidth,
    borderColor:'$iconColor',
    paddingVertical:16,
  },

  cancelButton: {
    marginRight: 10,
  },
  modalHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  titleBtnTxt: {
    fontSize: 18,

    fontWeight: 'bold',
    color: '$primaryBlack',
  },
  summaryStyle: {
    fontSize: 16,
    paddingHorizontal: 16,
    color: '$primaryDarkGray',
    fontWeight: '500',
  },
  inputContainer: {
    paddingVertical: 6,
    minHeight: 120,
    maxHeight: 200
  },
  textInput: {
    color: '$primaryBlack',
    paddingHorizontal: 16,
    fontSize: 16,
    flexGrow: 1,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
  mediaItem: {
    marginLeft: 8,
    height: 96,
    width: 96,
    borderRadius: 16,
    backgroundColor: '$primaryLightBackground',
    justifyContent: 'center',
    alignItems: 'center',
  } as ImageStyle,
  minusContainer: {
    position: 'absolute',
    top: 8,
    left: 14,
    backgroundColor: '$primaryRed',
    borderRadius: 16,
    padding: 2,
  } as ViewStyle,
  toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  toolbarSpacer: {
    marginLeft: 8,
  } as ViewStyle,
});
