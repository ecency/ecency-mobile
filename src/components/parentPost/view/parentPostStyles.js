import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    backgroundColor: '$primaryLightBackground',
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '$primaryBlack',
    marginVertical: 20,
    marginHorizontal: 10,
    padding: 5,
  },
  title: {
    fontSize: 14,
    marginBottom: 5,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    fontWeight: 'bold',
  },
  description: {
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    fontSize: 10,
  },
});
