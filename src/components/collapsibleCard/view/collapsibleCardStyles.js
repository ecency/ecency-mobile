import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '$white',
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
    shadowOpacity: 0.8,
    borderWidth: 0.8,
    shadowColor: '#e7e7e7',
    borderColor: '#e7e7e7',
  },
  content: {
    backgroundColor: '$white',
  },
  contentBody: {
    paddingHorizontal: 12,
  },
});
