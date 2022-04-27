import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  mainContainer:{
    flex:1,
    backgroundColor: '$primaryBackgroundColor',
  },
  versionsListContainer: {
    paddingBottom: 32,
    paddingTop: 16,
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
  },
  previewScrollContentContainer: {
    paddingHorizontal: 16,
  },
  postHeaderContainer: {
    paddingVertical: 12,
  },
  postHeaderTitle: {
    fontSize: 24,
    color: '$primaryBlack',
    fontWeight: 'bold',
    fontFamily: '$primaryFont',
    marginBottom: 11,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tags: {
    fontSize: 14,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    marginLeft: 12,
  },
  tagIcon: {
    color: '$primaryDarkGray'
  },
  rightIcon: {
    backgroundColor: '$primaryDarkGray',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  titleDiff: {
    fontSize: 24,
    color: '$primaryBlack',
    fontWeight: 'bold',
    fontFamily: '$primaryFont',
    marginBottom: 11,
  },
  bodyDiff: {
    fontSize: 16,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    marginTop: 12,
  },
});
