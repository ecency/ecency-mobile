import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '$primaryBackgroundColor',
    // marginTop: 8,
    overflow: 'hidden',
  },
  containerWithBorder: {
    shadowOpacity: 0.8,
    borderWidth: 0.8,
    shadowColor: '#e7e7e7',
    borderColor: '$primaryGrayBackground',
  },
  content: {
    backgroundColor: '$primaryBackgroundColor',
    overflow: 'hidden',
  },
  contentBody: {
    paddingHorizontal: 12,
  },
});
