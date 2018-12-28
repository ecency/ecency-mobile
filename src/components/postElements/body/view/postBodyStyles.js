import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  text: {
    fontSize: 12,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
  },
  container: {
    paddingHorizontal: 0,
    marginTop: 10,
  },
  a: {
    color: '$primaryBlue',
    fontFamily: '$primaryFont',
  },
  img: {
    left: -16,
    // height: 50,
  },
  ul: {
    color: 'red',
  },
  commentContainer: {
    paddingHorizontal: 0,
    marginTop: 20,
  },
});
