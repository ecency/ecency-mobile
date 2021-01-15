import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    height: '$deviceHeight',
    width: '$deviceWidth',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  otherUserAvatar: {
    borderWidth: 0.1,
    borderColor: '$borderColor',
    marginLeft: -7,
    marginRight: 10,
  },
  userInfoWrapper: {
    alignSelf: 'center',
    marginLeft: 15,
    width: 120,
  },
  listItem: {
    marginVertical: 15,
  },
  listItemIcon: {
    color: '$iconColor',
    fontSize: 20,
    marginRight: 5,
    width: 20,
  },
  listItemText: {
    color: '$primaryDarkGray',
    marginLeft: 12,
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: '$primaryFont',
    textAlign: 'center',
    margin: 10,
    color: '$white',
    backgroundColor: 'transparent',
  },
  addAccountWrapper: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  itemWrapper: {
    flexDirection: 'row',
    marginLeft: 55,
  },
  versionText: {
    textAlign: 'center',
    color: '$iconColor',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    height: 16,
    width: 16,
  },
  accountTile: {
    height: 60,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  nameContainer: {
    marginLeft: 8,
  },
  displayName: {
    fontWeight: '600',
    fontSize: 16,
    color: '$primaryBlack',
  },
  name: {
    color: '$primaryDarkGray',
  },
  accountModal: {
    backgroundColor: '$primaryBackgroundColor',
  },
  textButton: {
    color: '$primaryBlue',
  },
  buttonContainer: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  separator: {
    backgroundColor: '$darkIconColor',
    height: 0.5,
  },
  avatarAndNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    color: '$successColor',
  },
});
