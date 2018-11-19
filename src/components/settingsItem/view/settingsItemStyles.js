import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    marginHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '$primaryDarkGray',
    fontSize: 14,
    fontWeight: 'bold',
    flexGrow: 1,
  },
});
