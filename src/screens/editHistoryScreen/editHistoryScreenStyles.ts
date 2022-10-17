import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  versionsListContainer: {
    paddingBottom: 32,
    paddingTop: 16,
  },
  versionsListContentContainer: {
    paddingHorizontal: 16,
  },
  versionItemBtn: {
    // backgroundColor: '$primaryBlue',
    backgroundColor: '$iconColor',
    marginRight: 16,
    width: 150,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  versionItemBtnText: {
    color: '$pureWhite',
    fontSize: 14,
    fontWeight: '700',
  },
  versionItemBtnDate: {
    color: '$black',
    fontSize: 14,
  },
  previewScrollContentContainer: {
    paddingHorizontal: 16,
  },
  postHeaderContainer: {},
  postHeaderTitle: {
    fontSize: 24,
    color: '$primaryBlack',
    fontWeight: 'bold',
    fontFamily: '$primaryFont',
    marginBottom: 11,
  },
  postBodyText: {
    fontSize: 16,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  tags: {
    fontSize: 14,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
  },
  tagIcon: {
    color: '$primaryDarkGray',
    marginRight: 12,
  },
  rightIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  diffContainer: {
    paddingBottom: 20,
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
