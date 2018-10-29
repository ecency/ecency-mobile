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
  scroll: {
    height: '$deviceHeight / 1.135',
  },
  tagsWrapper: {
    flexDirection: 'row',
    marginTop: 19,
    marginBottom: 12,
  },
});
