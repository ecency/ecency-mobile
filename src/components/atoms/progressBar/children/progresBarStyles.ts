import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$primaryLightBackground',
    flexDirection: 'row',
    borderRadius: 16,
    height: 16,
    alignSelf: 'stretch',
    marginHorizontal: 8,
    marginBottom: 12,
  },
  filled: {
    borderRadius: 16,
    backgroundColor: '$primaryBlue',
  },
});
