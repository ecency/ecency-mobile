import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  header: {
    marginHorizontal: 16,
  },
  title: {
    fontSize: 24,
    color: '$primaryBlack',
    fontWeight: '900',
    fontFamily: '$primaryFont',
    marginBottom: 11,
  },
  description: {
    flexDirection: 'row',
  },
});
