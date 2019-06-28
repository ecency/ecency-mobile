import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'absolute',
    top: '$deviceHeight / 2.6',
    // backgroundColor: '$primaryBlue',
  },
  descriptionWrapper: {
    backgroundColor: '$primaryBlue',
    height: '$deviceHeight / 3',
  },
  title: {
    color: '$white',
    fontSize: 26,
    marginTop: 24,
    justifyContent: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 150,
    marginVertical: 8,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
});
