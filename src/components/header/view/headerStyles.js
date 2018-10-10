import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    width: '$deviceWidth',
    minHeight: 40,
    maxHeight: 74,
    backgroundColor: '$white',
  },

  avatarWrapper: {
    backgroundColor: '#357ce6',
    height: 50,
    width: 68,
    borderTopRightRadius: 68 / 2,
    borderBottomRightRadius: 68 / 2,
    justifyContent: 'center',
  },
  titleWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '$primaryDarkGray',
  },
  subTitle: {
    color: '$primaryDarkGray',
    fontSize: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    alignSelf: 'flex-end',
    marginRight: 12,
  },
});
