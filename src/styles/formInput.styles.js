import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '$primaryGray',
    borderRadius: 5,
    padding: 15,
    minWidth: '$deviceWidth / 2',
  },
});
