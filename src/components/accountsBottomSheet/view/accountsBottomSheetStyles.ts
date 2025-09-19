import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  contentContainer: {
    paddingTop: 10,
  },
  sheetContent: {
    backgroundColor: '$modalBackground',
  },
  sheetIndicator: {
    backgroundColor: '$primaryWhiteLightBackground',
  },
  accountTile: {
    height: 60,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    marginLeft: 8,
  },
  name: {
    color: '$primaryDarkGray',
  },
  textButton: {
    color: '$primaryDarkGray',
    fontWeight: '700',
    fontSize: 16,
    paddingVertical: 16,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    color: '$successColor',
  },
  authIconWrapper: {
    marginRight: 8,
  },
  authImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 8,
  },
  deleteIcon: {
    color: '$iconColor',
  },
  button: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
  },
  loggedOutAccountTileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
  },
  loggedOutAccountTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchingContainer: {
    marginVertical: 72,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchingText: {
    fontSize: 24,
    fontWeight: '300',
    color: '$primaryBlack',
    marginLeft: 16,
  },
});
