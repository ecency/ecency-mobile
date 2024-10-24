import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '$primaryBackgroundColor',
    paddingTop: 8,
    paddingBottom: 12,
  },
  containerReverse: {
    justifyContent: 'space-between',
    flexDirection: 'row-reverse',
  },
  avatarWrapper: {
    justifyContent: 'center',
  },
  avatarButtonWrapperReverse: {
    borderTopLeftRadius: 68 / 2,
    borderBottomLeftRadius: 68 / 2,
  },
  avatarButtonWrapper: {
    backgroundColor: '#357ce6',
    height: 50,
    width: 68,
    justifyContent: 'center',
  },
  avatarDefault: {
    borderTopRightRadius: 68 / 2,
    borderBottomRightRadius: 68 / 2,
    overflow: 'hidden',
  },
  titleWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginHorizontal: 8,
    flex: 2,
  },
  titleWrapperReverse: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '$primaryDarkText',
  },
  noAuthTitle: {
    fontSize: 14,
    color: '$iconColor',
  },
  subTitle: {
    color: '$primaryDarkText',
    fontSize: 12,
  },
  avatar: {
    alignSelf: 'flex-end',
    marginRight: 12,
  },
  reverseAvatar: {
    alignSelf: 'flex-start',
    marginLeft: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '$iconColor',
    justifyContent: 'center',
  },
  viewIconContainer: {
    marginRight: 8,
  },
  viewIcon: {
    fontSize: 24,
    color: '$iconColor',
    justifyContent: 'center',
  },
  boostContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  boostIconContainer: {
    marginLeft: 6,
  },
  boostPlusIcon: {
    fontSize: 24,
    color: '$primaryBlue',
    justifyContent: 'center',
  },
  backButton: {
    marginLeft: 24,
  },
  reverseBackButtonWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  backButtonWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    marginRight: 16,
  },
});
