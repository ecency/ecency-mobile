import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  modalStyle: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 8,
  },

  container: {
    flex: 1,
  },

  userInfoContainer: {
    marginBottom: 8,
    alignItems: 'baseline',
  },

  userInfoWrapper: {
    backgroundColor: '$darkGrayBackground',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  usernameStyle: {
    fontSize: 18,
    color: '$pureWhite',
    fontWeight: 'bold',
  },

  emailStyle: {
    fontSize: 18,
    color: '$pureWhite',
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '$primaryBackgroundColor',
  },

  logoEstm: {
    width: 160,
    height: 160,
  },
  desc: {
    width: '$deviceWidth / 1.5',
    fontSize: 16,
    textAlign: 'center',
    color: '$primaryDarkGray',
  },
  productsWrapper: {
    paddingTop: 8,
    paddingBottom: 40,
    marginHorizontal: 16,
  },
  cardContainer: {
    backgroundColor: '$primaryLightBackground',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '$primaryBlack',
  },
  descContainer: {
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    color: '$primaryDarkText',
  },
  button: {
    backgroundColor: '$primaryBlue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '$pureWhite',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registeringContainer: {
    alignItems: 'center',
    flex: 1,
    marginTop: 120,
  },
  registeringText: {
    fontWeight: '600',
    fontSize: 18,
    marginTop: 16,
    color: '$primaryBlack',
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 44,
    paddingHorizontal: 16,
  },
});
