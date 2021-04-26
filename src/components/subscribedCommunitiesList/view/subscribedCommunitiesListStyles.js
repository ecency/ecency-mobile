import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  itemWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderRadius: 8,
    backgroundColor: '$primaryBackgroundColor',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemWrapperGray: {
    backgroundColor: '$primaryLightBackground',
  },
  username: {
    marginLeft: 10,
    color: '$primaryBlack',
  },
  communityWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 8,
    backgroundColor: '$primaryBackgroundColor',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subscribeButton: {
    maxWidth: 75,
    borderWidth: 1,
    borderColor: '$primaryBlue',
  },
  subscribeButtonText: {
    textAlign: 'center',
    color: '$primaryBlue',
  },
  community: {
    justifyContent: 'center',
    marginLeft: 15,
    color: '$primaryBlack',
  },
  tabbarItem: {
    flex: 1,
  },
  noContentText: {
    textAlign: 'center',
    marginTop: 52,
    marginHorizontal: 32,
    color: '$primaryBlack',
  },
  discoverTextButton: {
    textAlign: 'center',
    marginTop: 24,
    marginHorizontal: 32,
    color: '$primaryBlue',
  },
});
