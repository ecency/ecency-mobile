import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  headerContainer: {
    height: 100,
    flexDirection: 'row',
    padding: 21,
  },
  backIcon: {
    color: '$white',
  },
  wrapper: {
    marginLeft: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    marginLeft: 16,
  },
  name: {
    color: '$white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  username: {
    color: '$white',
    fontSize: 12,
    marginTop: 4,
  },
  addIcon: {
    color: '$white',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '$iconColor',
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    borderColor: '$white',
    borderWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 45,
  },
});
