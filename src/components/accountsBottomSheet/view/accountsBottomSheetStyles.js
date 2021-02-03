import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  contentContainer: {
    paddingVertical: 10,
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
  accountsModal: {
    backgroundColor: '$primaryBackgroundColor',
  },
  textButton: {
    color: '$primaryBlue',
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
  checkIcon: {
    color: '$successColor',
  },
  button: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: 50,
  },
});
