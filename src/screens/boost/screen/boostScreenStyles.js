import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'absolute',
    top: '$deviceHeight / 3',
    // backgroundColor: '$primaryBlue',
  },
  descriptionWrapper: {
    height: '$deviceHeight / 3.5',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    color: '$white',
    fontSize: 26,
    marginTop: 24,
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  description: {
    color: '$white',
    fontSize: 18,
    marginTop: 24,
    justifyContent: 'center',
  },
  button: {
    marginTop: 150,
    marginVertical: 8,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
});
