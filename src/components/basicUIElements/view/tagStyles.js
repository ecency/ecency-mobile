import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  text: {
    color: '$primaryBackgroundColor',
    fontSize: 10,
  },
  isPin: {
    backgroundColor: '$primaryBlue',
  },
  textWrapper: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginRight: 8,
    height: 15,
    backgroundColor: '$iconColor',
    borderRadius: 50,
  },
});
