import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  userContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
    paddingVertical: 8,
    marginBottom: -16,
    paddingLeft: 32,
  },
  avatarStyle: {
    width: 72,
    height: 72,
    borderRadius: 66,
    borderColor: '$primaryBlue',
    borderWidth: 4,
  },
  usernameContainer: {
    zIndex: -1,
    paddingVertical: 8,
    paddingRight: 20,
    paddingLeft: 16,
    marginLeft: -8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '$primaryBlue',
  },
  usernameText: {
    color: '$white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
