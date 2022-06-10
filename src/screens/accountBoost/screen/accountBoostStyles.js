import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  mainContainer: {
    justifyContent: 'space-around',
    backgroundColor: '$primaryBackgroundColor',
    flex: 1,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$primaryBackgroundColor',
  },
  userContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
    paddingVertical: 12,
    paddingLeft: 20,
  },
  avatarStyle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderColor: '$primaryBlue',
    borderWidth: 3,
  },
  usernameText: {
    backgroundColor: '$primaryBlue',
    color: '$white',
    paddingVertical: 6,
    paddingRight: 16,
    paddingLeft: 20,
    marginLeft: -8,
    zIndex: -1,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    fontWeight: '700',
  },
  logoEstm: {
    width: '$deviceWidth / 1.4',
    height: '$deviceHeight / 3',
  },
  desc: {
    width: '$deviceWidth / 1.5',
    fontSize: 16,
    textAlign: 'center',
    color: '$primaryDarkGray',
  },
  productsWrapper: {
    paddingVertical: 12,
  },
});
