import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    height: '$deviceHeight',
    backgroundColor: '$primaryBackgroundColor',
  },
  image: {
    width: '$deviceWidth - 40',
    height: 192,
    marginTop: 16,
  },
  text: {
    color: '$primaryDarkGray',
    fontSize: 14,
    marginTop: 12,
    fontWeight: 'bold',
  },
});
