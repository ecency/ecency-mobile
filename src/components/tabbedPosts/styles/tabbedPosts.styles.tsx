import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$primaryLightBackground',
  },
  placeholder: {
    backgroundColor: '$primaryBackgroundColor',
    padding: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: '#e2e5e8',
    borderRadius: 5,
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10,
  },
  tabs: {
    position: 'absolute',
    top: '$deviceWidth / 30',
    alignItems: 'center',
  },
  flatlistFooter: {
    alignContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 60,
    borderColor: '$borderColor',
  },
  noImage: {
    width: 193,
    height: 189,
  },
  placeholderWrapper: {
    flex: 1,
  },
  noPostTitle: {
    textAlign: 'center',
    marginVertical: 16,
    color: '$primaryBlack',
  },
  closeIcon: {
    color: '$primaryGray',
    margin: 0,
    padding: 6,
  },
  moreIcon: {
    marginLeft: -4,
    borderWidth: EStyleSheet.hairlineWidth,
    borderColor: '$primaryGray',
    height: 20,
    width: 20,
  },
  emptyAnimationContainer: {
    marginTop: 56,
  },
  followText: {
    color: '$borderedButtonBlue',
    fontSize: 12,
    fontFamily: '$primaryFont',
    fontWeight: 'bold',

    borderColor: '$borderedButtonBlue',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  unfollowText: {
    color: '$primaryDarkGray',
    borderColor: '$primaryDarkGray',
  },
});
