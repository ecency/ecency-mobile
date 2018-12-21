import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  text: {
    color: '$pureWhite',
    fontSize: 10,
    fontWeight: 'bold',
  },
  isPin: {
    backgroundColor: '$primaryBlue',
  },
  isPostCardTag: {
    backgroundColor: '$tagColor',
  },
  textWrapper: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginRight: 8,
    height: 22,
    backgroundColor: '$iconColor',
    borderRadius: 50,
  },
});
