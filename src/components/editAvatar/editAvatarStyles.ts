import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  headerView: {
    backgroundColor: '$primaryBackgroundColor',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryBackgroundColor',
  },
  backIcon: {
    color: '$white',
  },
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$primaryBackgroundColor',
  },
  textWrapper: {
    marginLeft: 24,
  },
  name: {
    color: '$white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  username: {
    marginTop: 4,
    fontSize: 16,
    color: '$primaryDarkText',
    fontWeight: '600',
  },
  addIcon: {
    color: '$white',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '$primaryBlue',
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    borderColor: '$white',
    borderWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 90,
  },
});
