import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  post: {
    paddingTop: 10,
    marginBottom: 4,
    backgroundColor: '$primaryBackgroundColor',
  },

  commentButton: {
    padding: 0,
    margin: 0,
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  commentIcon: {
    alignSelf: 'flex-start',
    fontSize: 20,
    color: '$iconColor',
    margin: 0,
    width: 20,
    marginLeft: 25,
  },
  postBodyWrapper: {
    marginHorizontal: 9,
  },
  thumbnail: {
    margin: 0,
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: '$primaryLightBackground',
  },
  imageWrapper: {
    position: 'relative',
  },
  hiddenImages: {
    flexDirection: 'column',
  },
  postDescripton: {
    flexDirection: 'column',
    paddingHorizontal: 8,
    backgroundColor: '$primaryBackgroundColor',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '$primaryBlack',
  },
  summary: {
    fontSize: 16,
    color: '$primaryDarkGray',
    lineHeight: 22,
  },
  gifBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  gifBadgeText: {
    color: '$pureWhite',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bodyFooter: {
    backgroundColor: '$primaryBackgroundColor',
    flexDirection: 'row',
    margin: 16,
  },
  leftFooterWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  rightFooterWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  revealButton: {
    backgroundColor: '$primaryGrayBackground',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 8,
    marginHorizontal: 0,
  },
  revealText: {
    color: '$primaryDarkText',
    textAlign: 'center',
    fontSize: 18,
  },
  promotedText: {
    fontSize: 14,
    fontWeight: '300',
    color: '$primaryDarkGray',
    marginTop: 6,
    marginBottom: -8,
  },
});
