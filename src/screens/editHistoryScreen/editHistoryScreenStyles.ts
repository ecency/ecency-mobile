import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  mainContainer:{
    flex:1,
    backgroundColor: '$primaryBackgroundColor',
  },
  versionsListContentContainer: {
    paddingHorizontal: 16
  },
  versionItemBtn: {
    // backgroundColor: '$primaryBlue',
    backgroundColor: '$primaryDarkGray',
    marginRight: 16,
    width: 150,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  versionItemBtnText: {
    color: '$black',
    fontSize: 14,
    fontWeight: '700'
  },
  versionItemBtnDate: {
    color: '$black',
    fontSize: 14,
  }
});
